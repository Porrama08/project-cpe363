let selectedCount = 0;
let totalRawPrice = 0;
let cart = {}; // ตะกร้าจำข้อมูลว่า ห้อง ID ไหน ถูกเลือกไปกี่ห้อง

window.onload = function() {
    fetchRooms();
};

function fetchRooms() {
    fetch('http://localhost:3000/api/rooms')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('room-data');
            tableBody.innerHTML = ''; 

            data.forEach((room, index) => {
                // เพิ่มส่งค่า room.id ไปด้วยในปุ่ม Select
                const row = `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${room.name}</td>
                        <td>${room.price.toLocaleString()}</td>
                        <td>${room.stock}</td>
                        <td><button class="select-btn" onclick="selectRoom(this, ${room.price}, ${room.id})">Select</button></td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

// รับค่า roomId เพิ่มเข้ามา
function selectRoom(btn, price, roomId) {
    const row = btn.closest('tr');
    let stockCell = row.cells[3]; 
    let originalStock = parseInt(stockCell.innerText);

    // คำนวณจำนวนที่เลือกไปแล้วสำหรับห้องนี้
    let alreadySelected = cart[roomId] || 0;
    let remaining = originalStock - alreadySelected;

    if (remaining > 0) {
        selectedCount++;
        totalRawPrice += price;
        
        // บันทึกใส่ตะกร้า (ถ้าไม่เคยเลือกห้องนี้มาก่อนให้เป็น 0 แล้วบวก 1)
        if (!cart[roomId]) { cart[roomId] = 0; }
        cart[roomId]++;

        updateDisplay();

        // ถ้าเลือกครบจำนวน stock แล้ว ให้ disable ปุ่ม
        if (cart[roomId] >= originalStock) {
            btn.disabled = true;
            btn.innerText = "เลือกครบแล้ว";
            btn.style.backgroundColor = "#ccc";
        }
    } else {
        alert("ขออภัย ห้องนี้เลือกครบจำนวนแล้ว");
    }
}

function updateDisplay() {
    let discount = (selectedCount > 5) ? totalRawPrice * 0.10 : 0;
    let afterDiscount = totalRawPrice - discount;
    let vat = afterDiscount * 0.07;
    let total = afterDiscount + vat;

    document.getElementById('count').innerText = selectedCount;
    document.getElementById('subtotal').innerText = totalRawPrice.toLocaleString();
    document.getElementById('discount').innerText = discount.toLocaleString();
    document.getElementById('vat').innerText = vat.toLocaleString();
    document.getElementById('total').innerText = total.toLocaleString();
}

// เปลี่ยนปุ่ม Confirm ให้เปิด Modal แทน
function confirmBooking() {
    if (selectedCount === 0) {
        alert("กรุณาเลือกห้องก่อนยืนยัน");
        return;
    }
    openModal();
}

// เปิด Modal พร้อมอัปเดตข้อมูลสรุป
function openModal() {
    // อัปเดตข้อมูลสรุปใน Modal
    let discount = (selectedCount > 5) ? totalRawPrice * 0.10 : 0;
    let afterDiscount = totalRawPrice - discount;
    let vat = afterDiscount * 0.07;
    let total = afterDiscount + vat;

    document.getElementById('modalCount').innerText = selectedCount;
    document.getElementById('modalTotal').innerText = total.toLocaleString();

    // ดึงข้อมูลจาก sessionStorage (ที่เก็บตอน login)
    const savedName = sessionStorage.getItem('fullname') || '';
    const savedPhone = sessionStorage.getItem('phone') || '';
    document.getElementById('customerName').value = savedName;
    document.getElementById('customerPhone').value = savedPhone;
    clearErrors();

    // รีเซ็ต modal content (กรณีเคยแสดง success)
    const container = document.querySelector('.modal-container');
    const header = container.querySelector('.modal-header');
    const body = container.querySelector('.modal-body');
    const footer = container.querySelector('.modal-footer');
    if (header) header.style.display = '';
    if (body) body.style.display = '';
    if (footer) footer.style.display = '';
    const oldSuccess = container.querySelector('.modal-success');
    if (oldSuccess) oldSuccess.remove();

    // แสดง Modal
    const modal = document.getElementById('bookingModal');
    modal.classList.add('active');

    // ปิด Modal เมื่อคลิกพื้นหลัง
    modal.onclick = function(e) {
        if (e.target === modal) closeModal();
    };
}

// ปิด Modal
function closeModal() {
    const modal = document.getElementById('bookingModal');
    modal.classList.remove('active');
}

// ล้าง Error ทั้งหมด
function clearErrors() {
    document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
    document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('show'));
}

// ตรวจสอบข้อมูลและส่งการจอง
function submitBooking() {
    clearErrors();

    const nameInput = document.getElementById('customerName');
    const phoneInput = document.getElementById('customerPhone');
    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();

    let isValid = true;

    // ตรวจสอบชื่อ
    if (!name) {
        nameInput.classList.add('input-error');
        isValid = false;
    }

    // ตรวจสอบเบอร์โทร (อย่างน้อย 9 ตัวเลข)
    const phoneDigits = phone.replace(/\D/g, '');
    if (!phone || phoneDigits.length < 9) {
        phoneInput.classList.add('input-error');
        isValid = false;
    }

    if (!isValid) {
        // สั่นปุ่ม confirm เพื่อแจ้งว่ามี error
        const confirmBtn = document.querySelector('.modal-confirm-btn');
        confirmBtn.style.animation = 'none';
        confirmBtn.offsetHeight; // trigger reflow
        confirmBtn.style.animation = 'shake 0.4s ease';
        setTimeout(() => { confirmBtn.style.animation = ''; }, 400);
        return;
    }

    // ส่งข้อมูลไป API
    const confirmBtn = document.querySelector('.modal-confirm-btn');
    confirmBtn.disabled = true;
    confirmBtn.innerText = '⏳ กำลังดำเนินการ...';

    fetch('http://localhost:3000/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: cart, customerName: name, customerPhone: phone })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showSuccess(name);
        } else {
            alert('เกิดข้อผิดพลาด: ' + data.error);
            confirmBtn.disabled = false;
            confirmBtn.innerText = '✅ ยืนยันการชำระเงิน';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่');
        confirmBtn.disabled = false;
        confirmBtn.innerText = '✅ ยืนยันการชำระเงิน';
    });
}

// แสดงหน้าสำเร็จภายใน Modal
function showSuccess(customerName) {
    const container = document.querySelector('.modal-container');
    
    // ซ่อน content เดิม
    container.querySelector('.modal-header').style.display = 'none';
    container.querySelector('.modal-body').style.display = 'none';
    container.querySelector('.modal-footer').style.display = 'none';

    // เพิ่ม success content
    const successDiv = document.createElement('div');
    successDiv.className = 'modal-success';
    successDiv.innerHTML = `
        <div class="success-icon">🎉</div>
        <h3>จองสำเร็จแล้ว!</h3>
        <p>ขอบคุณคุณ <strong>${customerName}</strong></p>
        <p>จำนวน ${selectedCount} ห้อง</p>
        <p style="margin-top: 20px; color: #999; font-size: 13px;">กำลังกลับไปหน้าหลัก...</p>
    `;
    container.appendChild(successDiv);

    // รีโหลดหลัง 2.5 วินาที
    setTimeout(() => {
        location.reload();
    }, 2500);
}