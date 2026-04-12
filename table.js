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
    let currentStock = parseInt(stockCell.innerText);

    if (currentStock > 0) {
        currentStock--;
        stockCell.innerText = currentStock;

        selectedCount++;
        totalRawPrice += price;
        
        // บันทึกใส่ตะกร้า (ถ้าไม่เคยเลือกห้องนี้มาก่อนให้เป็น 0 แล้วบวก 1)
        if (!cart[roomId]) { cart[roomId] = 0; }
        cart[roomId]++;

        updateDisplay();

        if (currentStock === 0) {
            btn.disabled = true;
            btn.innerText = "Out of Stock";
            btn.style.backgroundColor = "#ccc";
        }
    } else {
        alert("ขออภัย ห้องนี้หมดแล้ว");
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

// เปลี่ยนปุ่ม Confirm ให้ส่งข้อมูลไปตัดสต๊อกจริง
function confirmBooking() {
    if (selectedCount === 0) {
        alert("กรุณาเลือกห้องก่อนยืนยัน");
        return;
    }
    
    // ยิงข้อมูลไปให้ Node.js ด้วยวิธี POST
    fetch('http://localhost:3000/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart: cart }) // ส่งตะกร้าไป
    })
    .then(response => response.json())
    .then(data => {
        if(data.success) {
            alert('🎉 ' + data.message + '\nจำนวนที่จอง: ' + selectedCount + ' ห้อง');
            location.reload(); // รีเฟรชหน้าเว็บ (จะเห็นว่า Stock ลดลงจริงๆ แล้ว)
        } else {
            alert('เกิดข้อผิดพลาด: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่');
    });
}