import { motion } from 'framer-motion';
import { Button } from '../../components/ui';
import { Link } from 'react-router-dom';
import heroBg from '../../assets/images/hero-bg.png';

export const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden p-4 pt-[90px]  md:pt-[80px] lg:pt-[60px]">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-gradient-red/10" />

      {/* Content */}
      <div className="container relative">
        <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center gap-12 lg:flex-row lg:items-center lg:justify-between">
          {/* Text Content */}
          <div className="max-w-2xl flex-1 space-y-8 py-8 md:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              <h4 className="text-sm uppercase tracking-wider text-gray-400 sm:text-base md:text-md">
                Your Home Away From Home
              </h4>
              <h1 className="text-4xl font-bold leading-tight text-dark sm:text-5xl md:text-6xl lg:text-7xl">
                Discover Comfort Beyond Stay at{' '}
                <span className="heading font-devanagari text-primary">
                  BIREENA_अतिथि
                </span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-dark/70 md:text-xl"
            >
              Discover exquisite cuisine in an elegant atmosphere. Our expert
              chefs create unforgettable dining experiences with the finest
              ingredients.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/reservations">
                <Button asChild variant="outline" size="lg">
                  Book a Table
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-1 items-center justify-end py-8 md:py-12"
          >
            <div className="animated relative w-[90%] max-w-[500px] lg:max-w-[600px]">
              <img
                src={heroBg}
                alt="Restaurant ambiance"
                className="aspect-[4/3] w-full object-cover "
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="h-[50px] w-[30px] rounded-full border-2 border-primary p-2">
          <motion.div
            animate={{
              y: [0, 12, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: 'loop',
            }}
            className="h-3 w-full rounded-full bg-primary"
          />
        </div>
      </motion.div>
    </section>
  );
};
