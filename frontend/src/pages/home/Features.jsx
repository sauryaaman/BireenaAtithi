import { motion } from 'framer-motion';
import {
  UtensilsCrossed,
  Calendar,
  CreditCard,
  Search,
  Star,
  MessageSquare,
} from 'lucide-react';

const features = [
  {
    title: 'Menu Management',
    description:
      'Easily update and customize your menu items with real-time changes.',
    icon: UtensilsCrossed,
  },
  {
    title: 'Online Reservations',
    description: 'Seamless table booking system for your customers.',
    icon: Calendar,
  },
  {
    title: 'Secure Payments',
    description: 'Multiple payment options with secure transaction processing.',
    icon: CreditCard,
  },
  {
    title: 'SEO Optimized',
    description:
      'Enhanced visibility for better reach and customer engagement.',
    icon: Search,
  },
  {
    title: 'Loyalty Program',
    description:
      'Reward your regular customers with special offers and points.',
    icon: Star,
  },
  {
    title: 'Customer Feedback',
    description: 'Collect and manage customer reviews and ratings.',
    icon: MessageSquare,
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const Features = () => {
  return (
    <section className="bg-white py-24">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-dark md:text-4xl">
            Why Choose{' '}
            <span className="text-primary">
              BIREENA <span className="font-devanagari">अतिथि</span>
            </span>
          </h2>
          <p className="text-dark/70">
            Experience a perfect blend of traditional cuisine and modern dining
            technology for an unforgettable culinary journey.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="rounded-lg border border-primary/10 bg-white p-6 transition-all hover:border-primary hover:shadow-lg"
            >
              <feature.icon className="mb-4 h-12 w-12 text-primary" />
              <h3 className="mb-3 text-xl font-semibold text-dark">
                {feature.title}
              </h3>
              <p className="text-dark/70">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
