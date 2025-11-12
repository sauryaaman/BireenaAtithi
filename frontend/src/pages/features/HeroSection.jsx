import { motion } from 'framer-motion';

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-white via-white to-gradient-red/5 py-24 sm:py-32">
      <div className="container relative">
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
              Powerful Features
            </h2>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-dark sm:text-5xl">
              Everything You Need to Run Your Hotel
            </h1>
            <p className="mt-6 text-xl leading-8 text-dark/70">
              From front desk operations to financial reporting, Bireena Athiti
              provides all the tools you need to manage your property
              efficiently and deliver exceptional guest experiences.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-primary/5">
              <img
                src="/features/dashboard-preview.jpg"
                alt="Dashboard Preview"
                className="w-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
