'use client';

import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

const festivals = [
  {
    id: 1,
    name: 'Irreecha Festival',
    date: 'October',
    location: 'Bishoftu',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800',
    description: 'Oromo thanksgiving celebration',
  },
  {
    id: 2,
    name: 'Ashenda Festival',
    date: 'August',
    location: 'Tigray',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=800',
    description: 'Young women celebration',
  },
  {
    id: 3,
    name: 'Timket Festival',
    date: 'January',
    location: 'Nationwide',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800',
    description: 'Ethiopian Epiphany celebration',
  },
  {
    id: 4,
    name: 'Meskel Festival',
    date: 'September',
    location: 'Addis Ababa',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800',
    description: 'Finding of the True Cross',
  },
];

export default function Festivals() {
  return (
    <section id="festivals" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Popular Festivals
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience Ethiopia's vibrant cultural celebrations
          </p>
        </div>

        {/* Festivals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {festivals.map((festival, index) => (
            <div
              key={festival.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url('${festival.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {festival.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {festival.description}
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-green-600" />
                    {festival.date}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-green-600" />
                    {festival.location}
                  </div>
                </div>
                <a
                  href={`${FRONTEND_URL}/login?force=true`}
                  className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors text-sm group"
                >
                  Learn More
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
