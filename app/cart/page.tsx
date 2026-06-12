"use client";

import { useCart } from "@/lib/cart";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, total } = useCart();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Derna Elite
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">سلة التسوق</h1>

        {cart.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl text-gray-500 mb-4">السلة فارغة!</h2>
            <Link
              href="/"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg inline-block hover:bg-blue-700"
            >
              تسوق الآن
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4 mb-8">
              {cart.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-lg shadow flex gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-blue-600 font-bold">${item.price}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="bg-gray-200 px-3 py-1 rounded"
                      >
                        -
                      </button>
                      <span className="font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="bg-gray-200 px-3 py-1 rounded"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 mr-4"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-bold">الإجمالي:</span>
                <span className="text-3xl font-bold text-blue-600">${total.toFixed(2)}</span>
              </div>
              <Link
                href="/checkout"
                className="w-full bg-blue-600 text-white py-3 rounded-lg text-center block hover:bg-blue-700"
              >
                إتمام الطلب
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
