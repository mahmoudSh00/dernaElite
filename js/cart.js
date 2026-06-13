document.addEventListener('DOMContentLoaded', function() {
    renderCart();
    initCartEventListeners();
});

function initCartEventListeners() {
    // إضافة أحداث إضافية للديناميكية
}

function renderCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartSummaryContainer = document.getElementById('cartSummary');
    
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-state py-5">
                <i class="fas fa-shopping-cart mb-4" style="font-size: 4rem; color: #ccc;"></i>
                <h4>السلة فارغة</h4>
                <p class="mb-4">لم تقم بإضافة أي منتجات إلى السلة بعد</p>
                <a href="products.html" class="btn btn-gold btn-lg">
                    <i class="fas fa-shopping-bag me-2"></i>
                    ابدأ التسوق الآن
                </a>
            </div>
        `;
        if (cartSummaryContainer) {
            cartSummaryContainer.style.display = 'none';
        }
        return;
    }

    if (cartSummaryContainer) {
        cartSummaryContainer.style.display = 'block';
    }

    cartItemsContainer.innerHTML = cart.map(item => {
        const price = item.discount > 0 
            ? item.price * (1 - item.discount / 100) 
            : item.price;
        const itemTotal = price * item.quantity;

        return `
            <div class="cart-item mb-4 p-4 bg-white rounded-xl shadow-sm border border-light" data-product-id="${item.id}">
                <div class="d-flex flex-wrap align-items-center gap-4">
                    <div class="cart-item-image rounded-lg overflow-hidden">
                        <img src="${item.image}" alt="${item.name}" class="img-fluid" style="width: 120px; height: 120px; object-fit: cover;">
                    </div>
                    <div class="cart-item-details flex-grow-1">
                        <h5 class="cart-item-name font-bold text-lg mb-2">${item.name}</h5>
                        <p class="text-muted mb-2"><i class="fas fa-tag ms-2"></i>${item.category}</p>
                        <div class="product-price">
                            <span class="price-current" style="font-size: 1.3rem;">${price.toFixed(2)} د.ل</span>
                            ${item.discount > 0 ? `<span class="price-old ms-2">${item.price.toFixed(2)} د.ل</span>` : ''}
                        </div>
                    </div>
                    <div class="cart-item-quantity d-flex align-items-center gap-3">
                        <button class="quantity-btn btn btn-sm btn-outline-primary" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="quantity-input form-control form-control-sm text-center" 
                               value="${item.quantity}" min="1" 
                               onchange="updateQuantity(${item.id}, parseInt(this.value))"
                               style="width: 70px;">
                        <button class="quantity-btn btn btn-sm btn-outline-primary" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="cart-item-total text-end">
                        <h5 class="font-bold text-xl mb-0" style="color: var(--primary-color);">${itemTotal.toFixed(2)} د.ل</h5>
                    </div>
                    <button class="btn btn-outline-danger btn-sm" onclick="removeFromCart(${item.id})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    renderCartSummary();
}

function renderCartSummary() {
    const container = document.getElementById('cartSummaryContent');
    if (!container) return;

    const subtotal = getCartTotal();
    const shipping = subtotal > 0 && subtotal < 100 ? 5 : 0;
    const total = subtotal + shipping;

    container.innerHTML = `
        <div class="summary-row border-bottom pb-3 mb-3">
            <span class="summary-label fw-bold">المجموع الفرعي</span>
            <span class="summary-value">${subtotal.toFixed(2)} د.ل</span>
        </div>
        <div class="summary-row border-bottom pb-3 mb-3">
            <span class="summary-label fw-bold">رسوم التوصيل</span>
            <span class="summary-value">${shipping > 0 ? shipping.toFixed(2) + ' د.ل' : '<span class="text-success"><i class="fas fa-truck ms-1"></i>مجاني!</span>'}</span>
        </div>
        <div class="summary-row summary-total border-top pt-3 mt-3">
            <span class="summary-label" style="font-size: 1.2rem;">الإجمالي</span>
            <span class="summary-value" style="font-size: 1.5rem; color: var(--accent-color);">${total.toFixed(2)} د.ل</span>
        </div>
        <div class="mt-4">
            <div class="alert alert-info" role="alert">
                <i class="fas fa-shipping-fast me-2"></i>
                <strong>توصيل مجاني</strong> للطلبات التي تزيد عن 100 د.ل
            </div>
            <a href="checkout.html" class="btn btn-gold w-100 mb-3 d-flex align-items-center justify-content-center gap-2">
                <i class="fas fa-credit-card"></i>
                إتمام الشراء
            </a>
            <a href="products.html" class="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2">
                <i class="fas fa-arrow-right"></i>
                مواصلة التسوق
            </a>
        </div>
    `;
}

function initCheckout() {
    const form = document.getElementById('checkoutForm');
    if (!form) return;

    renderOrderSummary();

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (cart.length === 0) {
            showToast('السلة فارغة!', 'error');
            return;
        }

        if (validateCheckoutForm()) {
            submitOrder();
        }
    });
}

function renderOrderSummary() {
    const container = document.getElementById('orderSummary');
    if (!container) return;

    container.innerHTML = cart.map(item => {
        const price = item.discount > 0 
            ? item.price * (1 - item.discount / 100) 
            : item.price;
        const itemTotal = price * item.quantity;

        return `
            <div class="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                <div class="d-flex gap-3">
                    <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 12px;">
                    <div>
                        <h6 class="mb-1 font-bold" style="color: var(--text-dark);">${item.name}</h6>
                        <small class="text-muted"><i class="fas fa-box me-1"></i>الكمية: <strong>${item.quantity}</strong></small>
                    </div>
                </div>
                <span class="price-current font-bold text-lg">${itemTotal.toFixed(2)} د.ل</span>
            </div>
        `;
    }).join('');

    const subtotal = getCartTotal();
    const shipping = subtotal > 0 && subtotal < 100 ? 5 : 0;
    const total = subtotal + shipping;

    document.getElementById('checkoutTotal').innerHTML = `
        <div class="summary-row border-bottom pb-3 mb-3">
            <span class="summary-label fw-bold">المجموع الفرعي</span>
            <span class="summary-value">${subtotal.toFixed(2)} د.ل</span>
        </div>
        <div class="summary-row border-bottom pb-3 mb-3">
            <span class="summary-label fw-bold">رسوم التوصيل</span>
            <span class="summary-value">${shipping > 0 ? shipping.toFixed(2) + ' د.ل' : '<span class="text-success"><i class="fas fa-truck ms-1"></i>مجاني!</span>'}</span>
        </div>
        <div class="summary-row summary-total border-top pt-3 mt-3">
            <span class="summary-label" style="font-size: 1.2rem;">الإجمالي الكلي</span>
            <span class="summary-value" style="font-size: 1.6rem; color: var(--accent-color);">${total.toFixed(2)} د.ل</span>
        </div>
    `;
}

function validateCheckoutForm() {
    const fullName = sanitizeInput(document.getElementById('fullName').value.trim());
    const phone = sanitizeInput(document.getElementById('phone').value.trim());
    const city = sanitizeInput(document.getElementById('city').value.trim());
    const address = sanitizeInput(document.getElementById('address').value.trim());

    if (!fullName) {
        showToast('يرجى إدخال الاسم الكامل', 'error');
        document.getElementById('fullName').focus();
        return false;
    }

    if (!validatePhone(phone)) {
        showToast('يرجى إدخال رقم هاتف صحيح', 'error');
        document.getElementById('phone').focus();
        return false;
    }

    if (!city) {
        showToast('يرجى إدخال المدينة', 'error');
        document.getElementById('city').focus();
        return false;
    }

    if (!address) {
        showToast('يرجى إدخال العنوان', 'error');
        document.getElementById('address').focus();
        return false;
    }

    return true;
}

function submitOrder() {
    const fullName = sanitizeInput(document.getElementById('fullName').value.trim());
    const phone = sanitizeInput(document.getElementById('phone').value.trim());
    const city = sanitizeInput(document.getElementById('city').value.trim());
    const address = sanitizeInput(document.getElementById('address').value.trim());
    const notes = sanitizeInput(document.getElementById('notes').value.trim());

    const subtotal = getCartTotal();
    const shipping = subtotal > 0 && subtotal < 100 ? 5 : 0;
    const total = subtotal + shipping;

    let message = `🛍️ طلب جديد من متجر Derna Elite Shopping\n\n`;
    message += `👤 بيانات العميل:\n`;
    message += `الاسم: ${fullName}\n`;
    message += `الهاتف: ${phone}\n`;
    message += `المدينة: ${city}\n`;
    message += `العنوان: ${address}\n`;
    if (notes) {
        message += `ملاحظات: ${notes}\n`;
    }
    
    message += `\n� المنتجات المطلوبة:\n`;
    cart.forEach((item, index) => {
        const price = item.discount > 0 
            ? item.price * (1 - item.discount / 100) 
            : item.price;
        const itemTotal = price * item.quantity;
        message += `${index + 1}. ${item.name}\n`;
        message += `   الكمية: ${item.quantity} × ${price.toFixed(2)} د.ل = ${itemTotal.toFixed(2)} د.ل\n`;
    });

    message += `\n💰 ملخص الطلب:\n`;
    message += `المجموع الفرعي: ${subtotal.toFixed(2)} د.ل\n`;
    message += `التوصيل: ${shipping > 0 ? shipping.toFixed(2) + ' د.ل' : 'مجاني'}\n`;
    message += `═══════════════════════════\n`;
    message += `الإجمالي الكلي: ${total.toFixed(2)} د.ل\n`;
    message += `═══════════════════════════\n`;
    message += `\n✅ شكراً لتسوقك معنا!`;

    const whatsappUrl = `https://wa.me/218920719250?text=${encodeURIComponent(message)}`;
    
    showToast('جارٍ توجيهك إلى واتساب لإكمال الطلب...', 'success');
    
    setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        clearCart();
    }, 1500);
}

function clearCart() {
    cart = [];
    saveCart();
    updateCartBadge();
    if (typeof renderCart === 'function') {
        renderCart();
    }
}
