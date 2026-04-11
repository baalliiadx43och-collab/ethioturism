'use client';

import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Sarah Johnson',
    country: 'United States',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200',
    review: 'Visiting Lalibela was unforgettable. The rock-hewn churches are absolutely breathtaking and the local hospitality was amazing.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Marco Rossi',
    country: 'Italy',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200',
    review: 'The Simien Mountains exceeded all expectations. Stunning landscapes and incredible wildlife. A must-visit destination!',
    rating: 5,
  },
  {
    id: 3,
    name: 'Yuki Tanaka',
    country: 'Japan',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200',
    review: 'Ethiopian culture is so rich and diverse. The Timket festival was a once-in-a-lifetime experience. Highly recommended!',
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Travelers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real experiences from visitors who explored Ethiopia
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.id}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-slide-up relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote Icon */}
              <div className="absolute top-6 right-6 text-green-100">
                <Quote className="w-12 h-12" />
              </div>

              {/* Profile */}
              <div className="flex items-center mb-6">
                <div
                  className="w-16 h-16 rounded-full bg-cover bg-center mr-4"
                  style={{ backgroundImage: `url('${testimonial.image}')` }}
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">
                    {testimonial.name}
                  </h4>
                  <p className="text-gray-600 text-sm">{testimonial.country}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-5 h-5 text-yellow-400 fill-current"
                  />
                ))}
              </div>

              {/* Review */}
              <p className="text-gray-700 leading-relaxed italic">
                "{testimonial.review}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
