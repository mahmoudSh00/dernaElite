const utils = {
    formatCurrency: (amount) => {
        return parseFloat(amount).toFixed(2) + ' ر.س';
    },

    formatDate: (dateString) => {
        const d = new Date(dateString);
        return d.toLocaleDateString('ar-SA') + ' ' + d.toLocaleTimeString('ar-SA');
    },

    generateId: () => {
        return '_' + Math.random().toString(36).substr(2, 9);
    },

    generateBarcode: () => {
        return Math.floor(Math.random() * 899999999999 + 100000000000).toString();
    },

    showAlert: (message, type = 'info') => {
        alert(message);
    }
};
