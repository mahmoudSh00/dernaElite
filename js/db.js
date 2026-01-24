const DB_NAME = 'POS_PRO_DB';
const DB_VERSION = 1;

const db = {
    connection: null,

    init: () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const conn = event.target.result;

                if (!conn.objectStoreNames.contains('users')) {
                    const userStore = conn.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
                    userStore.createIndex('username', 'username', { unique: true });
                }

                if (!conn.objectStoreNames.contains('products')) {
                    const productStore = conn.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
                    productStore.createIndex('barcode', 'barcode', { unique: true });
                }

                if (!conn.objectStoreNames.contains('transactions')) {
                    const transStore = conn.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true });
                    transStore.createIndex('date', 'date', { unique: false });
                }

                if (!conn.objectStoreNames.contains('settings')) {
                    conn.createObjectStore('settings', { keyPath: 'key' });
                }
            };

            request.onsuccess = (event) => {
                db.connection = event.target.result;
                console.log('Database initialized successfully');
                resolve(db.connection);
            };

            request.onerror = (event) => {
                console.error('Database error:', event.target.error);
                reject(event.target.error);
            };
        });
    },

    getAll: (storeName) => {
        return new Promise((resolve, reject) => {
            const transaction = db.connection.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    get: (storeName, key) => {
        return new Promise((resolve, reject) => {
            const transaction = db.connection.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    add: (storeName, data) => {
        return new Promise((resolve, reject) => {
            const transaction = db.connection.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    update: (storeName, data) => {
        return new Promise((resolve, reject) => {
            const transaction = db.connection.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    delete: (storeName, key) => {
        return new Promise((resolve, reject) => {
            const transaction = db.connection.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    },

    getByIndex: (storeName, indexName, value) => {
        return new Promise((resolve, reject) => {
            const transaction = db.connection.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.get(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    exportDatabase: async () => {
        const data = {};
        const stores = ['users', 'products', 'transactions', 'settings'];
        for (const store of stores) {
            data[store] = await db.getAll(store);
        }
        return JSON.stringify(data);
    },

    importDatabase: async (jsonString) => {
        const data = JSON.parse(jsonString);
        const stores = ['users', 'products', 'transactions', 'settings'];
        const transaction = db.connection.transaction(stores, 'readwrite');
        
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve(true);
            transaction.onerror = () => reject(transaction.error);

            stores.forEach(storeName => {
                if (data[storeName]) {
                    const store = transaction.objectStore(storeName);
                    store.clear(); 
                    data[storeName].forEach(item => store.add(item));
                }
            });
        });
    }
};
