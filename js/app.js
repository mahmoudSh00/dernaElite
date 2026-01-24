const app = {
    state: {
        currentView: 'dashboard',
        cart: [],
        products: [],
        users: []
    },

    init: async () => {
        try {
            await db.init();
        } catch (e) {
            console.error("DB Init Failed", e);
            alert("فشل في تحميل قاعدة البيانات. المتصفح قد لا يدعم IndexedDB.");
            return;
        }

        const isLoggedIn = await auth.init();
        document.getElementById('loader').classList.add('hidden');

        if (isLoggedIn) {
            app.showApp();
        } else {
            app.showLogin();
        }

        app.bindEvents();
    },

    bindEvents: () => {
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const u = document.getElementById('username').value;
            const p = document.getElementById('password').value;
            
            const result = await auth.login(u, p);
            if (result.success) {
                app.showApp();
            } else {
                const err = document.getElementById('login-error');
                err.textContent = result.message;
                err.classList.remove('hidden');
            }
        });

        document.querySelectorAll('.nav-btn[data-target]').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.target;
                app.navigate(target);
                if(window.innerWidth <= 768) {
                    document.getElementById('sidebar').classList.remove('open');
                }
            });
        });

        document.getElementById('logout-btn').addEventListener('click', auth.logout);
        document.getElementById('toggle-sidebar').addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        document.getElementById('theme-toggle').addEventListener('click', () => {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
        });

        document.getElementById('add-product-btn').addEventListener('click', () => app.openProductModal());
        document.getElementById('prod-search').addEventListener('input', (e) => app.loadProducts(e.target.value));

        document.getElementById('pos-search').addEventListener('input', (e) => app.renderPosGrid(e.target.value));
        document.getElementById('clear-cart').addEventListener('click', () => { app.state.cart = []; app.updateCartUI(); });
        document.getElementById('checkout-btn').addEventListener('click', app.processCheckout);
        
        ['discount-val', 'tax-rate'].forEach(id => {
            document.getElementById(id).addEventListener('input', app.updateCartUI);
        });

        document.getElementById('add-user-btn').addEventListener('click', () => app.openUserModal());
        document.getElementById('import-file').addEventListener('change', app.importData);
        
        document.getElementById('scan-btn').addEventListener('click', () => {
             document.getElementById('pos-search').focus();
             utils.showAlert('يرجى استخدام قارئ الباركود أو الكاميرا (قيد التطوير)');
        });
    },

    showLogin: () => {
        document.getElementById('login-view').classList.remove('hidden');
        document.getElementById('app-layout').classList.add('hidden');
    },

    showApp: () => {
        document.getElementById('login-view').classList.add('hidden');
        document.getElementById('app-layout').classList.remove('hidden');
        document.getElementById('user-display-name').textContent = auth.currentUser.fullName;
        
        auth.applyPermissions();
        app.navigate('dashboard');
        app.loadDashboardData();
    },

    navigate: (viewId) => {
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

        const target = document.getElementById(viewId);
        if (target) {
            target.classList.add('active');
            app.state.currentView = viewId;
            
            const navBtn = document.querySelector(`.nav-btn[data-target="${viewId}"]`);
            if (navBtn) navBtn.classList.add('active');

            const titles = {
                'dashboard': 'لوحة التحكم',
                'pos': 'نقطة البيع',
                'products': 'إدارة المنتجات',
                'transactions': 'المبيعات',
                'reports': 'التقارير',
                'settings': 'الإعدادات'
            };
            document.getElementById('page-title').textContent = titles[viewId] || 'النظام';

            if (viewId === 'products') app.loadProducts();
            if (viewId === 'pos') app.initPos();
            if (viewId === 'settings') app.loadUsers();
            if (viewId === 'transactions') app.loadTransactions();
            if (viewId === 'dashboard') app.loadDashboardData();
        }
    },

    loadDashboardData: async () => {
        const products = await db.getAll('products');
        const transactions = await db.getAll('transactions');
        
        const today = new Date().toLocaleDateString();
        const todayTrans = transactions.filter(t => new Date(t.date).toLocaleDateString() === today && t.type === 'sale');
        
        const salesTotal = todayTrans.reduce((sum, t) => sum + t.finalTotal, 0);
        
        document.getElementById('today-sales').textContent = utils.formatCurrency(salesTotal);
        document.getElementById('today-orders').textContent = todayTrans.length;
        document.getElementById('total-products').textContent = products.length;
        
        const lowStock = products.filter(p => p.stock <= 5).length;
        document.getElementById('low-stock-count').textContent = lowStock;
    },

    loadProducts: async (query = '') => {
        let products = await db.getAll('products');
        if (query) {
            const q = query.toLowerCase();
            products = products.filter(p => p.name.toLowerCase().includes(q) || p.barcode.includes(q));
        }
        app.state.products = products;
        
        const tbody = document.getElementById('products-table-body');
        tbody.innerHTML = '';
        
        products.forEach(p => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><div class="prod-img" style="width: 40px; height: 40px; background: #ddd;"></div></td>
                <td>${p.name}</td>
                <td>${p.barcode}</td>
                <td>${p.price}</td>
                <td>${p.stock}</td>
                <td>
                    <button class="icon-btn" onclick="app.openProductModal(${p.id})">✏️</button>
                    <button class="icon-btn danger-text" onclick="app.deleteProduct(${p.id})">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    openProductModal: async (id = null) => {
        let product = { name: '', barcode: '', price: 0, cost: 0, stock: 0, category: '' };
        if (id) {
            product = await db.get('products', id);
        }

        const modalContent = `
            <form id="product-form">
                <input type="hidden" id="p-id" value="${id || ''}">
                <div class="form-group"><label>اسم المنتج</label><input id="p-name" required value="${product.name}"></div>
                <div class="form-group"><label>الباركود</label>
                    <div style="display:flex; gap:5px;">
                        <input id="p-barcode" required value="${product.barcode}">
                        <button type="button" class="btn-secondary" onclick="document.getElementById('p-barcode').value = utils.generateBarcode()">توليد</button>
                    </div>
                </div>
                <div class="form-group"><label>سعر البيع</label><input type="number" id="p-price" required value="${product.price}"></div>
                <div class="form-group"><label>سعر الشراء</label><input type="number" id="p-cost" required value="${product.cost}"></div>
                <div class="form-group"><label>الكمية</label><input type="number" id="p-stock" required value="${product.stock}"></div>
                <div class="form-group"><label>التصنيف</label><input id="p-category" value="${product.category}"></div>
                <button type="submit" class="btn-primary full-width">حفظ</button>
            </form>
        `;

        app.showModal(id ? 'تعديل منتج' : 'منتج جديد', modalContent);
        
        document.getElementById('product-form').onsubmit = async (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('p-name').value,
                barcode: document.getElementById('p-barcode').value,
                price: parseFloat(document.getElementById('p-price').value),
                cost: parseFloat(document.getElementById('p-cost').value),
                stock: parseInt(document.getElementById('p-stock').value),
                category: document.getElementById('p-category').value
            };
            
            const pid = document.getElementById('p-id').value;
            
            if (pid) {
                data.id = parseInt(pid);
                await db.update('products', data);
            } else {
                await db.add('products', data);
            }
            
            app.closeModal();
            app.loadProducts();
            utils.showAlert('تم الحفظ بنجاح');
        };
    },

    deleteProduct: async (id) => {
        if (confirm('هل أنت متأكد من الحذف؟')) {
            await db.delete('products', id);
            app.loadProducts();
        }
    },

    initPos: async () => {
        app.state.products = await db.getAll('products');
        app.renderPosGrid();
        app.updateCartUI();
    },

    renderPosGrid: (query = '') => {
        const grid = document.getElementById('pos-grid');
        grid.innerHTML = '';
        
        let products = app.state.products;
        if (query) {
            const q = query.toLowerCase();
            products = products.filter(p => p.name.toLowerCase().includes(q) || p.barcode.includes(q));
            
            const exactMatch = products.find(p => p.barcode === query);
            if (exactMatch && products.length === 1) {
                app.addToCart(exactMatch);
                document.getElementById('pos-search').value = '';
                app.renderPosGrid();
                return;
            }
        }

        products.forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div>
                    <div class="prod-img"></div>
                    <div>${p.name}</div>
                </div>
                <div>
                    <div class="prod-price">${utils.formatCurrency(p.price)}</div>
                    <div class="prod-stock">مخزون: ${p.stock}</div>
                </div>
            `;
            card.onclick = () => app.addToCart(p);
            grid.appendChild(card);
        });
    },

    addToCart: (product) => {
        if (product.stock <= 0) {
            utils.showAlert('المنتج نفد من المخزون', 'warning');
            return;
        }

        const existingItem = app.state.cart.find(item => item.id === product.id);
        if (existingItem) {
            if (existingItem.qty < product.stock) {
                existingItem.qty++;
            } else {
                utils.showAlert('لا توجد كمية كافية');
            }
        } else {
            app.state.cart.push({ ...product, qty: 1 });
        }
        app.updateCartUI();
    },

    removeFromCart: (index) => {
        app.state.cart.splice(index, 1);
        app.updateCartUI();
    },

    updateCartUI: () => {
        const container = document.getElementById('cart-items');
        container.innerHTML = '';
        
        let subtotal = 0;

        app.state.cart.forEach((item, index) => {
            subtotal += item.price * item.qty;
            const el = document.createElement('div');
            el.className = 'cart-item';
            el.innerHTML = `
                <div class="cart-item-info">
                    <div>${item.name}</div>
                    <small>${item.price} x ${item.qty}</small>
                </div>
                <div class="cart-controls">
                    <button onclick="app.changeQty(${index}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button onclick="app.changeQty(${index}, 1)">+</button>
                    <button class="danger-text" onclick="app.removeFromCart(${index})">x</button>
                </div>
            `;
            container.appendChild(el);
        });

        const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
        const discount = parseFloat(document.getElementById('discount-val').value) || 0;
        
        const taxAmount = (subtotal * taxRate) / 100;
        const finalTotal = subtotal + taxAmount - discount;

        document.getElementById('cart-total').textContent = utils.formatCurrency(subtotal);
        document.getElementById('cart-final').textContent = utils.formatCurrency(Math.max(0, finalTotal));
    },

    changeQty: (index, delta) => {
        const item = app.state.cart[index];
        const newQty = item.qty + delta;
        if (newQty > 0 && newQty <= item.stock) {
            item.qty = newQty;
        } else if (newQty > item.stock) {
            utils.showAlert('الكمية غير متوفرة');
        }
        app.updateCartUI();
    },

    processCheckout: async () => {
        if (app.state.cart.length === 0) return utils.showAlert('السلة فارغة');

        if (!confirm('تأكيد عملية البيع؟')) return;

        const subtotal = app.state.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const taxRate = parseFloat(document.getElementById('tax-rate').value) || 0;
        const discount = parseFloat(document.getElementById('discount-val').value) || 0;
        const finalTotal = subtotal + ((subtotal * taxRate) / 100) - discount;

        const transaction = {
            date: new Date().toISOString(),
            type: 'sale',
            items: app.state.cart,
            subtotal,
            taxRate,
            discount,
            finalTotal,
            cashier: auth.currentUser.username
        };

        try {
            await db.add('transactions', transaction);

            for (const item of app.state.cart) {
                const product = await db.get('products', item.id);
                product.stock -= item.qty;
                await db.update('products', product);
            }

            app.state.cart = [];
            app.updateCartUI();
            app.initPos(); 
            utils.showAlert('تمت العملية بنجاح! ✅');
            app.printReceipt(transaction);

        } catch (e) {
            console.error(e);
            utils.showAlert('حدث خطأ أثناء الحفظ', 'error');
        }
    },

    printReceipt: (transaction) => {
        console.log('Printing Receipt...', transaction);
    },

    loadTransactions: async () => {
        const trans = await db.getAll('transactions');
        const tbody = document.getElementById('transactions-table-body');
        tbody.innerHTML = '';
        
        trans.sort((a, b) => new Date(b.date) - new Date(a.date));

        trans.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${t.id}</td>
                <td>${utils.formatDate(t.date)}</td>
                <td>زبون عام</td>
                <td>${utils.formatCurrency(t.finalTotal)}</td>
                <td>نقدي</td>
                <td><button class="btn-text">عرض</button></td>
            `;
            tbody.appendChild(tr);
        });
    },

    loadUsers: async () => {
        const users = await db.getAll('users');
        const tbody = document.getElementById('users-table-body');
        tbody.innerHTML = '';
        
        users.forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.fullName}</td>
                <td>${u.username}</td>
                <td>${u.role}</td>
                <td>${u.isActive ? 'نشط' : 'معطل'}</td>
                <td>
                     <button class="icon-btn" onclick="app.deleteUser(${u.id})">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    },

    openUserModal: () => {
        const modalContent = `
            <form id="user-form">
                <div class="form-group"><label>الاسم الكامل</label><input id="u-fullname" required></div>
                <div class="form-group"><label>اسم المستخدم</label><input id="u-username" required></div>
                <div class="form-group"><label>كلمة المرور</label><input type="password" id="u-password" required></div>
                <div class="form-group"><label>الصلاحية</label>
                    <select id="u-role">
                        <option value="admin">مدير</option>
                        <option value="employee">موظف</option>
                        <option value="cashier">كاشير</option>
                    </select>
                </div>
                <button type="submit" class="btn-primary full-width">حفظ</button>
            </form>
        `;
        app.showModal('إضافة مستخدم', modalContent);
        
        document.getElementById('user-form').onsubmit = async (e) => {
            e.preventDefault();
            const newUser = {
                fullName: document.getElementById('u-fullname').value,
                username: document.getElementById('u-username').value,
                password: document.getElementById('u-password').value,
                role: document.getElementById('u-role').value,
                isActive: true,
                createdAt: new Date().toISOString()
            };
            
            try {
                await db.add('users', newUser);
                app.closeModal();
                app.loadUsers();
                utils.showAlert('تمت الإضافة');
            } catch (e) {
                alert('خطأ: قد يكون اسم المستخدم مكرر');
            }
        };
    },

    deleteUser: async (id) => {
        if(confirm('حذف المستخدم؟')) {
            await db.delete('users', id);
            app.loadUsers();
        }
    },

    showModal: (title, content) => {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = content;
        document.getElementById('modal-overlay').classList.remove('hidden');
        document.querySelector('.close-modal').onclick = app.closeModal;
    },

    closeModal: () => {
        document.getElementById('modal-overlay').classList.add('hidden');
    },

    exportData: async () => {
        const json = await db.exportDatabase();
        const blob = new Blob([json], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pos_backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
    },

    importData: async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                await db.importDatabase(event.target.result);
                alert('تم استعادة النسخة الاحتياطية بنجاح! سيتم إعادة تحميل الصفحة.');
                window.location.reload();
            } catch (err) {
                alert('فشل استعادة الملف. تأكد من صحة الملف.');
            }
        };
        reader.readAsText(file);
    }
};

document.addEventListener('DOMContentLoaded', app.init);
