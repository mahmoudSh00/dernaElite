"use client";

import { useCart } from "@/lib/cart";
import { useState } from "react";
import Link from "next/link";

export default function CheckoutPage() {
  const { cart, total, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) return;

    const orderItems = cart.map((item) => `${item.name} - ${item.quantity} - $${item.price}`).join("\n");
    const message = `
اسم العميل: ${formData.name}
رقم الهاتف: ${formData.phone}
المدينة: ${formData.city}
العنوان: ${formData.address}
ملاحظات: ${formData.notes}

المنتجات المطلوبة:
${orderItems}

الإجمالي الكلي: $${total.toFixed(2)}
    `.trim();

    const whatsappUrl = `https://wa.me/218920719250?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");

    clearCart();
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Derna Elite
            </Link>
          </div>
        </nav>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl text-gray-500 mb-4">السلة فارغة!</h2>
          <Link
            href="/"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg inline-block hover:bg-blue-700"
          >
            تسوق الآن
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Derna Elite
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">إتمام الطلب</h1>

        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow space-y-4">
          <div>
            <label className="block font-bold mb-1">الاسم الكامل</label>
            <input
              required
              type="text"
              className="w-full border rounded-lg px-4 py-2"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-bold mb-1">رقم الهاتف</label>
            <input
              required
              type="tel"
              className="w-full border rounded-lg px-4 py-2"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-bold mb-1">المدينة</label>
            <input
              required
              type="text"
              className="w-full border rounded-lg px-4 py-2"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-bold mb-1">العنوان</label>
            <textarea
              required
              className="w-full border rounded-lg px-4 py-2"
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-bold mb-1">ملاحظات</label>
            <textarea
              className="w-full border rounded-lg px-4 py-2"
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold text-lg mb-2">الإجمالي:</h3>
            <p className="text-3xl font-bold text-blue-600">${total.toFixed(2)}</p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 text-xl font-bold"
          >
            تأكيد الطلب واتصال بواتساب
          </button>
        </form>
      </div>
    </div>
  );
}
