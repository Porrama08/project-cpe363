const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// 1. เชื่อมต่อฐานข้อมูล (จะสร้างไฟล์ hotel.db อัตโนมัติ)
const db = new sqlite3.Database('./hotel.db');

// 2. สร้างตารางและเพิ่มข้อมูลห้องพักเริ่มต้น
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS rooms (id INTEGER PRIMARY KEY, name TEXT, price INTEGER, stock INTEGER)");
    
    db.get("SELECT count(*) as count FROM rooms", (err, row) => {
        if (row.count === 0) {
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
                { name: 'Superior Suite', price: 31000, stock: 8 }
            ];
            
            const stmt = db.prepare("INSERT INTO rooms (name, price, stock) VALUES (?, ?, ?)");
            initialRooms.forEach(room => {
                stmt.run(room.name, room.price, room.stock);
            });
            stmt.finalize();
        }
    });
});

// 3. สร้าง API ส่งข้อมูลให้หน้าเว็บ
app.get('/api/rooms', (req, res) => {
    db.all("SELECT * FROM rooms", [], (err, rows) => {
        if (err) { 
            res.status(500).json({error: err.message}); 
            return; 
        }
        res.json(rows);
    });
});

app.listen(3000, () => {
    console.log('✅ Server Backend เปิดทำงานแล้วที่ http://localhost:3000');
});