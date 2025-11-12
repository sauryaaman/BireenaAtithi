import { motion } from 'framer-motion';
import {
  Calendar,
  Users,
  ClipboardCheck,
  CreditCard,
  BarChart2,
  MessageSquare,
  Bell,
  Settings,
} from 'lucide-react';

const features = [
  {
    name: 'Reservation Management',
    description:
      'Manage bookings across multiple channels, prevent overbooking, and optimize room allocation automatically.',
    icon: Calendar,
    details: [
      'Real-time availability updates',
      'Multi-channel booking sync',
      'Automated confirmation emails',
      'Group booking management',
    ],
  },
  {
    name: 'Guest Management',
    description:
      'Keep track of guest preferences, history, and special requests to provide personalized service.',
    icon: Users,
    details: [
      'Guest profiles and history',
      'VIP guest handling',
      'Special requests tracking',
      'Guest feedback management',
    ],
  },
  {
    name: 'Housekeeping',
    description:
      'Streamline cleaning operations, track room status, and manage maintenance requests efficiently.',
    icon: ClipboardCheck,
    details: [
      'Room status tracking',
      'Cleaning schedule automation',
      'Maintenance request handling',
      'Inventory management',
    ],
  },
  {
    name: 'Billing & Payments',
    description:
      'Process payments securely, manage invoices, and handle multiple payment methods with ease.',
    icon: CreditCard,
    details: [
      'Secure payment processing',
      'Multiple payment methods',
      'Automated invoicing',
      'Split billing support',
    ],
  },
  {
    name: 'Analytics & Reports',
    description:
      'Get insights into your business performance with detailed reports and analytics.',
    icon: BarChart2,
    details: [
      'Occupancy analytics',
      'Revenue forecasting',
      'Performance metrics',
      'Custom report builder',
    ],
  },
  {
    name: 'Guest Communication',
    description:
      'Stay in touch with guests before, during, and after their stay with automated messaging.',
    icon: MessageSquare,
    details: [
      'Automated notifications',
      'Email templates',
      'SMS integration',
      'Guest feedback surveys',
    ],
  },
  {
    name: 'Staff Management',
    description:
      'Manage staff schedules, track performance, and assign tasks efficiently.',
    icon: Bell,
    details: [
      'Staff scheduling',
      'Task assignment',
      'Performance tracking',
      'Internal communication',
    ],
  },
  {
    name: 'System Configuration',
    description:
      "Customize the system to match your hotel's needs with flexible settings and integrations.",
    icon: Settings,
    details: [
      'Custom room types',
      'Rate plan configuration',
      'User role management',
      'Integration settings',
    ],
  },
];

export const FeaturesList = () => {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-dark sm:text-4xl">
            Powerful Features for Modern Hotels
          </h2>
          <p className="mt-6 text-lg leading-8 text-dark/70">
            Our comprehensive suite of features helps you manage every aspect of
            your hotel operations efficiently.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col rounded-2xl bg-gray-50 p-8"
              >
                <dt className="flex items-center gap-x-4">
                  <feature.icon
                    className="h-8 w-8 flex-none text-primary"
                    aria-hidden="true"
                  />
                  <h3 className="text-lg font-semibold leading-7 text-dark">
                    {feature.name}
                  </h3>
                </dt>
                <dd className="mt-4 flex flex-auto flex-col">
                  <p className="flex-auto text-base leading-7 text-dark/70">
                    {feature.description}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-dark/70">
                    {feature.details.map((detail) => (
                      <li key={detail} className="flex items-center">
                        <span className="mr-2 h-1 w-1 flex-none rounded-full bg-primary" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};
