// import { Link } from 'react-router-dom';
// import {
//   Facebook,
//   Instagram,
//   Twitter,
//   Mail,
//   Phone,
//   MapPin,
// } from 'lucide-react';
// import logo from '../../../public/logo.png';

// const socialLinks = [
//   { name: 'Facebook', icon: Facebook, href: '#' },
//   { name: 'Instagram', icon: Instagram, href: '#' },
//   { name: 'Twitter', icon: Twitter, href: '#' },
// ];

// const navigation = {
//   services: [
//     { name: 'About Us', href: '/about' },
//     { name: 'Features', href: '/features' },
//     { name: 'Pricing', href: '/pricing' },
//     { name: 'Contact', href: '/contact' },
//   ],
//   support: [
//     { name: 'Contact', href: '/contact' },
//     { name: 'FAQ', href: '/faq' },
//     { name: 'Privacy Policy', href: '/privacy' },
//     { name: 'Terms of Service', href: '/terms' },
//   ],
// };

// export const Footer = () => {
//   return (
//     <footer className="bg-gradient-to-r from-white via-white to-gradient-red/10">
//       <div className="container py-12 md:py-16">
//         <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
//           {/* Brand & Contact */}
//           <div className="space-y-6">
//             <Link to="/" className="-mt-2 block">
//               <img
//                 src={logo}
//                 alt="BIREENA अतिथि"
//                 className="h-10 w-auto object-cover transition-transform hover:scale-105"
//               />
//             </Link>
//             <div className="space-y-4 text-sm text-dark/80">
//               <div className="flex items-start gap-3">
//                 <MapPin className="h-5 w-5 shrink-0 text-primary" />
//                 <p>123 Restaurant Lane, Foodie City, FC 12345</p>
//               </div>
//               <div className="flex items-center gap-3">
//                 <Phone className="h-5 w-5 text-primary" />
//                 <p>(555) 123-4567</p>
//               </div>
//               <div className="flex items-center gap-3">
//                 <Mail className="h-5 w-5 text-primary" />
//                 <p>info@bireenaathiti.com</p>
//               </div>
//             </div>
//             {/* Social Links */}
//             <div className="flex gap-4">
//               {socialLinks.map((item) => {
//                 const Icon = item.icon;
//                 return (
//                   <a
//                     key={item.name}
//                     href={item.href}
//                     className="text-primary hover:text-primary/80"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                   >
//                     <span className="sr-only">{item.name}</span>
//                     <Icon className="h-6 w-6" />
//                   </a>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Services Links */}
//           <div>
//             <h3 className="text-lg font-semibold text-dark">Services</h3>
//             <ul className="mt-4 space-y-3">
//               {navigation.services.map((item) => (
//                 <li key={item.name}>
//                   <Link
//                     to={item.href}
//                     className="text-sm text-dark/70 hover:text-primary"
//                   >
//                     {item.name}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Support Links */}
//           <div>
//             <h3 className="text-lg font-semibold text-dark">Support</h3>
//             <ul className="mt-4 space-y-3">
//               {navigation.support.map((item) => (
//                 <li key={item.name}>
//                   <Link
//                     to={item.href}
//                     className="text-sm text-dark/70 hover:text-primary"
//                   >
//                     {item.name}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Opening Hours */}
//           <div>
//             <h3 className="text-lg font-semibold text-dark">Opening Hours</h3>
//             <div className="mt-4 space-y-3 text-sm text-dark/70">
//               <p>Monday - Friday</p>
//               <p className="font-medium text-dark">11:00 AM - 10:00 PM</p>
//               <p>Saturday - Sunday</p>
//               <p className="font-medium text-dark">12:00 PM - 11:00 PM</p>
//             </div>
//           </div>
//         </div>

//         {/* Copyright */}
//         <div className="mt-12 border-t border-primary/10 pt-6 text-center text-sm text-dark/70">
//           <p>
//             © {new Date().getFullYear()} BIREENA{' '}
//             <span className="font-devanagari">अतिथि</span>. All rights reserved.{' '}
//             Designed & Developed by{' '}
//             <a
//               href="https://github.com/Mrsaxena01/"
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-primary underline hover:font-bold"
//             >
//               Shaonu
//             </a>
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// };


import { Link } from 'react-router-dom';
import {
  Facebook,
  Instagram,
  Twitter,
  Mail,
  Phone,
  MapPin,
  Youtube,
} from 'lucide-react';
import logo from '../../../public/logo.png';

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: 'https://www.facebook.com/share/1AA1UTr5Tc' },
  { name: 'Instagram', icon: Instagram, href: 'https://www.instagram.com/bireenainfo' },
  { name: 'Youtube', icon: Youtube, href: 'http://www.youtube.com/@Bireenainfotech' },
  // { name: 'Twitter', icon: Twitter, href: '#' },
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
    <footer className="relative overflow-hidden">
      {/* Background gradients - matching Hero section */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-10" />
      {/* Base dark background */}
      <div className="absolute inset-0 bg-slate-950" />
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
      {/* Top border gradient */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
      {/* Additional decorative gradients */}
      <div className="absolute right-0 top-1/4 h-64 w-64 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-3xl rounded-full" />
      <div className="absolute left-0 bottom-1/4 h-64 w-64 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 blur-3xl rounded-full" />
      
      {/* Main content */}
      <div className="container relative py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
          {/* Brand & Contact */}
          <div className="space-y-6">
            <Link to="/" className="group relative flex items-center gap-2 py-1">
              <div className="flex flex-col">
                <span className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:via-blue-300 group-hover:to-purple-300 transition-all duration-300 font-devanagari">
                  BIREENAअतिथि
                </span>
              </div>
            </Link>
            <div className="space-y-4 text-sm text-gray-300">
              <div className="group flex items-start gap-3 rounded-lg p-2 transition-all duration-300 hover:bg-cyan-500/5">
                <MapPin className="h-5 w-5 shrink-0 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <p className="group-hover:text-white transition-colors">B-36, Anisabad, Patna, Bihar, India 800025</p>
              </div>
              <div className="group flex items-center gap-3 rounded-lg p-2 transition-all duration-300 hover:bg-cyan-500/5">
                <Phone className="h-5 w-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <p className="group-hover:text-white transition-colors">+91 91351-55931 , 
+91 93049-42225</p>
              </div>
              <div className="group flex items-center gap-3 rounded-lg p-2 transition-all duration-300 hover:bg-cyan-500/5">
                <Mail className="h-5 w-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <p className="group-hover:text-white transition-colors">bireenainfo@gmail.com</p>
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
                    className="group relative overflow-hidden rounded-lg p-2 transition-all duration-300 hover:bg-cyan-500/10"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-0 transition-opacity duration-300 group-hover:opacity-30" />
                    <span className="sr-only">{item.name}</span>
                    <Icon className="h-6 w-6 relative text-cyan-400 group-hover:text-cyan-300 transition-colors transform group-hover:scale-110 duration-300" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Services Links */}
          <div className="group relative overflow-hidden rounded-xl backdrop-blur-sm bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 p-6 transition-all duration-300 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            <h3 className="relative text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Services</h3>
            <ul className="relative mt-4 space-y-3">
              {navigation.services.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2 group/link"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500/50 group-hover/link:bg-cyan-400 transition-colors" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="group relative overflow-hidden rounded-xl backdrop-blur-sm bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 p-6 transition-all duration-300 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            <h3 className="relative text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Support</h3>
            <ul className="relative mt-4 space-y-3">
              {navigation.support.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className="text-sm text-gray-300 hover:text-white transition-colors flex items-center gap-2 group/link"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500/50 group-hover/link:bg-cyan-400 transition-colors" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Opening Hours */}
          <div className="group relative overflow-hidden rounded-xl backdrop-blur-sm bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5 p-6 transition-all duration-300 hover:bg-gradient-to-r hover:from-cyan-500/10 hover:via-blue-500/10 hover:to-purple-500/10">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
            <h3 className="relative text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Opening Hours</h3>
            <div className="relative mt-4 space-y-4 text-sm">
              <div className="space-y-1">
                <p className="text-gray-400 font-medium">Monday - Friday</p>
                <p className="font-semibold text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text">11:00 AM - 10:00 PM</p>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400 font-medium">Saturday - Sunday</p>
                <p className="font-semibold text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text">12:00 PM - 11:00 PM</p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="relative mt-12 border-t border-cyan-500/10 pt-8">
          {/* Gradient line */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30" />
          
          <div className="text-center text-sm">
            <p className="text-gray-400">
              © {new Date().getFullYear()}{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-bold">
                BIREENA <span className="font-devanagari">अतिथि</span>
              </span>
              . All rights reserved.{' '}
              Designed & Developed by{' '}
              {/* <a
                // href="https://github.com/Mrsaxena01/"
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-block group"
              > */}
                <span className="relative bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent font-bold group-hover:from-cyan-300 group-hover:to-blue-300 transition-all duration-300">
                  Bireena Infotech
                </span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
              {/* </a> */}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
