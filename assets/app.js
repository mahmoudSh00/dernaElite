// Simple frontend helpers for forms
document.addEventListener('DOMContentLoaded', ()=>{
	// transactions: add item
	const addBtn = document.getElementById('addItemBtn');
	if (addBtn) {
		const container = document.getElementById('itemsContainer');
		addBtn.addEventListener('click', ()=>{
			const idx = container.children.length;
			const div = document.createElement('div');
			div.className = 'item-row';
			div.innerHTML = `\n				<select class="sel-item">${availableItems.map(i=>`<option value="${i.id}" data-price="${i.price}">${i.name} (${i.stock})</option>`).join('')} </select>\n				<input class="qty" type="number" value="1" min="1">\n				<input class="price" type="number" step="0.01" value="0">\n				<button class="remove">✕</button>`;
			container.appendChild(div);
			div.querySelector('.remove').addEventListener('click', ()=>div.remove());
			const sel = div.querySelector('.sel-item');
			const priceIn = div.querySelector('.price');
			sel.addEventListener('change', ()=>{priceIn.value = sel.selectedOptions[0].dataset.price});
		});
		const form = document.getElementById('txForm');
		if (form) {
			form.addEventListener('submit', (e)=>{
				e.preventDefault();
				const rows = Array.from(document.querySelectorAll('#itemsContainer .item-row'));
				const items = rows.map(r=>({id:parseInt(r.querySelector('.sel-item').value), qty:parseInt(r.querySelector('.qty').value), price:parseFloat(r.querySelector('.price').value)}));
				document.getElementById('itemsJson').value = JSON.stringify(items);
				form.submit();
			});
		}
	}
});
