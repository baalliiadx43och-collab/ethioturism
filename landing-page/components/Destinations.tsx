'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000';

const destinations = [
  {
    id: 1,
    name: 'Lalibela',
    description: 'Ancient rock-hewn churches and UNESCO World Heritage site',
    image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?q=80&w=800',
  },
  {
    id: 2,
    name: 'Sof Omar Caves',
    description: 'Spectacular underground cave system and natural wonder',
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800',
  },
  {
    id: 3,
    name: 'Bale Mountains',
    description: 'Pristine wilderness with unique wildlife and landscapes',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800',
  },
  {
    id: 4,
    name: 'Simien Mountains',
    description: 'Dramatic peaks and endemic wildlife in stunning highlands',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800',
  },
  {
    id: 5,
    name: 'Danakil Depression',
    description: 'One of the hottest and most alien landscapes on Earth',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=800',
  },
  {
    id: 6,
    name: 'Gondar Castles',
    description: 'Medieval castles and royal enclosures of Ethiopian emperors',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=800',
  },
];

export default function Destinations() {
  return (
    <section id="destinations" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Featured Destinations
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore Ethiopia's most iconic and breathtaking locations
          </p>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {destinations.map((destination, index) => (
            <div
              key={destination.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                  style={{ backgroundImage: `url('${destination.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {destination.name}
                </h3>
                <p className="text-gray-600 mb-4">{destination.description}</p>
                <a
                  href={`${FRONTEND_URL}/login?force=true`}
                  className="inline-flex items-center text-green-600 font-semibold hover:text-green-700 transition-colors group"
                >
                  Explore More
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
