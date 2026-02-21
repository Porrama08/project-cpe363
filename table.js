let selectedCount = 0;
let totalRawPrice = 0;

window.onload = function() {
    const buttons = document.querySelectorAll('.select-btn');
    

    console.log("พบปุ่มทั้งหมด: " + buttons.length + " ปุ่ม");

    buttons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            
            let priceText = row.cells[2].innerText;
            let price = parseFloat(priceText.replace(/,/g, '').trim());

            if (!isNaN(price)) {
                selectedCount++;
                totalRawPrice += price;
                updateDisplay();
            }
        });
    });
};

function updateDisplay() {
    let discount = 0;
    if (selectedCount > 5) {
        discount = totalRawPrice * 0.10;
    }

    let afterDiscount = totalRawPrice - discount;
    let vat = afterDiscount * 0.07;
    let total = afterDiscount + vat;

    document.getElementById('count').innerText = selectedCount;
    document.getElementById('subtotal').innerText = totalRawPrice.toLocaleString();
    document.getElementById('discount').innerText = discount.toLocaleString();
    document.getElementById('vat').innerText = vat.toLocaleString();
    document.getElementById('total').innerText = total.toLocaleString();
}