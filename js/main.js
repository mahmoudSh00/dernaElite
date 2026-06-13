let products = [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let compareList = JSON.parse(localStorage.getItem('compareList')) || [];
let darkMode = localStorage.getItem('darkMode') === 'true';

document.addEventListener('DOMContentLoaded', function() {
    initDarkMode();
    initBackToTop();
    loadProducts();
    initCountdown();
    updateCartBadge();
    initEventListeners();
});

function initDarkMode() {
    if (darkMode) {
        document.body.classList.add('dark-mode');
    }
}

function toggleDarkMode() {
    darkMode = !darkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', darkMode);
}

function initBackToTop() {
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(backToTop);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

async function loadProducts() {
    try {
        const stored = localStorage.getItem('adminProducts');
        if (stored) {
            products = JSON.parse(stored);
        } else {
            const response = await fetch('data/products.json');
            const data = await response.json();
            products = data.products;
        }
        
        if (typeof loadFeaturedProducts === 'function') {
            loadFeaturedProducts();
        }
        if (typeof loadBestSellers === 'function') {
            loadBestSellers();
        }
        if (typeof loadNewArrivals === 'function') {
            loadNewArrivals();
        }
        if (typeof loadOnSale === 'function') {
            loadOnSale();
        }
        if (typeof loadAllProducts === 'function') {
            loadAllProducts();
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function initCountdown() {
    const countDownDate = new Date().getTime() + (7 * 24 * 60 * 60 * 1000);

    const countdownInterval = setInterval(() => {
        const now = new Date().getTime();
        const distance = countDownDate - now;

        if (distance < 0) {
            clearInterval(countdownInterval);
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        const daysEl = document.querySelector('.time-item:nth-child(1) .time-number');
        const hoursEl = document.querySelector('.time-item:nth-child(2) .time-number');
        const minutesEl = document.querySelector('.time-item:nth-child(3) .time-number');
        const secondsEl = document.querySelector('.time-item:nth-child(4) .time-number');

        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }, 1000);
}

function showToast(message, type = 'success') {
    const container = document.querySelector('.toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'times-circle' : 'exclamation-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon} toast-icon"></i>
        <div>${message}</div>
    `;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

function addToCart(productId, quantity = 1) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }

    saveCart();
    updateCartBadge();
    showToast('تم إضافة المنتج إلى السلة بنجاح!', 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartBadge();
    
    if (typeof renderCart === 'function') {
        renderCart();
    }
}

function updateQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(1, quantity);
        saveCart();
        updateCartBadge();
        
        if (typeof renderCart === 'function') {
            renderCart();
        }
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartBadge() {
    const badge = document.querySelector('.cart-badge');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
    }
}

function getCartTotal() {
    return cart.reduce((sum, item) => {
        const price = item.discount > 0 
            ? item.price * (1 - item.discount / 100) 
            : item.price;
        return sum + (price * item.quantity);
    }, 0);
}

function toggleWishlist(productId) {
    const index = wishlist.indexOf(productId);
    
    if (index > -1) {
        wishlist.splice(index, 1);
        showToast('تم إزالة المنتج من المفضلة', 'warning');
    } else {
        wishlist.push(productId);
        showToast('تم إضافة المنتج إلى المفضلة!', 'success');
    }
    
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    updateWishlistButtons();
}

function isInWishlist(productId) {
    return wishlist.includes(productId);
}

function updateWishlistButtons() {
    document.querySelectorAll('[data-wishlist-id]').forEach(btn => {
        const productId = parseInt(btn.dataset.wishlistId);
        const icon = btn.querySelector('i');
        
        if (isInWishlist(productId)) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            btn.style.color = '#dc3545';
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            btn.style.color = '';
        }
    });
}

function toggleCompare(productId) {
    const index = compareList.indexOf(productId);
    
    if (index > -1) {
        compareList.splice(index, 1);
        showToast('تم إزالة المنتج من المقارنة', 'warning');
    } else {
        if (compareList.length >= 4) {
            showToast('يمكنك مقارنة 4 منتجات فقط', 'error');
            return;
        }
        compareList.push(productId);
        showToast('تم إضافة المنتج للمقارنة!', 'success');
    }
    
    localStorage.setItem('compareList', JSON.stringify(compareList));
}

function openQuickView(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const modal = createQuickViewModal(product);
    modal.show();
}

function createQuickViewModal(product) {
    const price = product.discount > 0 
        ? product.price * (1 - product.discount / 100) 
        : product.price;

    const modalId = 'quickViewModal';
    let modalEl = document.getElementById(modalId);
    
    if (!modalEl) {
        modalEl = document.createElement('div');
        modalEl.id = modalId;
        modalEl.className = 'modal fade quick-view-modal';
        modalEl.setAttribute('tabindex', '-1');
        document.body.appendChild(modalEl);
    }

    modalEl.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${product.name}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <img src="${product.image}" alt="${product.name}" class="img-fluid rounded">
                        </div>
                        <div class="col-md-6">
                            <div class="product-category mb-2">${product.category}</div>
                            <h3 class="mb-3">${product.name}</h3>
                            <div class="product-rating mb-3">
                                ${generateStars(product.rating)}
                                <span>(${product.reviews} تقييم)</span>
                            </div>
                            <p class="mb-3" style="color: var(--text-light);">${product.description}</p>
                            <div class="product-price mb-4">
                                <span class="price-current">${price.toFixed(2)} د.ل</span>
                                ${product.discount > 0 ? `<span class="price-old">${product.price.toFixed(2)} د.ل</span>` : ''}
                            </div>
                            ${product.colors.length > 0 ? `
                                <div class="mb-3">
                                    <label class="form-label">الألوان:</label>
                                    <div class="d-flex gap-2">
                                        ${product.colors.map(color => `
                                            <button class="btn btn-sm btn-outline-secondary">${color}</button>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            ${product.sizes.length > 0 ? `
                                <div class="mb-4">
                                    <label class="form-label">المقاسات:</label>
                                    <div class="d-flex gap-2">
                                        ${product.sizes.map(size => `
                                            <button class="btn btn-sm btn-outline-secondary">${size}</button>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                            <button class="btn btn-gold w-100 mb-2" onclick="addToCart(${product.id}); document.getElementById('quickViewModal').querySelector('.btn-close').click();">
                                <i class="fas fa-shopping-cart me-2"></i>
                                إضافة إلى السلة
                            </button>
                            <a href="product-details.html?id=${product.id}" class="btn btn-outline-primary w-100">
                                عرض التفاصيل الكاملة
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return new bootstrap.Modal(modalEl);
}

function generateStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

function initEventListeners() {
    document.querySelectorAll('[data-bs-toggle="darkmode"]').forEach(btn => {
        btn.addEventListener('click', toggleDarkMode);
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            if (typeof filterProducts === 'function') {
                filterProducts();
            }
        }, 300));
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[0-9+\-\s\(\)]{8,}$/;
    return re.test(phone);
}

function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}
