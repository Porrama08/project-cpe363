document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault(); // ป้องกันไม่ให้หน้าเว็บรีเฟรชตอนกดส่ง

    // ดึงข้อมูลจากช่องกรอก
    const contactData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
    };

    // ส่งข้อมูลไปที่ Backend (API ที่เราสร้างไว้ใน server.js)
    fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message); // เด้งแจ้งเตือนว่าส่งสำเร็จ
            document.getElementById('contactForm').reset(); // ล้างฟอร์มให้เป็นช่องว่างเหมือนเดิม
        } else {
            alert('เกิดข้อผิดพลาด: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่ในภายหลัง');
    });
});