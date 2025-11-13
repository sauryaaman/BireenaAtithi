// import { motion } from 'framer-motion';
// import { Check, X } from 'lucide-react';

// const plans = [
//   {
//     name: 'Basic',
//     features: {
//       'Room Management': true,
//       'Front Desk Operations': true,
//       'Basic Reporting': true,
//       'Guest Profiles': true,
//       'Online Bookings': false,
//       'Channel Manager': false,
//       'Analytics Dashboard': false,
//       'API Access': false,
//       '24/7 Support': false,
//       'Custom Branding': false,
//     },
//   },
//   {
//     name: 'Professional',
//     features: {
//       'Room Management': true,
//       'Front Desk Operations': true,
//       'Basic Reporting': true,
//       'Guest Profiles': true,
//       'Online Bookings': true,
//       'Channel Manager': true,
//       'Analytics Dashboard': true,
//       'API Access': false,
//       '24/7 Support': true,
//       'Custom Branding': false,
//     },
//   },
//   {
//     name: 'Enterprise',
//     features: {
//       'Room Management': true,
//       'Front Desk Operations': true,
//       'Basic Reporting': true,
//       'Guest Profiles': true,
//       'Online Bookings': true,
//       'Channel Manager': true,
//       'Analytics Dashboard': true,
//       'API Access': true,
//       '24/7 Support': true,
//       'Custom Branding': true,
//     },
//   },
// ];

// export const PricingComparison = () => {
//   return (
//     <section className="bg-white py-24 sm:py-32">
//       <div className="container">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//           transition={{ duration: 0.5 }}
//           className="mx-auto max-w-2xl text-center"
//         >
//           <h2 className="text-3xl font-bold tracking-tight text-dark sm:text-4xl">
//             Feature Comparison
//           </h2>
//           <p className="mt-6 text-lg leading-8 text-dark/70">
//             Choose the plan that best fits your hotel's needs.
//           </p>
//         </motion.div>

//         <div className="mt-16 flow-root">
//           <div className="isolate -mx-6 rounded-2xl bg-gray-50 p-6 lg:mx-0 lg:p-12">
//             <div className="relative overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead>
//                   <tr>
//                     <th
//                       scope="col"
//                       className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-dark sm:pl-3"
//                     >
//                       Features
//                     </th>
//                     {plans.map((plan) => (
//                       <th
//                         key={plan.name}
//                         scope="col"
//                         className="px-3 py-3.5 text-center text-sm font-semibold text-dark"
//                       >
//                         {plan.name}
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {Object.keys(plans[0].features).map((feature) => (
//                     <tr key={feature}>
//                       <td className="py-4 pl-6 pr-3 text-sm font-medium text-dark sm:pl-3">
//                         {feature}
//                       </td>
//                       {plans.map((plan) => (
//                         <td
//                           key={`${plan.name}-${feature}`}
//                           className="px-3 py-4 text-center"
//                         >
//                           {plan.features[feature] ? (
//                             <Check className="mx-auto h-5 w-5 text-primary" />
//                           ) : (
//                             <X className="mx-auto h-5 w-5 text-gray-300" />
//                           )}
//                         </td>
//                       ))}
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };


import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

const plans = [
  {
    name: 'Basic',
    features: {
      'Room Management': true,
      'Front Desk Operations': true,
      'Basic Reporting': true,
      'Guest Profiles': true,
      'Online Bookings': false,
      'Channel Manager': false,
      'Analytics Dashboard': false,
      'API Access': false,
      '24/7 Support': false,
      'Custom Branding': false,
    },
  },
  {
    name: 'Professional',
    features: {
      'Room Management': true,
      'Front Desk Operations': true,
      'Basic Reporting': true,
      'Guest Profiles': true,
      'Online Bookings': true,
      'Channel Manager': true,
      'Analytics Dashboard': true,
      'API Access': false,
      '24/7 Support': true,
      'Custom Branding': false,
    },
  },
  {
    name: 'Enterprise',
    features: {
      'Room Management': true,
      'Front Desk Operations': true,
      'Basic Reporting': true,
      'Guest Profiles': true,
      'Online Bookings': true,
      'Channel Manager': true,
      'Analytics Dashboard': true,
      'API Access': true,
      '24/7 Support': true,
      'Custom Branding': true,
    },
  },
];

export const PricingComparison = () => {
  return (
    <section className="relative py-24 sm:py-32">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(6,182,212,0.1),transparent)]" />
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
            <span className="text-white">Feature</span>{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Comparison
            </span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-400">
            Choose the plan that best fits your hotel's needs.
          </p>
        </motion.div>

        <div className="mt-16 flow-root">
          <div className="relative isolate -mx-6 rounded-2xl border border-cyan-500/20 bg-slate-900/50 p-6 backdrop-blur-sm lg:mx-0 lg:p-12">
            {/* Card gradient */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent opacity-50" />

            <div className="relative overflow-x-auto">
              <table className="min-w-full divide-y divide-cyan-500/20">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-white sm:pl-3"
                    >
                      Features
                    </th>
                    {plans.map((plan) => (
                      <th
                        key={plan.name}
                        scope="col"
                        className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text px-3 py-3.5 text-center text-sm font-semibold text-transparent"
                      >
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/20">
                  {Object.keys(plans[0].features).map((feature) => (
                    <motion.tr
                      key={feature}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5 }}
                      className="group"
                    >
                      <td className="py-4 pl-6 pr-3 text-sm font-medium text-gray-300 transition-colors group-hover:text-white sm:pl-3">
                        {feature}
                      </td>
                      {plans.map((plan) => (
                        <td
                          key={`${plan.name}-${feature}`}
                          className="px-3 py-4 text-center"
                        >
                          {plan.features[feature] ? (
                            <Check className="mx-auto h-5 w-5 text-cyan-400 transition-colors group-hover:text-cyan-300" />
                          ) : (
                            <X className="mx-auto h-5 w-5 text-gray-600 transition-colors group-hover:text-gray-500" />
                          )}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
