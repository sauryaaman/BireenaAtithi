// import { motion } from 'framer-motion';

// export const StorySection = () => {
//   return (
//     <section className="overflow-hidden bg-white py-24 sm:py-32">
//       <div className="container">
//         <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
//           <motion.div
//             initial={{ opacity: 0, x: -50 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.5 }}
//             className="lg:pr-8"
//           >
//             <h2 className="text-3xl font-bold tracking-tight text-dark sm:text-4xl">
//               Our Journey
//             </h2>
//             <p className="mt-6 text-lg leading-8 text-dark/70">
//               Launched in 2020, Bireena Athiti was born from the need to
//               simplify complex hotel operations. Our name combines "Bireena"
//               (excellence) and "Athiti" (guest), reflecting our mission to
//               elevate hospitality management through technology.
//             </p>
//             <div className="mt-8 space-y-6 text-base leading-7 text-dark/70">
//               <p>
//                 What began as a simple booking system has evolved into a
//                 comprehensive hotel management platform. We've continuously
//                 added features and capabilities based on real feedback from
//                 hoteliers and hospitality professionals, ensuring our solution
//                 addresses actual industry needs.
//               </p>
//               <p>
//                 Today, Bireena Athiti powers hundreds of hotels across Nepal and
//                 beyond, streamlining everything from reservations and room
//                 management to staff coordination and financial reporting. Our
//                 platform brings modern efficiency while preserving the personal
//                 touch that makes hospitality special.
//               </p>
//             </div>
//           </motion.div>
//           <motion.div
//             initial={{ opacity: 0, x: 50 }}
//             whileInView={{ opacity: 1, x: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.5 }}
//             className="relative"
//           >
//             <img
//               src="/about/dashboard.jpg"
//               alt="Bireena Athiti Dashboard"
//               className="w-full rounded-2xl object-cover shadow-xl"
//             />
//             <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
//           </motion.div>
//         </div>
//       </div>
//     </section>
//   );
// };


import { motion } from 'framer-motion';

export const StorySection = () => {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
      </div>
      
      <div className="container relative">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:pr-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                <span className="text-white">Our</span>{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Journey
                </span>
              </h2>
              <p className="mt-6 text-lg leading-8 text-gray-400">
                Launched in 2025, Bireena Athiti was born from the need to
                simplify complex hotel and restaurent operations. Our name combines "Bireena"
                (excellence) and "Athiti" (guest), reflecting our mission to
                elevate hospitality management through technology.
              </p>
            </motion.div>
            
            <div className="relative mt-8 space-y-6 text-base leading-7 rounded-2xl border border-cyan-500/20 bg-slate-900/50 p-6 backdrop-blur-sm">
              {/* Card gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent opacity-50" />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <div className="relative space-y-6">
                <p className="text-gray-400">
                  What began as a simple booking system has evolved into a
                  comprehensive hotel and restaurant management platform. We've continuously
                  added features and capabilities based on real feedback from
                  hospitality professionals, ensuring our solution
                  addresses actual industry needs.
                </p>
                <p className="text-gray-400">
                  Today, Bireena Athiti powers fifties of hotels and restaurant across India and
                  beyond, streamlining everything from reservations and room &  restaurant
                  management to staff coordination and financial reporting. Our
                  platform brings modern efficiency while preserving the personal
                  touch that makes hospitality special.
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900/50 p-2 backdrop-blur-sm">
              {/* Image gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 opacity-50" />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              
              <img
                src="/2.png"
                alt="Bireena Athiti Dashboard"
                className="relative w-full rounded-xl object-cover shadow-2xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
