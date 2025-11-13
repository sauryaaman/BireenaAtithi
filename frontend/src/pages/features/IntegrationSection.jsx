// import { motion } from 'framer-motion';

// const integrations = [
//   {
//     name: 'Online Travel Agencies (OTAs)',
//     description:
//       'Sync with major booking platforms like Booking.com, Expedia, and Airbnb.',
//     logo: '/features/integrations/ota.svg',
//   },
//   {
//     name: 'Payment Gateways',
//     description: 'Process payments securely through popular payment providers.',
//     logo: '/features/integrations/payment.svg',
//   },
//   {
//     name: 'Accounting Software',
//     description:
//       'Integrate with QuickBooks, Xero, and other accounting systems.',
//     logo: '/features/integrations/accounting.svg',
//   },
//   {
//     name: 'Point of Sale (POS)',
//     description: 'Connect with restaurant and retail POS systems.',
//     logo: '/features/integrations/pos.svg',
//   },
//   {
//     name: 'Customer Support',
//     description: 'Integration with popular help desk and CRM systems.',
//     logo: '/features/integrations/support.svg',
//   },
//   {
//     name: 'Channel Manager',
//     description: 'Sync inventory across all your distribution channels.',
//     logo: '/features/integrations/channel.svg',
//   },
// ];

// export const IntegrationSection = () => {
//   return (
//     <section className="bg-gray-50 py-24 sm:py-32">
//       <div className="container">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.5 }}
//           className="mx-auto max-w-2xl text-center"
//         >
//           <h2 className="text-3xl font-bold tracking-tight text-dark sm:text-4xl">
//             Seamless Integrations
//           </h2>
//           <p className="mt-6 text-lg leading-8 text-dark/70">
//             Connect Bireena Athiti with your favorite tools and platforms to
//             create a unified hotel management ecosystem.
//           </p>
//         </motion.div>

//         <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
//           {integrations.map((integration, index) => (
//             <motion.div
//               key={integration.name}
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.5, delay: index * 0.1 }}
//               className="flex flex-col items-center rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200"
//             >
//               <div className="mb-6">
//                 <img
//                   src={integration.logo}
//                   alt={integration.name}
//                   className="h-16 w-16"
//                 />
//               </div>
//               <h3 className="text-lg font-semibold text-dark">
//                 {integration.name}
//               </h3>
//               <p className="mt-4 text-sm leading-6 text-dark/70">
//                 {integration.description}
//               </p>
//             </motion.div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };


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
    <section className="relative py-24 sm:py-32">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(6,182,212,0.1),transparent)]" />
      </div>

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-white">Seamless</span>{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Integrations
            </span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-400">
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
              className="group relative flex flex-col items-center rounded-2xl border border-cyan-500/20 bg-slate-900/50 p-8 text-center backdrop-blur-sm"
            >
              {/* Card gradient */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent opacity-50" />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <div className="relative mb-6">
                {/* Icon glow effect */}
                <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
                <img
                  src={integration.logo}
                  alt={integration.name}
                  className="relative h-16 w-16 transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              
              <h3 className="relative text-lg font-semibold text-white group-hover:bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                {integration.name}
              </h3>
              
              <p className="relative mt-4 text-sm leading-6 text-gray-400 group-hover:text-gray-300 transition-colors">
                {integration.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
