'use client';

import { Landmark, Trees, Music, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

const categories = [
  {
    id: 1,
    title: 'Historical Sites',
    description: "Explore Ethiopia's ancient heritage and archaeological wonders",
    icon: Landmark,
    image: 'https://images.unsplash.com/photo-1577717903315-1691ae25f322?q=80&w=800',
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 2,
    title: 'National Parks',
    description: 'Discover wildlife and breathtaking natural landscapes',
    icon: Trees,
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800',
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 3,
    title: 'Cultural Festivals',
    description: 'Experience vibrant Ethiopian traditions and celebrations',
    icon: Music,
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800',
    color: 'from-red-500 to-pink-600',
  },
];

export default function Categories() {
  return (
    <section id="categories" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Tourism Categories
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your adventure and discover what makes Ethiopia unique
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                className="group relative h-96 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url('${category.image}')` }}
                />

                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-80 group-hover:opacity-90 transition-opacity`} />

                {/* Content */}
                <div className="relative h-full flex flex-col justify-end p-8 text-white">
                  <div className="mb-4 transform group-hover:scale-110 transition-transform">
                    <Icon className="w-16 h-16" />
                  </div>
                  <h3 className="text-3xl font-bold mb-3">{category.title}</h3>
                  <p className="text-white/90 mb-6 text-lg">
                    {category.description}
                  </p>
                  <a
                    href={`${FRONTEND_URL}/login?force=true`}
                    className="inline-flex items-center bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors w-fit group"
                  >
                    Explore
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
