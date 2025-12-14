// import { motion } from 'framer-motion';
// import { Button } from '../../components/ui';
// import { Link } from 'react-router-dom';
// import heroBg from '../../assets/images/hero-bg.png';

// export const Hero = () => {
//   return (
//     <section className="relative min-h-screen overflow-hidden p-4 pt-[90px]  md:pt-[80px] lg:pt-[60px]">
//       {/* Background gradient */}
//       <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-gradient-red/10" />

//       {/* Content */}
//       <div className="container relative">
//         <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center gap-12 lg:flex-row lg:items-center lg:justify-between">
//           {/* Text Content */}
//           <div className="max-w-2xl flex-1 space-y-8 py-8 md:py-12">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5 }}
//               className="space-y-2"
//             >
//               <h4 className="text-sm uppercase tracking-wider text-gray-400 sm:text-base md:text-md">
//                 Your Home Away From Home
//               </h4>
//               <h1 className="text-4xl font-bold leading-tight text-dark sm:text-5xl md:text-6xl lg:text-7xl">
//                 Discover Comfort Beyond Stay at{' '}
//                 <span className="heading font-devanagari text-primary">
//                   BIREENA_अतिथि
//                 </span>
//               </h1>
//             </motion.div>

//             <motion.p
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//               className="text-lg text-dark/70 md:text-xl"
//             >
//               Discover exquisite cuisine in an elegant atmosphere. Our expert
//               chefs create unforgettable dining experiences with the finest
//               ingredients.
//             </motion.p>

//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ duration: 0.5, delay: 0.4 }}
//               className="flex flex-wrap gap-4"
//             >
//               <Link to="/reservations">
//                 <Button asChild variant="outline" size="lg">
//                   Book a Table
//                 </Button>
//               </Link>
//             </motion.div>
//           </div>

//           {/* Image */}
//           <motion.div
//             initial={{ opacity: 0, x: 50 }}
//             animate={{ opacity: 1, x: 0 }}
//             transition={{ duration: 0.7 }}
//             className="flex flex-1 items-center justify-end py-8 md:py-12"
//           >
//             <div className="animated relative w-[90%] max-w-[500px] lg:max-w-[600px]">
//               <img
//                 src={heroBg}
//                 alt="Restaurant ambiance"
//                 className="aspect-[4/3] w-full object-cover "
//               />
//             </div>
//           </motion.div>
//         </div>
//       </div>

//       {/* Scroll Indicator */}
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ delay: 1 }}
//         className="absolute bottom-8 left-1/2 -translate-x-1/2"
//       >
//         <div className="h-[50px] w-[30px] rounded-full border-2 border-primary p-2">
//           <motion.div
//             animate={{
//               y: [0, 12, 0],
//             }}
//             transition={{
//               duration: 1.5,
//               repeat: Infinity,
//               repeatType: 'loop',
//             }}
//             className="h-3 w-full rounded-full bg-primary"
//           />
//         </div>
//       </motion.div>
//     </section>
//   );
// };


import { useState, useEffect } from 'react';
import heroBg from '@/assets/images/hero-bg.png'; 

export const Hero = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden px-6 pt-[90px] pb-16 md:px-10 md:pt-[80px] lg:pt-[60px]">
      {/* Base dark background */}
      <div className="absolute inset-0 bg-slate-950" />
      
      {/* Animated Glowing Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large cyan orb - top right */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-20 animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.8) 0%, rgba(6,182,212,0) 70%)',
            top: '-10%',
            right: '-5%',
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        
        {/* Medium blue orb - center left */}
        <div 
          className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.8) 0%, rgba(59,130,246,0) 70%)',
            top: '40%',
            left: '-10%',
            animation: 'float 15s ease-in-out infinite 2s',
          }}
        />
        
        {/* Purple orb - bottom center */}
        <div 
          className="absolute w-[350px] h-[350px] rounded-full blur-3xl opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(168,85,247,0.8) 0%, rgba(168,85,247,0) 70%)',
            bottom: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            animation: 'float 18s ease-in-out infinite 4s',
          }}
        />
        
        {/* Small cyan orb - top left */}
        <div 
          className="absolute w-[250px] h-[250px] rounded-full blur-2xl opacity-20"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.9) 0%, rgba(6,182,212,0) 70%)',
            top: '20%',
            left: '15%',
            animation: 'float 12s ease-in-out infinite 1s',
          }}
        />
        
        {/* Small blue orb - bottom right */}
        <div 
          className="absolute w-[200px] h-[200px] rounded-full blur-2xl opacity-15"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.9) 0%, rgba(59,130,246,0) 70%)',
            bottom: '20%',
            right: '10%',
            animation: 'float 14s ease-in-out infinite 3s',
          }}
        />

        {/* Mouse follower orb */}
        <div 
          className="absolute w-[300px] h-[300px] rounded-full blur-3xl opacity-10 pointer-events-none transition-all duration-1000 ease-out"
          style={{
            background: 'radial-gradient(circle, rgba(6,182,212,0.8) 0%, rgba(168,85,247,0) 70%)',
            left: `${mousePosition.x - 150}px`,
            top: `${mousePosition.y - 150}px`,
          }}
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
      
      {/* Top border gradient */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />

      {/* Animated particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite ${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Content Container */}
      <div className="container mx-auto relative max-w-7xl">
        <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center gap-10 md:flex-row md:items-center md:justify-between">
          {/* Text Content */}
          <div className="max-w-xl flex-1 space-y-8 py-6 text-center md:text-left md:py-12 lg:max-w-2xl">
            <div
              className="space-y-3"
              style={{
                opacity: 0,
                transform: 'translateY(25px)',
                animation: 'fadeInUp 0.6s ease-out forwards',
              }}
            >
              <h4 className="text-sm uppercase tracking-widest text-gray-400 sm:text-base md:text-md">
                Your Home Away From Home
              </h4>
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                Discover Comfort Beyond Stay at{' '}
                <span className="font-devanagari heading text-transparent">
                  BIREENA_अतिथि
                </span>
              </h1>
            </div>

            <p
              className="text-lg text-gray-400 md:text-xl"
              style={{
                opacity: 0,
                transform: 'translateY(25px)',
                animation: 'fadeInUp 0.6s ease-out 0.3s forwards',
              }}
            >
              All-in-one hotel management software
              designed for seamless check-in, check-out, food ordering,
              billing, and real-time reporting.
            </p>

            <div
              className="flex flex-wrap justify-center gap-4 md:justify-start"
              style={{
                opacity: 0,
                transform: 'translateY(30px)',
                animation: 'fadeInUp 0.6s ease-out 0.5s forwards',
              }}
            >
              <a
                href="/dashboard"
                className="group relative overflow-hidden rounded-xl px-8 py-4 font-semibold text-sm sm:text-base transition-transform duration-300 hover:scale-105 active:scale-95"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-90 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 ease-out" />
                <div className="absolute inset-0 rounded-xl bg-cyan-500 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
                <span className="relative flex items-center gap-2 text-white">
                  Check Now
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </a>
            </div>
          </div>

          {/* Image Content */}
          <div
            className="flex flex-1 justify-center md:justify-end py-6 md:py-12 max-w-full lg:max-w-[600px]"
            style={{
              opacity: 0,
              transform: 'translateX(60px)',
              animation: 'fadeInRight 0.8s ease-out forwards',
            }}
          >
            <div className="relative w-full overflow-hidden  transition-transform duration-500 group hover:scale-105">
              {/* Placeholder gradient image */}
              <div className="aspect-[4/3] w-full  flex items-center justify-center">
                <div className="text-center space-y-4">
                
                  <img
                src={heroBg}
                alt="Restaurant ambiance"
                className="aspect-[4/3] w-full object-cover"
              />
                </div>
              </div>
              {/* Uncomment below and remove placeholder when you have the image */}
              
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        style={{
          opacity: 0,
          animation: 'fadeIn 0.6s ease-out 1s forwards',
        }}
      >
        <div className="h-[50px] w-[30px] rounded-full border-2 border-cyan-400 p-2">
          <div
            className="h-3 w-full rounded-full bg-cyan-400"
            style={{
              animation: 'scroll 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          25% {
            transform: translate(20px, -20px);
          }
          50% {
            transform: translate(-10px, 10px);
          }
          75% {
            transform: translate(15px, 5px);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.5);
          }
        }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInRight {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        @keyframes scroll {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(12px);
          }
        }
      `}</style>
    </section>
  );
};