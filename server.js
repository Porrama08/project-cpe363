const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// เชื่อมต่อฐานข้อมูล
const db = new sqlite3.Database('./hotel.db');

// สร้างตารางข้อมูลต่างๆ
db.serialize(() => {
    // 1. ตารางห้องพัก (rooms)
    db.run(`CREATE TABLE IF NOT EXISTS rooms (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT, 
        price INTEGER, 
        stock INTEGER
    )`);

    // 2. ตารางสมาชิก (users)
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        fullname TEXT,
        phone TEXT
    )`);

    // 3. ตารางข้อมูลติดต่อ (contacts)
    db.run(`CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        subject TEXT,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // เพิ่มข้อมูลห้องพักเริ่มต้น (จะเพิ่มเฉพาะเมื่อตารางยังว่างอยู่)
    db.get("SELECT count(*) as count FROM rooms", (err, row) => {
        if (row && row.count === 0) {
            const initialRooms = [
                { name: 'Superior Room', price: 30000, stock: 10 },
                { name: 'Deluxe Room', price: 33000, stock: 11 },
                { name: 'Mandarin Junior Suite', price: 35000, stock: 10 },
                { name: 'Hype Park Junior Suite', price: 37000, stock: 11 },
                { name: 'Family Room', price: 28000, stock: 12 },
                { name: 'Madarin Family Room', price: 27000, stock: 13 },
                { name: 'Knightsbridge Family Room', price: 31000, stock: 14 },
                { name: 'Hyde Park Room', price: 36000, stock: 15 },
                { name: 'Turret Suite', price: 39000, stock: 9 },
                { name: 'Superior Suite', price: 150000, stock: 8 }
            ];
            const stmt = db.prepare("INSERT INTO rooms (name, price, stock) VALUES (?, ?, ?)");
            initialRooms.forEach(room => stmt.run(room.name, room.price, room.stock));
            stmt.finalize();
            console.log("✅ Initial room data inserted.");
        }
    });
});

// ---------------- API ENDPOINTS ----------------

// 1. ดึงข้อมูลห้องพักทั้งหมด
app.get('/api/rooms', (req, res) => {
    db.all("SELECT * FROM rooms", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 2. บันทึกการจองและตัดสต๊อกห้องพัก
app.post('/api/book', (req, res) => {
    const cart = req.body.cart; // รับข้อมูล { roomId: quantity }
    
    db.serialize(() => {
        const stmt = db.prepare("UPDATE rooms SET stock = stock - ? WHERE id = ?");
        for (const [roomId, qty] of Object.entries(cart)) {
            stmt.run(qty, roomId);
        }
        stmt.finalize();
        res.json({ success: true, message: "บันทึกการจองและตัดสต๊อกเรียบร้อยแล้ว!" });
    });
});

// 3. สมัครสมาชิกใหม่
app.post('/api/register', (req, res) => {
    const { username, password, fullname, phone } = req.body;
    const query = `INSERT INTO users (username, password, fullname, phone) VALUES (?, ?, ?, ?)`;
    
    db.run(query, [username, password, fullname, phone], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ success: false, message: "ชื่อผู้ใช้นี้มีอยู่ในระบบแล้ว" });
            }
            return res.status(500).json({ success: false, message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
        }
        res.json({ success: true, message: "สมัครสมาชิกสำเร็จ!" });
    });
});

// 4. บันทึกข้อมูลการติดต่อ (Contact Us)
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    const query = `INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)`;
    
    db.run(query, [name, email, subject, message], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: "ไม่สามารถส่งข้อความได้" });
        }
        res.json({ success: true, message: "ส่งข้อความสำเร็จ! เราจะติดต่อกลับหาคุณโดยเร็วที่สุด" });
    });
});

// 5. ดูข้อมูลการติดต่อทั้งหมด (สำหรับ Admin ตรวจสอบ)
app.get('/api/contacts', (req, res) => {
    db.all("SELECT * FROM contacts ORDER BY created_at DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// เริ่มต้น Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});