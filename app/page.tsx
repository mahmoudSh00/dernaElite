"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  stock: number;
}

const sampleProducts: Product[] = [
  { id: "1", name: "سماعات بلوتوث", price: 89, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop", description: "سماعات عالية الجودة", category: "إلكترونيات", stock: 50 },
  { id: "2", name: "ساعة ذكية", price: 199, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop", description: "ساعة ذكية متعددة الميزات", category: "إلكترونيات", stock: 30 },
  { id: "3", name: "حذاء رياضي", price: 120, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop", description: "حذاء مريح للرياضة", category: "أحذية", stock: 100 },
  { id: "4", name: "كأس حرارية", price: 35, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop", description: "كأس تحافظ على درجة الحرارة", category: "منزلية", stock: 80 },
  { id: "5", name: "نظارة شمسية", price: 75, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop", description: "نظارة عصرية", category: "ملابس", stock: 60 },
  { id: "6", name: "حقيبة ظهر", price: 95, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop", description: "حقيبة متعددة الجيوب", category: "حقائب", stock: 40 },
  { id: "7", name: "كاميرا ديجيتال", price: 450, image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&h=400&fit=crop", description: "كاميرا عالية الدقة", category: "إلكترونيات", stock: 25 },
  { id: "8", name: "مفرح كهربائي", price: 150, image: "https://images.unsplash.com/photo-1580910051075-5947ccb8cee1?w=400&h=400&fit=crop", description: "مفرح فعال ومريح", category: "منزلية", stock: 35 },
  { id: "9", name: "قميص قطني", price: 45, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop", description: "قميص مريح قطني", category: "ملابس", stock: 200 },
  { id: "10", name: "سماعات أذن لاسلكية", price: 130, image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop", description: "سماعات أذن عالية الجودة", category: "إلكترونيات", stock: 45 },
  { id: "11", name: "حقيبة يد أنيقة", price: 180, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop", description: "حقيبة يد فخمة", category: "حقائب", stock: 20 },
  { id: "12", name: "كتبة خشبية", price: 320, image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=400&fit=crop", description: "كتبة مناسبة للمنزل", category: "منزلية", stock: 15 },
  { id: "13", name: "نظارة طبية", price: 85, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop", description: "نظارة طبية أنيقة", category: "ملابس", stock: 55 },
  { id: "14", name: "دراجة جبلية", price: 890, image: "https://images.unsplash.com/photo-1485965120184-e220fa91ce3e?w=400&h=400&fit=crop", description: "دراجة عالية الجودة", category: "رياضة", stock: 10 },
  { id: "15", name: "حذاء كلاسيكي", price: 140, image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop", description: "حذاء كلاسيكي أنيق", category: "أحذية", stock: 70 },
  { id: "16", name: "طقم مكتب", price: 480, image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop", description: "طقم مكتب متكامل", category: "منزلية", stock: 12 },
  { id: "17", name: "حقيبة ظهر مدرسية", price: 65, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop", description: "حقيبة ظهر مناسبة للمدرسة", category: "حقائب", stock: 90 },
  { id: "18", name: "مفارش سرير", price: 110, image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=400&fit=crop", description: "مفارش ناعمة ومريحة", category: "منزلية", stock: 65 },
  { id: "19", name: "جاكيت جلد", price: 250, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop", description: "جاكيت جلد أصلي", category: "ملابس", stock: 25 },
  { id: "20", name: "حذاء ركض", price: 160, image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=400&fit=crop", description: "حذاء ركض مريح", category: "أحذية", stock: 50 },
];

export default function HomePage() {
  const { addToCart, cart } = useCart();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Derna Elite
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative bg-blue-600 text-white px-4 py-2 rounded-lg">
              سلة التسوق
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href="/admin" className="text-gray-600 hover:text-blue-600">
              لوحة التحكم
            </Link>
          </div>
        </div>
      </nav>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">مرحباً بك في متجر درنة</h1>
          <p className="text-xl mb-8">أفضل المنتجات بأفضل الأسعار</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">المنتجات المميزة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {sampleProducts.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
                loading="lazy"
              />
              <div className="p-6">
                <h3 className="font-bold text-lg mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    أضف للسلة
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
