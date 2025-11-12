import { motion } from 'framer-motion';
import { Heart, Users, Star, Shield } from 'lucide-react';

const values = [
  {
    name: 'Smart Automation',
    description:
      'Automate routine tasks and streamline operations with intelligent workflows and real-time updates.',
    icon: Heart,
  },
  {
    name: 'Seamless Integration',
    description:
      'All your hotel operations in one place - from bookings and check-ins to inventory and billing.',
    icon: Users,
  },
  {
    name: 'Data-Driven Insights',
    description:
      'Make informed decisions with comprehensive analytics and reporting features.',
    icon: Star,
  },
  {
    name: 'Secure & Reliable',
    description:
      'Enterprise-grade security and 24/7 reliability to keep your operations running smoothly.',
    icon: Shield,
  },
];

export const ValuesSection = () => {
  return (
    <section className="bg-gray-50 py-24 sm:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-dark sm:text-4xl">
            Key Features
          </h2>
          <p className="mt-6 text-lg leading-8 text-dark/70">
            Our platform is built with powerful features that help you manage
            your hotel more efficiently, improve guest satisfaction, and
            increase revenue.
          </p>
        </motion.div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
            {values.map((value, index) => (
              <motion.div
                key={value.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col"
              >
                <dt className="text-center">
                  <div className="mb-6 flex justify-center">
                    <value.icon
                      className="h-12 w-12 text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-lg font-semibold leading-7 text-dark">
                    {value.name}
                  </span>
                </dt>
                <dd className="mt-4 flex flex-1 flex-col text-center">
                  <p className="flex-1 text-base leading-7 text-dark/70">
                    {value.description}
                  </p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};
