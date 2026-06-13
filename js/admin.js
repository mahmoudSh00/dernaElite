let adminProducts = [];
let editProductId = null;

// Admin credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin123';

document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    initEventListeners();
});

function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    if (isLoggedIn) {
        showAdminDashboard();
    }
}

function showAdminDashboard() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminSection').style.display = 'block';
    loadAdminProducts();
}

function showLoginForm() {
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('adminSection').style.display = 'none';
}

function initEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('addProductForm').addEventListener('submit', addProduct);
    document.getElementById('searchProduct').addEventListener('input', searchProducts);
}

function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem('adminLoggedIn', 'true');
        showToast('تم تسجيل الدخول بنجاح!', 'success');
        showAdminDashboard();
    } else {
        showToast('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
    }
}

function logout() {
    localStorage.removeItem('adminLoggedIn');
    showLoginForm();
    document.getElementById('loginForm').reset();
    showToast('تم تسجيل الخروج بنجاح', 'success');
}

async function loadAdminProducts() {
    try {
        const response = await fetch('data/products.json');
        const data = await response.json();
        
        adminProducts = data.products;
        
        renderAdminProducts();
        updateStats();
    } catch (error) {
        console.error('Error loading products:', error);
        loadProductsFromLocalStorage();
    }
}

function loadProductsFromLocalStorage() {
    const stored = localStorage.getItem('adminProducts');
    if (stored) {
        adminProducts = JSON.parse(stored);
    } else {
        adminProducts = [];
    }
    renderAdminProducts();
    updateStats();
}

function saveProductsToStorage() {
    localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
    localStorage.setItem('products', JSON.stringify(adminProducts));
    updateStats();
}

function updateStats() {
    document.getElementById('totalProducts').textContent = adminProducts.length;
    document.getElementById('newProducts').textContent = adminProducts.filter(p => p.isNew).length;
    document.getElementById('bestSellers').textContent = adminProducts.filter(p => p.isBestSeller).length;
    document.getElementById('onSale').textContent = adminProducts.filter(p => p.isSale).length;
}

function renderAdminProducts(filtered = null) {
    const tbody = document.getElementById('productsTableBody');
    const productsToRender = filtered || adminProducts;
    
    tbody.innerHTML = productsToRender.map(product => {
        const price = product.discount > 0 
            ? product.price * (1 - product.discount / 100) 
            : product.price;
        
        let badges = '';
        if (product.isNew) badges += '<span class="badge bg-success me-1">جديد</span>';
        if (product.isBestSeller) badges += '<span class="badge bg-warning me-1" style="color: black;">الأكثر مبيعاً</span>';
        if (product.isSale) badges += '<span class="badge bg-danger">عرض</span>';
        
        return `
            <tr>
                <td>
                    <img src="${product.image}" alt="${product.name}" 
                         style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                </td>
                <td>
                    <strong>${product.name}</strong><br>
                    <small class="text-muted">${product.category}</small>
                </td>
                <td>${product.category}</td>
                <td>
                    <strong style="color: var(--primary-color);">${price.toFixed(2)} د.ل</strong>
                    ${product.discount > 0 ? `<br><small class="text-muted"><del>${product.price.toFixed(2)} د.ل</del></small>` : ''}
                </td>
                <td>${badges || '<small class="text-muted">-</small>'}</td>
                <td>
                    <button class="btn btn-sm btn-primary me-1" onclick="editProduct(${product.id})" title="تعديل">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function addProduct(e) {
    e.preventDefault();
    
    const colorsText = document.getElementById('productColors').value;
    const sizesText = document.getElementById('productSizes').value;
    
    const newProduct = {
        id: Date.now(),
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        price: parseFloat(document.getElementById('productPrice').value),
        discount: parseInt(document.getElementById('productDiscount').value) || 0,
        description: document.getElementById('productDescription').value,
        image: document.getElementById('productImage').value,
        rating: parseFloat(document.getElementById('productRating').value) || 4.5,
        reviews: parseInt(document.getElementById('productReviews').value) || 10,
        isNew: document.getElementById('isNew').checked,
        isBestSeller: document.getElementById('isBestSeller').checked,
        isSale: document.getElementById('isSale').checked,
        colors: colorsText ? colorsText.split(',').map(c => c.trim()) : [],
        sizes: sizesText ? sizesText.split(',').map(s => s.trim()) : []
    };
    
    adminProducts.unshift(newProduct);
    saveProductsToStorage();
    renderAdminProducts();
    document.getElementById('addProductForm').reset();
    document.getElementById('productDiscount').value = '0';
    document.getElementById('productRating').value = '4.5';
    document.getElementById('productReviews').value = '10';
    
    showToast('تم إضافة المنتج بنجاح!', 'success');
}

function editProduct(id) {
    editProductId = id;
    const product = adminProducts.find(p => p.id === id);
    
    if (product) {
        document.getElementById('editProductId').value = product.id;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductCategory').value = product.category;
        document.getElementById('editProductPrice').value = product.price;
        document.getElementById('editProductDiscount').value = product.discount;
        document.getElementById('editProductDescription').value = product.description;
        document.getElementById('editProductImage').value = product.image;
        document.getElementById('editProductRating').value = product.rating;
        document.getElementById('editProductColors').value = product.colors.join(', ');
        document.getElementById('editProductSizes').value = product.sizes.join(', ');
        document.getElementById('editIsNew').checked = product.isNew;
        document.getElementById('editIsBestSeller').checked = product.isBestSeller;
        document.getElementById('editIsSale').checked = product.isSale;
        
        const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
        modal.show();
    }
}

function saveEditProduct() {
    const id = parseInt(document.getElementById('editProductId').value);
    const productIndex = adminProducts.findIndex(p => p.id === id);
    
    if (productIndex !== -1) {
        const colorsText = document.getElementById('editProductColors').value;
        const sizesText = document.getElementById('editProductSizes').value;
        
        adminProducts[productIndex] = {
            ...adminProducts[productIndex],
            name: document.getElementById('editProductName').value,
            category: document.getElementById('editProductCategory').value,
            price: parseFloat(document.getElementById('editProductPrice').value),
            discount: parseInt(document.getElementById('editProductDiscount').value) || 0,
            description: document.getElementById('editProductDescription').value,
            image: document.getElementById('editProductImage').value,
            rating: parseFloat(document.getElementById('editProductRating').value) || 4.5,
            colors: colorsText ? colorsText.split(',').map(c => c.trim()) : [],
            sizes: sizesText ? sizesText.split(',').map(s => s.trim()) : [],
            isNew: document.getElementById('editIsNew').checked,
            isBestSeller: document.getElementById('editIsBestSeller').checked,
            isSale: document.getElementById('editIsSale').checked
        };
        
        saveProductsToStorage();
        renderAdminProducts();
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
        modal.hide();
        
        showToast('تم تعديل المنتج بنجاح!', 'success');
    }
}

function deleteProduct(id) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        adminProducts = adminProducts.filter(p => p.id !== id);
        saveProductsToStorage();
        renderAdminProducts();
        showToast('تم حذف المنتج بنجاح!', 'success');
    }
}

function searchProducts(e) {
    const query = e.target.value.toLowerCase();
    
    if (query === '') {
        renderAdminProducts();
        return;
    }
    
    const filtered = adminProducts.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
    );
    
    renderAdminProducts(filtered);
}

function exportProducts() {
    const dataStr = JSON.stringify({ products: adminProducts }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'products.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showToast('تم تصدير المنتجات بنجاح!', 'success');
}
