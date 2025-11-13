// import { motion } from 'framer-motion';
// import { Button } from '../../components/ui';
// import { Check } from 'lucide-react';
// import { Link } from 'react-router-dom';

// const tiers = [
//   {
//     name: 'Basic',
//     id: 'basic',
//     priceMonthly: '13,000',
//     description: 'Perfect for small hotels and guest houses.',
//     features: [
//       'Up to 20 rooms',
//       'Basic reservation management',
//       'Front desk operations',
//       'Housekeeping management',
//       'Basic reporting',
//       'Guest profiles',
//       'Email support',
//       'Regular updates',
//     ],
//     mostPopular: false,
//   },
//   {
//     name: 'Professional',
//     id: 'professional',
//     priceMonthly: '20,000',
//     description: 'Ideal for medium-sized hotels with advanced needs.',
//     features: [
//       'Up to 50 rooms',
//       'Advanced reservation system',
//       'Channel manager integration',
//       'Online booking engine',
//       'Advanced reporting & analytics',
//       'Staff management',
//       'Priority email & phone support',
//       'Regular updates',
//       'Mobile app access',
//       'POS integration',
//       'Multiple payment gateways',
//     ],
//     mostPopular: true,
//   },
//   {
//     name: 'Enterprise',
//     id: 'enterprise',
//     priceMonthly: '40,000',
//     description: 'For large hotels requiring maximum features and support.',
//     features: [
//       'Unlimited rooms',
//       'Full reservation system',
//       'Multi-property management',
//       'Revenue management',
//       'Custom reporting',
//       'API access',
//       '24/7 priority support',
//       'Dedicated account manager',
//       'Custom integrations',
//       'White-label solution',
//       'Staff training',
//       'Regular updates',
//       'Mobile app access',
//       'Advanced security features',
//     ],
//     mostPopular: false,
//   },
// ];

// export const PricingPage = () => {
//   return (
//     <div className="min-h-screen bg-white">
//       {/* Header section */}
//       <section className="relative overflow-hidden bg-gradient-to-r from-white via-white to-gradient-red/5 py-24 sm:py-32">
//         <div className="container relative">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//             className="mx-auto max-w-2xl text-center"
//           >
//             <h1 className="text-4xl font-bold tracking-tight text-dark sm:text-5xl">
//               Simple, Transparent Pricing
//             </h1>
//             <p className="mt-6 text-lg leading-8 text-dark/70">
//               Choose the plan that best fits your hotel's needs. All plans
//               include core features with varying levels of support and
//               capabilities.
//             </p>
//           </motion.div>
//         </div>
//       </section>

//       {/* Pricing section */}
//       <section className="py-16 sm:py-24">
//         <div className="container">
//           <div className="isolate mx-auto grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
//             {tiers.map((tier, index) => (
//               <motion.div
//                 key={tier.id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.5, delay: index * 0.1 }}
//                 className={`rounded-3xl p-8 ring-1 ${
//                   tier.mostPopular
//                     ? 'bg-primary/5 ring-primary'
//                     : 'ring-gray-200'
//                 }`}
//               >
//                 <h3
//                   className={`text-lg font-semibold leading-8 ${
//                     tier.mostPopular ? 'text-primary' : 'text-dark'
//                   }`}
//                 >
//                   {tier.name}
//                 </h3>

//                 {tier.mostPopular && (
//                   <p className="absolute -top-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
//                     Most popular
//                   </p>
//                 )}

//                 <p className="mt-4 text-sm leading-6 text-dark/70">
//                   {tier.description}
//                 </p>
//                 <p className="mt-6 flex items-baseline gap-x-1">
//                   <span className="text-xl font-bold text-dark">₹</span>
//                   <span className="text-4xl font-bold tracking-tight text-dark">
//                     {tier.priceMonthly}
//                   </span>
//                   <span className="text-sm font-semibold leading-6 text-dark/70">
//                     /year
//                   </span>
//                 </p>

//                 <Button
//                   asChild
//                   variant={tier.mostPopular ? 'default' : 'outline'}
//                   className={`mt-6 w-full ${
//                     tier.mostPopular
//                       ? 'bg-primary text-white hover:bg-primary/90'
//                       : ''
//                   }`}
//                 >
//                   <Link to="/contact">Get started</Link>
//                 </Button>

//                 <ul className="mt-8 space-y-3 text-sm leading-6 text-dark/70">
//                   {tier.features.map((feature) => (
//                     <li key={feature} className="flex gap-x-3">
//                       <Check
//                         className={`h-6 w-5 flex-none ${
//                           tier.mostPopular ? 'text-primary' : 'text-gray-600'
//                         }`}
//                         aria-hidden="true"
//                       />
//                       {feature}
//                     </li>
//                   ))}
//                 </ul>
//               </motion.div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* FAQ Section */}
//       <section className="bg-gray-50 py-16 sm:py-24">
//         <div className="container">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             whileInView={{ opacity: 1, y: 0 }}
//             viewport={{ once: true }}
//             transition={{ duration: 0.5 }}
//             className="mx-auto max-w-2xl text-center"
//           >
//             <h2 className="text-3xl font-bold tracking-tight text-dark sm:text-4xl">
//               Frequently Asked Questions
//             </h2>
//             <p className="mt-6 text-lg leading-8 text-dark/70">
//               Have questions about our pricing? We've got you covered.
//             </p>
//           </motion.div>

//           <dl className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 sm:mt-20 lg:grid-cols-2">
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.5 }}
//               className="rounded-2xl bg-white p-8 ring-1 ring-gray-200"
//             >
//               <dt className="text-lg font-semibold leading-7 text-dark">
//                 Can I switch plans later?
//               </dt>
//               <dd className="mt-4 text-base leading-7 text-dark/70">
//                 Yes, you can upgrade or downgrade your plan at any time. We'll
//                 prorate the charges accordingly.
//               </dd>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.5, delay: 0.1 }}
//               className="rounded-2xl bg-white p-8 ring-1 ring-gray-200"
//             >
//               <dt className="text-lg font-semibold leading-7 text-dark">
//                 Is there a setup fee?
//               </dt>
//               <dd className="mt-4 text-base leading-7 text-dark/70">
//                 No, there are no hidden setup fees. The price you see is all you
//                 pay, plus applicable taxes.
//               </dd>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//               className="rounded-2xl bg-white p-8 ring-1 ring-gray-200"
//             >
//               <dt className="text-lg font-semibold leading-7 text-dark">
//                 Can I pay monthly instead of yearly?
//               </dt>
//               <dd className="mt-4 text-base leading-7 text-dark/70">
//                 We offer yearly billing to provide the best value for our
//                 customers. Contact us for custom billing arrangements.
//               </dd>
//             </motion.div>

//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               whileInView={{ opacity: 1, y: 0 }}
//               viewport={{ once: true }}
//               transition={{ duration: 0.5, delay: 0.3 }}
//               className="rounded-2xl bg-white p-8 ring-1 ring-gray-200"
//             >
//               <dt className="text-lg font-semibold leading-7 text-dark">
//                 What kind of support do you offer?
//               </dt>
//               <dd className="mt-4 text-base leading-7 text-dark/70">
//                 Each plan includes different levels of support. Basic plans get
//                 email support, while higher tiers receive priority support and
//                 dedicated account managers.
//               </dd>
//             </motion.div>
//           </dl>
//         </div>
//       </section>
//     </div>
//   );
// };


import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const tiers = [
  {
    name: 'Basic',
    id: 'basic',
    priceMonthly: '13,000',
    description: 'Perfect for small hotels and guest houses.',
    features: [
      'Up to 20 rooms',
      'Basic reservation management',
      'Front desk operations',
      'Housekeeping management',
      'Basic reporting',
      'Guest profiles',
      'Email support',
      'Regular updates',
    ],
    mostPopular: false,
  },
  {
    name: 'Professional',
    id: 'professional',
    priceMonthly: '20,000',
    description: 'Ideal for medium-sized hotels with advanced needs.',
    features: [
      'Up to 50 rooms',
      'Advanced reservation system',
      'Channel manager integration',
      'Online booking engine',
      'Advanced reporting & analytics',
      'Staff management',
      'Priority email & phone support',
      'Regular updates',
      'Mobile app access',
      'POS integration',
      'Multiple payment gateways',
    ],
    mostPopular: true,
  },
  {
    name: 'Enterprise',
    id: 'enterprise',
    priceMonthly: '40,000',
    description: 'For large hotels requiring maximum features and support.',
    features: [
      'Unlimited rooms',
      'Full reservation system',
      'Multi-property management',
      'Revenue management',
      'Custom reporting',
      'API access',
      '24/7 priority support',
      'Dedicated account manager',
      'Custom integrations',
      'White-label solution',
      'Staff training',
      'Regular updates',
      'Mobile app access',
      'Advanced security features',
    ],
    mostPopular: false,
  },
];

export const PricingPage = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-slate-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 mix-blend-overlay" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_50%,rgba(6,182,212,0.1),transparent)]" />
        </div>

        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="text-white">Simple,</span>{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Transparent Pricing
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-400">
              Choose the plan that best fits your hotel's needs. All plans
              include core features with varying levels of support and
              capabilities.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing section */}
      <section className="relative py-16 sm:py-24">
        <div className="container relative">
          <div className="isolate mx-auto grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {tiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative overflow-hidden rounded-2xl border ${
                  tier.mostPopular
                    ? 'border-cyan-500/40 bg-slate-900/80'
                    : 'border-cyan-500/20 bg-slate-900/50'
                } p-8 backdrop-blur-sm`}
              >
                {/* Card gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent opacity-50" />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                <div className="relative">
                  <h3 className={`text-lg font-semibold leading-8 ${
                    tier.mostPopular 
                      ? 'bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent'
                      : 'text-white'
                  }`}>
                    {tier.name}
                  </h3>

                  {tier.mostPopular && (
                    <p className="absolute -top-3 right-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1 text-xs font-semibold text-white">
                      Most popular
                    </p>
                  )}

                  <p className="mt-4 text-sm leading-6 text-gray-400">
                    {tier.description}
                  </p>
                  <p className="mt-6 flex items-baseline gap-x-1">
                    <span className="text-xl font-bold text-cyan-400">₹</span>
                    <span className="text-4xl font-bold tracking-tight text-white">
                      {tier.priceMonthly}
                    </span>
                    <span className="text-sm font-semibold leading-6 text-gray-400">
                      /year
                    </span>
                  </p>

                  <Button
                    asChild
                    variant={tier.mostPopular ? 'default' : 'outline'}
                    className={`relative mt-6 w-full overflow-hidden group ${
                      tier.mostPopular
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400'
                        : 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10'
                    }`}
                  >
                    <Link to="/contact">
                      Get started
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                    </Link>
                  </Button>

                  <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-400">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3 group-hover:text-gray-300 transition-colors">
                        <Check
                          className={`h-6 w-5 flex-none ${
                            tier.mostPopular ? 'text-cyan-400' : 'text-cyan-500/70'
                          }`}
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-16 sm:py-24">
        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="text-white">Frequently Asked</span>{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-400">
              Have questions about our pricing? We've got you covered.
            </p>
          </motion.div>

          <dl className="mx-auto mt-16 grid max-w-4xl grid-cols-1 gap-8 sm:mt-20 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="group relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900/50 p-8 backdrop-blur-sm"
            >
              {/* Card gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent opacity-50" />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <div className="relative">
                <dt className="text-lg font-semibold leading-7 text-white group-hover:bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  Can I switch plans later?
                </dt>
                <dd className="mt-4 text-base leading-7 text-gray-400 group-hover:text-gray-300 transition-colors">
                  Yes, you can upgrade or downgrade your plan at any time. We'll
                  prorate the charges accordingly.
                </dd>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900/50 p-8 backdrop-blur-sm"
            >
              {/* Card gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent opacity-50" />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <div className="relative">
                <dt className="text-lg font-semibold leading-7 text-white group-hover:bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  Is there a setup fee?
                </dt>
                <dd className="mt-4 text-base leading-7 text-gray-400 group-hover:text-gray-300 transition-colors">
                  No, there are no hidden setup fees. The price you see is all you
                  pay, plus applicable taxes.
                </dd>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="group relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900/50 p-8 backdrop-blur-sm"
            >
              {/* Card gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent opacity-50" />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <div className="relative">
                <dt className="text-lg font-semibold leading-7 text-white group-hover:bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  Can I pay monthly instead of yearly?
                </dt>
                <dd className="mt-4 text-base leading-7 text-gray-400 group-hover:text-gray-300 transition-colors">
                  We offer yearly billing to provide the best value for our
                  customers. Contact us for custom billing arrangements.
                </dd>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="group relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-900/50 p-8 backdrop-blur-sm"
            >
              {/* Card gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent opacity-50" />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              
              <div className="relative">
                <dt className="text-lg font-semibold leading-7 text-white group-hover:bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                  What kind of support do you offer?
                </dt>
                <dd className="mt-4 text-base leading-7 text-gray-400 group-hover:text-gray-300 transition-colors">
                  Each plan includes different levels of support. Basic plans get
                  email support, while higher tiers receive priority support and
                  dedicated account managers.
                </dd>
              </div>
            </motion.div>
          </dl>
        </div>
      </section>
    </div>
  );
};
