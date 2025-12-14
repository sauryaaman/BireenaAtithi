



import { motion } from 'framer-motion';
import { StorySection } from './StorySection';
// import { ValuesSection } from './ValuesSection';
// import { TeamSection } from './TeamSection';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
        </div>
        
        {/* Animated gradient orbs */}
        <div className="absolute right-0 top-1/4 h-96 w-96">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 blur-3xl rounded-full animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-180 animate-[shimmer_2s_infinite]" />
        </div>
        <div className="absolute left-0 bottom-1/4 h-96 w-96">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-cyan-500/30 blur-3xl rounded-full animate-pulse" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite]" />
        </div>
        <div className="container relative">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="inline-flex items-center rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 px-4 py-1.5 text-sm font-medium text-cyan-400 ring-1 ring-inset ring-cyan-500/20 backdrop-blur-sm">
                  About BIREENA <span className="font-devanagari ml-1">अतिथि</span>
                </h2>
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
              >
                <span className="text-white">Elevating Hotel & Restaurant Management</span>
                <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  to New Heights
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-6 text-xl leading-8 text-gray-400"
              >
               We are not just a software company — we are your technology partner in simplifying hotel and restaurant operations, reducing manual work, and increasing overall efficiency and profitability.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-10 flex items-center gap-6"
              >
                {/* <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, x: -20 }}
                      animate={{ scale: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                      className="relative h-12 w-12 rounded-full border-2 border-cyan-500/20 bg-slate-900/50 backdrop-blur-sm"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-full" />
                    </motion.div>
                  ))}
                </div> */}
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  className="text-sm font-medium text-gray-400"
                >
                  Trusted by{' '}
                  <span className="font-semibold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                    50+
                  </span>{' '}
                  hotels across India
                </motion.p>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                <div className="w-full rounded-2xl border border-cyan-500/20 bg-slate-900/50 p-4 backdrop-blur-sm">
                  {/* Image gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 opacity-50" />
                  
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                  
                  <img
                    src="/image.png"
                    alt="Hotel Management"
                    className="relative w-full h-auto rounded-xl shadow-2xl"
                  />
                </div>
                
                {/* Stats card */}
                <motion.div
                  initial={{ opacity: 0, y: 20, x: -20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="absolute -bottom-6 -left-6 overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900/90 p-6 backdrop-blur-sm"
                >
                  <div className="relative">
                    {/* Card gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
                    
                    <div className="relative flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20">
                        <svg className="h-6 w-6 text-cyan-400" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-white">98% Success Rate</p>
                        <p className="text-sm text-gray-400">In Implementation</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Other Sections */}
      <StorySection />
      {/* <ValuesSection /> */}
      {/* <TeamSection /> */}
    </div>
  );
};
