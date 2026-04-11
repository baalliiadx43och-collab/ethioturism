'use client';

import { History, Heart, Mountain, Users } from 'lucide-react';

const features = [
  {
    id: 1,
    title: 'Rich History',
    description: 'Over 3,000 years of documented history and ancient civilizations',
    icon: History,
    color: 'bg-amber-100 text-amber-600',
  },
  {
    id: 2,
    title: 'Unique Culture',
    description: 'Diverse ethnic groups with distinct traditions and languages',
    icon: Heart,
    color: 'bg-red-100 text-red-600',
  },
  {
    id: 3,
    title: 'Beautiful Landscapes',
    description: 'From highlands to deserts, mountains to valleys',
    icon: Mountain,
    color: 'bg-green-100 text-green-600',
  },
  {
    id: 4,
    title: 'Friendly People',
    description: 'Warm hospitality and welcoming communities',
    icon: Users,
    color: 'bg-blue-100 text-blue-600',
  },
];

export default function WhyChoose() {
  return (
    <section id="about" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Visit Ethiopia?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover what makes Ethiopia a truly unique destination
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`${feature.color} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { number: '9', label: 'UNESCO Sites' },
            { number: '80+', label: 'Ethnic Groups' },
            { number: '13', label: 'National Parks' },
            { number: '3000+', label: 'Years of History' },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
