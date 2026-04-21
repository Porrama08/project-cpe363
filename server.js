const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // เสิร์ฟไฟล์ HTML, CSS, JS

// เชื่อมต่อฐานข้อมูล MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',          // เปลี่ยนเป็น user ของคุณ
    password: '!Frast2548',           // เปลี่ยนเป็น password ของคุณ
    database: 'hotel_db'    // ชื่อฐานข้อมูลที่ต้องสร้างไว้ก่อน
});

db.connect((err) => {
    if (err) {
        console.error('❌ เชื่อมต่อ MySQL ไม่ได้:', err.message);
        process.exit(1);
    }
    console.log('✅ เชื่อมต่อ MySQL สำเร็จ');
    createTables();
});

// สร้างตารางข้อมูลต่างๆ
function createTables() {
    // 1. ตารางห้องพัก (rooms)
    db.query(`CREATE TABLE IF NOT EXISTS rooms (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        name VARCHAR(255), 
        price INT, 
        stock INT
    )`, (err) => {
        if (err) console.error('Error creating rooms table:', err.message);
    });

    // 2. ตารางสมาชิก (users)
    db.query(`CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE,
        password VARCHAR(255),
        fullname VARCHAR(255),
        phone VARCHAR(50)
    )`, (err) => {
        if (err) console.error('Error creating users table:', err.message);
    });

    // 3. ตารางข้อมูลติดต่อ (contacts)
    db.query(`CREATE TABLE IF NOT EXISTS contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        subject VARCHAR(255),
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) console.error('Error creating contacts table:', err.message);
    });

    // เพิ่มข้อมูลห้องพักเริ่มต้น (จะเพิ่มเฉพาะเมื่อตารางยังว่างอยู่)
    db.query("SELECT count(*) as count FROM rooms", (err, results) => {
        if (err) return;
        if (results[0].count === 0) {
            const initialRooms = [
                ['Superior Room', 30000, 10],
                ['Deluxe Room', 33000, 11],
                ['Mandarin Junior Suite', 35000, 10],
                ['Hype Park Junior Suite', 37000, 11],
                ['Family Room', 28000, 12],
                ['Madarin Family Room', 27000, 13],
                ['Knightsbridge Family Room', 31000, 14],
                ['Hyde Park Room', 36000, 15],
                ['Turret Suite', 39000, 9],
                ['Superior Suite', 150000, 8]
            ];
            const query = "INSERT INTO rooms (name, price, stock) VALUES ?";
            db.query(query, [initialRooms], (err) => {
                if (err) console.error('Error inserting initial rooms:', err.message);
                else console.log("✅ Initial room data inserted.");
            });
        }
    });
}

// ---------------- API ENDPOINTS ----------------

// 1. ดึงข้อมูลห้องพักทั้งหมด
app.get('/api/rooms', (req, res) => {
    db.query("SELECT * FROM rooms", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// 2. บันทึกการจองและตัดสต๊อกห้องพัก
app.post('/api/book', (req, res) => {
    const cart = req.body.cart; // รับข้อมูล { roomId: quantity }
    
    const updates = Object.entries(cart).map(([roomId, qty]) => {
        return new Promise((resolve, reject) => {
            db.query("UPDATE rooms SET stock = stock - ? WHERE id = ?", [qty, roomId], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });

    Promise.all(updates)
        .then(() => res.json({ success: true, message: "บันทึกการจองและตัดสต๊อกเรียบร้อยแล้ว!" }))
        .catch(err => res.status(500).json({ success: false, error: err.message }));
});

// 3. สมัครสมาชิกใหม่
app.post('/api/register', (req, res) => {
    const { username, password, fullname, phone } = req.body;
    const query = `INSERT INTO users (username, password, fullname, phone) VALUES (?, ?, ?, ?)`;
    
    db.query(query, [username, password, fullname, phone], (err) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
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
    
    db.query(query, [name, email, subject, message], (err) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ success: false, message: "ไม่สามารถส่งข้อความได้" });
        }
        res.json({ success: true, message: "ส่งข้อความสำเร็จ! เราจะติดต่อกลับหาคุณโดยเร็วที่สุด" });
    });
});

// 5. ดูข้อมูลการติดต่อทั้งหมด (สำหรับ Admin ตรวจสอบ)
app.get('/api/contacts', (req, res) => {
    db.query("SELECT * FROM contacts ORDER BY created_at DESC", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// เริ่มต้น Server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});