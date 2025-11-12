import { motion } from 'framer-motion';

const integrations = [
  {
    name: 'Online Travel Agencies (OTAs)',
    description:
      'Sync with major booking platforms like Booking.com, Expedia, and Airbnb.',
    logo: '/features/integrations/ota.svg',
  },
  {
    name: 'Payment Gateways',
    description: 'Process payments securely through popular payment providers.',
    logo: '/features/integrations/payment.svg',
  },
  {
    name: 'Accounting Software',
    description:
      'Integrate with QuickBooks, Xero, and other accounting systems.',
    logo: '/features/integrations/accounting.svg',
  },
  {
    name: 'Point of Sale (POS)',
    description: 'Connect with restaurant and retail POS systems.',
    logo: '/features/integrations/pos.svg',
  },
  {
    name: 'Customer Support',
    description: 'Integration with popular help desk and CRM systems.',
    logo: '/features/integrations/support.svg',
  },
  {
    name: 'Channel Manager',
    description: 'Sync inventory across all your distribution channels.',
    logo: '/features/integrations/channel.svg',
  },
];

export const IntegrationSection = () => {
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
            Seamless Integrations
          </h2>
          <p className="mt-6 text-lg leading-8 text-dark/70">
            Connect Bireena Athiti with your favorite tools and platforms to
            create a unified hotel management ecosystem.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {integrations.map((integration, index) => (
            <motion.div
              key={integration.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200"
            >
              <div className="mb-6">
                <img
                  src={integration.logo}
                  alt={integration.name}
                  className="h-16 w-16"
                />
              </div>
              <h3 className="text-lg font-semibold text-dark">
                {integration.name}
              </h3>
              <p className="mt-4 text-sm leading-6 text-dark/70">
                {integration.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
