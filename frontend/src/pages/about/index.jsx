import { motion } from 'framer-motion';
import { StorySection } from './StorySection';
import { ValuesSection } from './ValuesSection';
import { TeamSection } from './TeamSection';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-white py-24 sm:py-32">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/about/pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
        </div>
        <div className="container relative">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <h2 className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20 font-devanagari">
                About BIREENA अतिथि
              </h2>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-dark sm:text-5xl lg:text-6xl">
                Elevating Hotel Management
                <span className="text-primary"> to New Heights</span>
              </h1>
              <p className="mt-6 text-xl leading-8 text-dark/70">
                We're not just a software company – we're your partner in
                transforming hotel operations. Our mission is to make hotel
                management more efficient, more intuitive, and more profitable.
              </p>
              <div className="mt-10 flex items-center gap-6">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-12 w-12 rounded-full border-2 border-white bg-gray-100"
                    />
                  ))}
                </div>
                <p className="text-sm font-medium text-dark/70">
                  Trusted by{' '}
                  <span className="font-semibold text-primary">500+</span>{' '}
                  hotels across India
                </p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="aspect-square w-full rounded-2xl bg-primary/5 p-8">
                <img
                  src="/about/hero.jpg"
                  alt="Hotel Management"
                  className="h-full w-full rounded-xl object-cover shadow-2xl"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-200">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 p-2">
                    <svg className="h-8 w-8 text-[#0f0]" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-dark">98% Success Rate</p>
                    <p className="text-sm text-dark/70">In Implementation</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Other Sections */}
      <StorySection />
      <ValuesSection />
      <TeamSection />
    </div>
  );
};
