let currentCategory = 'all';
let currentSort = 'default';
let priceRange = [0, 1000];
let searchQuery = '';

document.addEventListener('DOMContentLoaded', function() {
    initProductFilters();
});

function initProductFilters() {
    const categoryFilters = document.querySelectorAll('[data-category]');
    categoryFilters.forEach(btn => {
        btn.addEventListener('click', function() {
            currentCategory = this.dataset.category;
            categoryFilters.forEach(b => b.classList.remove('active', 'btn-primary'));
            categoryFilters.forEach(b => b.classList.add('btn-outline-primary'));
            this.classList.add('active', 'btn-primary');
            this.classList.remove('btn-outline-primary');
            filterProducts();
        });
    });

    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentSort = this.value;
            filterProducts();
        });
    }

    const priceInputs = document.querySelectorAll('.price-filter');
    priceInputs.forEach(input => {
        input.addEventListener('input', function() {
            priceRange[0] = parseInt(document.getElementById('minPrice')?.value) || 0;
            priceRange[1] = parseInt(document.getElementById('maxPrice')?.value) || 1000;
            filterProducts();
        });
    });
}

function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) return;

    const featured = products
        .filter(p => p.isBestSeller || p.isNew)
        .slice(0, 8);

    renderProducts(featured, container);
}

function loadBestSellers() {
    const container = document.getElementById('bestSellers');
    if (!container) return;

    const bestSellers = products
        .filter(p => p.isBestSeller)
        .slice(0, 4);

    renderProducts(bestSellers, container);
}

function loadNewArrivals() {
    const container = document.getElementById('newArrivals');
    if (!container) return;

    const newArrivals = products
        .filter(p => p.isNew)
        .slice(0, 4);

    renderProducts(newArrivals, container);
}

function loadOnSale() {
    const container = document.getElementById('onSale');
    if (!container) return;

    const onSale = products
        .filter(p => p.isSale)
        .slice(0, 4);

    renderProducts(onSale, container);
}

function loadAllProducts() {
    filterProducts();
}

function filterProducts() {
    let filtered = [...products];

    if (currentCategory && currentCategory !== 'all') {
        filtered = filtered.filter(p => p.category === currentCategory);
    }

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.description.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        );
    }

    filtered = filtered.filter(p => {
        const price = p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;
        return price >= priceRange[0] && price <= priceRange[1];
    });

    switch (currentSort) {
        case 'price-low':
            filtered.sort((a, b) => {
                const priceA = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
                const priceB = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;
                return priceA - priceB;
            });
            break;
        case 'price-high':
            filtered.sort((a, b) => {
                const priceA = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
                const priceB = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;
                return priceB - priceA;
            });
            break;
        case 'rating':
            filtered.sort((a, b) => b.rating - a.rating);
            break;
        case 'newest':
            filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
            break;
    }

    const container = document.getElementById('allProducts');
    if (container) {
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="fas fa-search"></i>
                        <h4>لا توجد منتجات</h4>
                        <p>لم يتم العثور على أي منتجات تطابق معايير البحث</p>
                    </div>
                </div>
            `;
        } else {
            renderProducts(filtered, container);
        }
    }
}

function renderProducts(productList, container) {
    container.innerHTML = productList.map(product => {
        const price = product.discount > 0 
            ? product.price * (1 - product.discount / 100) 
            : product.price;

        return `
            <div class="col-md-6 col-lg-4 col-xl-3">
                <div class="product-card">
                    <div class="product-badge">
                        ${product.isNew ? '<span class="badge-new">جديد</span>' : ''}
                        ${product.isSale ? '<span class="badge-sale">خصم</span>' : ''}
                        ${product.isBestSeller ? '<span class="badge-bestseller">الأكثر مبيعاً</span>' : ''}
                    </div>
                    <div class="product-image">
                        <img src="${product.image}" alt="${product.name}" loading="lazy">
                        <div class="product-actions">
                            <button class="action-btn" title="إضافة للمفضلة" data-wishlist-id="${product.id}" onclick="toggleWishlist(${product.id})">
                                <i class="${isInWishlist(product.id) ? 'fas' : 'far'} fa-heart"></i>
                            </button>
                            <button class="action-btn" title="مقارنة" onclick="toggleCompare(${product.id})">
                                <i class="fas fa-balance-scale"></i>
                            </button>
                            <button class="action-btn" title="عرض سريع" onclick="openQuickView(${product.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                    <div class="product-content">
                        <div class="product-category">${product.category}</div>
                        <h5 class="product-name">${product.name}</h5>
                        <div class="product-rating">
                            ${generateStars(product.rating)}
                            <span>(${product.reviews})</span>
                        </div>
                        <div class="product-price">
                            <span class="price-current">${price.toFixed(2)} د.ل</span>
                            ${product.discount > 0 ? `<span class="price-old">${product.price.toFixed(2)} د.ل</span>` : ''}
                        </div>
                        <div class="product-buttons">
                            <button class="btn-add-cart" onclick="addToCart(${product.id})">
                                <i class="fas fa-shopping-cart me-1"></i>
                                إضافة للسلة
                            </button>
                            <a href="product-details.html?id=${product.id}" class="btn-quick-view">
                                <i class="fas fa-info-circle"></i>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function loadProductDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));

    if (!productId) {
        window.location.href = 'products.html';
        return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) {
        window.location.href = 'products.html';
        return;
    }

    renderProductDetails(product);
    loadRelatedProducts(product);
}

function renderProductDetails(product) {
    const price = product.discount > 0 
        ? product.price * (1 - product.discount / 100) 
        : product.price;

    const container = document.getElementById('productDetails');
    if (!container) return;

    container.innerHTML = `
        <div class="row g-4">
            <div class="col-lg-6">
                <div class="product-image-main">
                    <img src="${product.image}" alt="${product.name}" class="img-fluid rounded-3 shadow">
                </div>
            </div>
            <div class="col-lg-6">
                <nav aria-label="breadcrumb">
                    <ol class="breadcrumb">
                        <li class="breadcrumb-item"><a href="index.html">الرئيسية</a></li>
                        <li class="breadcrumb-item"><a href="products.html?category=${encodeURIComponent(product.category)}">${product.category}</a></li>
                        <li class="breadcrumb-item active" aria-current="page">${product.name}</li>
                    </ol>
                </nav>
                <div class="product-category mb-2">${product.category}</div>
                <h1 class="mb-3">${product.name}</h1>
                <div class="product-rating mb-4">
                    ${generateStars(product.rating)}
                    <span class="ms-2">(${product.reviews} تقييم)</span>
                </div>
                <div class="product-price mb-4">
                    <span class="price-current" style="font-size: 2rem;">${price.toFixed(2)} د.ل</span>
                    ${product.discount > 0 ? `<span class="price-old" style="font-size: 1.3rem;">${product.price.toFixed(2)} د.ل</span>` : ''}
                    ${product.discount > 0 ? `<span class="badge bg-danger ms-2">${product.discount}% خصم</span>` : ''}
                </div>
                <p class="mb-4" style="color: var(--text-light); font-size: 1.1rem; line-height: 1.8;">${product.description}</p>
                
                ${product.colors.length > 0 ? `
                    <div class="mb-4">
                        <h6 class="mb-3">الألوان المتاحة:</h6>
                        <div class="d-flex gap-2 flex-wrap">
                            ${product.colors.map((color, index) => `
                                <button class="btn ${index === 0 ? 'btn-primary' : 'btn-outline-primary'} color-btn" data-color="${color}">${color}</button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${product.sizes.length > 0 ? `
                    <div class="mb-4">
                        <h6 class="mb-3">المقاسات المتاحة:</h6>
                        <div class="d-flex gap-2 flex-wrap">
                            ${product.sizes.map((size, index) => `
                                <button class="btn ${index === 0 ? 'btn-primary' : 'btn-outline-primary'} size-btn" data-size="${size}">${size}</button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="mb-4">
                    <h6 class="mb-3">الكمية:</h6>
                    <div class="d-flex gap-3 align-items-center">
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="decrementQuantity()">
                                <i class="fas fa-minus"></i>
                            </button>
                            <input type="number" class="quantity-input" id="productQuantity" value="1" min="1">
                            <button class="quantity-btn" onclick="incrementQuantity()">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="d-flex gap-3 mb-4">
                    <button class="btn btn-gold flex-grow-1" onclick="addToCart(${product.id}, parseInt(document.getElementById('productQuantity').value))">
                        <i class="fas fa-shopping-cart me-2"></i>
                        إضافة إلى السلة
                    </button>
                    <button class="btn ${isInWishlist(product.id) ? 'btn-danger' : 'btn-outline-danger'}" onclick="toggleWishlist(${product.id})">
                        <i class="${isInWishlist(product.id) ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                    <button class="btn btn-outline-primary" onclick="toggleCompare(${product.id})">
                        <i class="fas fa-balance-scale"></i>
                    </button>
                </div>
                
                <div class="border-top pt-4">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <div class="d-flex align-items-center gap-3">
                                <i class="fas fa-truck text-primary" style="font-size: 1.5rem;"></i>
                                <div>
                                    <h6 class="mb-0">توصيل سريع</h6>
                                    <small style="color: var(--text-light);">توصيل خلال 24-48 ساعة</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="d-flex align-items-center gap-3">
                                <i class="fas fa-undo text-primary" style="font-size: 1.5rem;"></i>
                                <div>
                                    <h6 class="mb-0">إرجاع مجاني</h6>
                                    <small style="color: var(--text-light);">إرجاع خلال 14 يوم</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="d-flex align-items-center gap-3">
                                <i class="fas fa-shield-alt text-primary" style="font-size: 1.5rem;"></i>
                                <div>
                                    <h6 class="mb-0">ضمان الجودة</h6>
                                    <small style="color: var(--text-light);">منتجات أصلية 100%</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="d-flex align-items-center gap-3">
                                <i class="fas fa-headset text-primary" style="font-size: 1.5rem;"></i>
                                <div>
                                    <h6 class="mb-0">دعم عملاء</h6>
                                    <small style="color: var(--text-light);">دعم على مدار الساعة</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    initProductVariantButtons();
}

function initProductVariantButtons() {
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.color-btn').forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-outline-primary');
            });
            this.classList.remove('btn-outline-primary');
            this.classList.add('btn-primary');
        });
    });

    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.size-btn').forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-outline-primary');
            });
            this.classList.remove('btn-outline-primary');
            this.classList.add('btn-primary');
        });
    });
}

function incrementQuantity() {
    const input = document.getElementById('productQuantity');
    if (input) {
        input.value = parseInt(input.value) + 1;
    }
}

function decrementQuantity() {
    const input = document.getElementById('productQuantity');
    if (input && parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
    }
}

function loadRelatedProducts(product) {
    const container = document.getElementById('relatedProducts');
    if (!container) return;

    const related = products
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    if (related.length > 0) {
        document.querySelector('.related-products-section').style.display = 'block';
        renderProducts(related, container);
    }
}
