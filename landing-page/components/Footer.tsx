'use client';

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-yellow-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">ET</span>
              </div>
              <span className="text-2xl font-bold">EthioTourism</span>
            </div>
            <p className="text-gray-400 mb-6">
              Discover the beauty and heritage of Ethiopia. Your gateway to
              unforgettable adventures.
            </p>
            {/* Social Media */}
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#home"
                  className="text-gray-400 hover:text-green-500 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="text-gray-400 hover:text-green-500 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#destinations"
                  className="text-gray-400 hover:text-green-500 transition-colors"
                >
                  Destinations
                </Link>
              </li>
              <li>
                <Link
                  href="#festivals"
                  className="text-gray-400 hover:text-green-500 transition-colors"
                >
                  Festivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h3 className="text-lg font-bold mb-4">Popular Destinations</h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/destination/lalibela"
                  className="text-gray-400 hover:text-green-500 transition-colors"
                >
                  Lalibela
                </Link>
              </li>
              <li>
                <Link
                  href="/destination/simien"
                  className="text-gray-400 hover:text-green-500 transition-colors"
                >
                  Simien Mountains
                </Link>
              </li>
              <li>
                <Link
                  href="/destination/danakil"
                  className="text-gray-400 hover:text-green-500 transition-colors"
                >
                  Danakil Depression
                </Link>
              </li>
              <li>
                <Link
                  href="/destination/gondar"
                  className="text-gray-400 hover:text-green-500 transition-colors"
                >
                  Gondar Castles
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Mail className="w-5 h-5 mr-3 text-green-500 mt-1" />
                <div>
                  <p className="text-gray-400">info@ethiotourism.com</p>
                  <p className="text-gray-400">support@ethiotourism.com</p>
                </div>
              </li>
              <li className="flex items-start">
                <Phone className="w-5 h-5 mr-3 text-green-500 mt-1" />
                <div>
                  <p className="text-gray-400">+251 11 123 4567</p>
                  <p className="text-gray-400">+251 91 234 5678</p>
                </div>
              </li>
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-green-500 mt-1" />
                <p className="text-gray-400">
                  Addis Ababa, Ethiopia
                  <br />
                  Bole Road, Africa Avenue
                </p>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 EthioTourism. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-green-500 text-sm transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-400 hover:text-green-500 text-sm transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="text-gray-400 hover:text-green-500 text-sm transition-colors"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
