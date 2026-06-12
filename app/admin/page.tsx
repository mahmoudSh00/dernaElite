"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggedIn(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Derna Elite
          </Link>
        </div>
      </nav>

      {!isLoggedIn ? (
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white p-8 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6 text-center">تسجيل دخول المشرف</h1>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block font-bold mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  className="w-full border rounded-lg px-4 py-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block font-bold mb-1">كلمة المرور</label>
                <input
                  type="password"
                  className="w-full border rounded-lg px-4 py-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                دخول
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-8">لوحة التحكم</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-2">عدد المنتجات</h3>
              <p className="text-3xl font-bold text-blue-600">20</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-2">عدد الطلبات</h3>
              <p className="text-3xl font-bold text-green-600">0</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-2">إجمالي المبيعات</h3>
              <p className="text-3xl font-bold text-purple-600">$0</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">إدارة المنتجات</h2>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg mb-4 hover:bg-blue-700">
              إضافة منتج جديد
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
