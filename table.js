let selectedCount = 0;
let totalRawPrice = 0;

window.onload = function() {
    const buttons = document.querySelectorAll('.select-btn');

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            
            // 1. จัดการเรื่อง Stock
            let stockCell = row.cells[3]; // ช่อง Stock คือ index ที่ 3
            let currentStock = parseInt(stockCell.innerText);

            if (currentStock > 0) {
                // ลดจำนวน Stock ในตาราง
                currentStock--;
                stockCell.innerText = currentStock;

                // 2. คำนวณราคา
                let priceText = row.cells[2].innerText;
                let price = parseFloat(priceText.replace(/,/g, '').trim());

                if (!isNaN(price)) {
                    selectedCount++;
                    totalRawPrice += price;
                    updateDisplay();
                }

                // ถ้า Stock หมด ให้ปิดปุ่ม (Optional)
                if (currentStock === 0) {
                    this.disabled = true;
                    this.innerText = "Out of Stock";
                }
            } else {
                alert("ขออภัย ห้องนี้หมดแล้ว");
            }
        });
    });
};

function updateDisplay() {
    // คำนวณส่วนลด 10% ถ้าเลือกมากกว่า 5 ห้อง
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

// 3. ฟังก์ชันสำหรับปุ่ม Confirm
function confirmBooking() {
    if (selectedCount === 0) {
        alert("กรุณาเลือกห้องก่อนยืนยัน");
        return;
    }

    alert('สั่งซื้อเรียบร้อย');

    // รีเซ็ตค่าตัวแปร
    selectedCount = 0;
    totalRawPrice = 0;

    // อัปเดตการแสดงผลให้กลับเป็นค่าเริ่มต้น
    updateDisplay();
}