import { Link } from 'react-router-dom';
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import logo from '../../../public/logo.png';

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: '#' },
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'Twitter', icon: Twitter, href: '#' },
];

const navigation = {
  services: [
    { name: 'About Us', href: '/about' },
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Contact', href: '/contact' },
  ],
  support: [
    { name: 'Contact', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ],
};

export const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-white via-white to-gradient-red/10">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
          {/* Brand & Contact */}
          <div className="space-y-6">
            <Link to="/" className="-mt-2 block">
              <img
                src={logo}
                alt="BIREENA अतिथि"
                className="h-10 w-auto object-cover transition-transform hover:scale-105"
              />
            </Link>
            <div className="space-y-4 text-sm text-dark/80">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-primary" />
                <p>123 Restaurant Lane, Foodie City, FC 12345</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <p>(555) 123-4567</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <p>info@bireenaathiti.com</p>
              </div>
            </div>
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-primary hover:text-primary/80"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="sr-only">{item.name}</span>
                    <Icon className="h-6 w-6" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-lg font-semibold text-dark">Services</h3>
            <ul className="mt-4 space-y-3">
              {navigation.services.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-dark/70 hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-semibold text-dark">Support</h3>
            <ul className="mt-4 space-y-3">
              {navigation.support.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-dark/70 hover:text-primary"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="text-lg font-semibold text-dark">Opening Hours</h3>
            <div className="mt-4 space-y-3 text-sm text-dark/70">
              <p>Monday - Friday</p>
              <p className="font-medium text-dark">11:00 AM - 10:00 PM</p>
              <p>Saturday - Sunday</p>
              <p className="font-medium text-dark">12:00 PM - 11:00 PM</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-primary/10 pt-6 text-center text-sm text-dark/70">
          <p>
            © {new Date().getFullYear()} BIREENA{' '}
            <span className="font-devanagari">अतिथि</span>. All rights reserved.{' '}
            Designed & Developed by{' '}
            <a
              href="https://github.com/Mrsaxena01/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:font-bold"
            >
              Shaonu
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
