document.getElementById('regisForm').addEventListener('submit', function(e) {
    e.preventDefault(); // ป้องกันหน้าเว็บรีเฟรชเอง

    // ตรวจสอบรหัสผ่านตรงกันหรือไม่
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('รหัสผ่านไม่ตรงกัน กรุณากรอกใหม่');
        document.getElementById('confirmPassword').focus();
        return;
    }

    // ดึงค่าจากช่องกรอกข้อมูล
    const userData = {
        username: document.getElementById('username').value,
        password: password,
        fullname: document.getElementById('fullname').value,
        phone: document.getElementById('phone').value
    };

    // ส่งข้อมูลไปที่ API หลังบ้าน
    fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            window.location.href = 'login.html'; // สมัครเสร็จแล้วให้ไปหน้า login
        } else {
            alert('ล้มเหลว: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
    });
});