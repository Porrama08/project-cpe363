let selectedCount = 0;
let totalRawPrice = 0;

window.onload = function() {
    // โหลดข้อมูลห้องพักทันทีที่เปิดหน้าเว็บ
    fetchRooms();
};

function fetchRooms() {
    // ดึงข้อมูลจาก Node.js API
    fetch('http://localhost:3000/api/rooms')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('room-data');
            tableBody.innerHTML = ''; // ลบคำว่า "กำลังโหลดข้อมูล..." ทิ้ง

            // สร้างแถวตารางจากข้อมูลใน Database
            data.forEach((room, index) => {
                const row = `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${room.name}</td>
                        <td>${room.price.toLocaleString()}</td>
                        <td>${room.stock}</td>
                        <td><button class="select-btn" onclick="selectRoom(this, ${room.price})">Select</button></td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        })
        .catch(error => console.error('Error fetching data:', error));
}

// ฟังก์ชันเมื่อกดปุ่ม Select
function selectRoom(btn, price) {
    const row = btn.closest('tr');
    let stockCell = row.cells[3]; 
    let currentStock = parseInt(stockCell.innerText);

    if (currentStock > 0) {
        currentStock--;
        stockCell.innerText = currentStock;

        selectedCount++;
        totalRawPrice += price;
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

// ฟังก์ชันคำนวณราคา
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

// ฟังก์ชันปุ่ม Confirm
function confirmBooking() {
    if (selectedCount === 0) {
        alert("กรุณาเลือกห้องก่อนยืนยัน");
        return;
    }
    alert('สั่งซื้อเรียบร้อย จำนวน ' + selectedCount + ' ห้อง');
    location.reload(); 
}