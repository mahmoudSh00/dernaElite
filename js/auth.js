const auth = {
    currentUser: null,

    init: async () => {
        const users = await db.getAll('users');
        if (users.length === 0) {
            await auth.createDefaultUser();
        }

        const sessionUser = localStorage.getItem('pos_user');
        if (sessionUser) {
            auth.currentUser = JSON.parse(sessionUser);
            return true;
        }
        return false;
    },

    createDefaultUser: async () => {
        const defaultUser = {
            username: 'معتصم',
            password: '12121212',
            fullName: 'معتصم المدير',
            role: 'admin',
            isActive: true,
            createdAt: new Date().toISOString()
        };
        await db.add('users', defaultUser);
        console.log('Default user created');
    },

    login: async (username, password) => {
        try {
            const user = await db.getByIndex('users', 'username', username);
            if (user && user.password === password && user.isActive) {
                auth.currentUser = user;
                localStorage.setItem('pos_user', JSON.stringify(user));
                return { success: true };
            } else {
                return { success: false, message: 'بيانات الدخول غير صحيحة أو الحساب معطل' };
            }
        } catch (e) {
            console.error(e);
            return { success: false, message: 'حدث خطأ أثناء تسجيل الدخول' };
        }
    },

    logout: () => {
        auth.currentUser = null;
        localStorage.removeItem('pos_user');
        window.location.reload();
    },

    checkPermission: (requiredRole) => {
        if (!auth.currentUser) return false;
        if (auth.currentUser.role === 'admin') return true;
        return auth.currentUser.role === requiredRole;
    },

    applyPermissions: () => {
        if (!auth.currentUser) return;
        const role = auth.currentUser.role;
        document.body.setAttribute('data-role', role);

        if (role === 'cashier') {
            document.querySelectorAll('[data-target="settings"], [data-target="products"], [data-target="reports"]').forEach(el => {
                el.style.display = 'none';
            });
        }
        
        if (role === 'employee') {
             document.querySelectorAll('[data-target="settings"]').forEach(el => {
                el.style.display = 'none';
            });
        }
    }
};
