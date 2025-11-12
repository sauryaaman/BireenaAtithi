import { motion } from 'framer-motion';

export const StorySection = () => {
  return (
    <section className="overflow-hidden bg-white py-24 sm:py-32">
      <div className="container">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:pr-8"
          >
            <h2 className="text-3xl font-bold tracking-tight text-dark sm:text-4xl">
              Our Journey
            </h2>
            <p className="mt-6 text-lg leading-8 text-dark/70">
              Launched in 2020, Bireena Athiti was born from the need to
              simplify complex hotel operations. Our name combines "Bireena"
              (excellence) and "Athiti" (guest), reflecting our mission to
              elevate hospitality management through technology.
            </p>
            <div className="mt-8 space-y-6 text-base leading-7 text-dark/70">
              <p>
                What began as a simple booking system has evolved into a
                comprehensive hotel management platform. We've continuously
                added features and capabilities based on real feedback from
                hoteliers and hospitality professionals, ensuring our solution
                addresses actual industry needs.
              </p>
              <p>
                Today, Bireena Athiti powers hundreds of hotels across Nepal and
                beyond, streamlining everything from reservations and room
                management to staff coordination and financial reporting. Our
                platform brings modern efficiency while preserving the personal
                touch that makes hospitality special.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <img
              src="/about/dashboard.jpg"
              alt="Bireena Athiti Dashboard"
              className="w-full rounded-2xl object-cover shadow-xl"
            />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
