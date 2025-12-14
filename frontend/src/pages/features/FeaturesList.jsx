// import { motion } from 'framer-motion';
// import {
//   Calendar,
//   Users,
//   ClipboardCheck,
//   CreditCard,
//   BarChart2,
//   MessageSquare,
//   Bell,
//   Settings,
// } from 'lucide-react';

// const features = [
//   {
//     name: 'Reservation Management',
//     description:
//       'Manage bookings across multiple channels, prevent overbooking, and optimize room allocation automatically.',
//     icon: Calendar,
//     details: [
//       'Real-time availability updates',
//       'Multi-channel booking sync',
//       'Automated confirmation emails',
//       'Group booking management',
//     ],
//   },
//   {
//     name: 'Guest Management',
//     description:
//       'Keep track of guest preferences, history, and special requests to provide personalized service.',
//     icon: Users,
//     details: [
//       'Guest profiles and history',
//       'VIP guest handling',
//       'Special requests tracking',
//       'Guest feedback management',
//     ],
//   },
//   {
//     name: 'Housekeeping',
//     description:
//       'Streamline cleaning operations, track room status, and manage maintenance requests efficiently.',
//     icon: ClipboardCheck,
//     details: [
//       'Room status tracking',
//       'Cleaning schedule automation',
//       'Maintenance request handling',
//       'Inventory management',
//     ],
//   },
//   {
//     name: 'Billing & Payments',
//     description:
//       'Process payments securely, manage invoices, and handle multiple payment methods with ease.',
//     icon: CreditCard,
//     details: [
//       'Secure payment processing',
//       'Multiple payment methods',
//       'Automated invoicing',
//       'Split billing support',
//     ],
//   },
//   {
//     name: 'Analytics & Reports',
//     description:
//       'Get insights into your business performance with detailed reports and analytics.',
//     icon: BarChart2,
//     details: [
//       'Occupancy analytics',
//       'Revenue forecasting',
//       'Performance metrics',
//       'Custom report builder',
//     ],
//   },
//   {
//     name: 'Guest Communication',
//     description:
//       'Stay in touch with guests before, during, and after their stay with automated messaging.',
//     icon: MessageSquare,
//     details: [
//       'Automated notifications',
//       'Email templates',
//       'SMS integration',
//       'Guest feedback surveys',
//     ],
//   },
//   {
//     name: 'Staff Management',
//     description:
//       'Manage staff schedules, track performance, and assign tasks efficiently.',
//     icon: Bell,
//     details: [
//       'Staff scheduling',
//       'Task assignment',
//       'Performance tracking',
//       'Internal communication',
//     ],
//   },
//   {
//     name: 'System Configuration',
//     description:
//       "Customize the system to match your hotel's needs with flexible settings and integrations.",
//     icon: Settings,
//     details: [
//       'Custom room types',
//       'Rate plan configuration',
//       'User role management',
//       'Integration settings',
//     ],
//   },
// ];

// export const FeaturesList = () => {
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
//             Powerful Features for Modern Hotels
//           </h2>
//           <p className="mt-6 text-lg leading-8 text-dark/70">
//             Our comprehensive suite of features helps you manage every aspect of
//             your hotel operations efficiently.
//           </p>
//         </motion.div>

//         <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
//           <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
//             {features.map((feature, index) => (
//               <motion.div
//                 key={feature.name}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 viewport={{ once: true }}
//                 transition={{ duration: 0.5, delay: index * 0.1 }}
//                 className="flex flex-col rounded-2xl bg-gray-50 p-8"
//               >
//                 <dt className="flex items-center gap-x-4">
//                   <feature.icon
//                     className="h-8 w-8 flex-none text-primary"
//                     aria-hidden="true"
//                   />
//                   <h3 className="text-lg font-semibold leading-7 text-dark">
//                     {feature.name}
//                   </h3>
//                 </dt>
//                 <dd className="mt-4 flex flex-auto flex-col">
//                   <p className="flex-auto text-base leading-7 text-dark/70">
//                     {feature.description}
//                   </p>
//                   <ul className="mt-4 space-y-2 text-sm text-dark/70">
//                     {feature.details.map((detail) => (
//                       <li key={detail} className="flex items-center">
//                         <span className="mr-2 h-1 w-1 flex-none rounded-full bg-primary" />
//                         {detail}
//                       </li>
//                     ))}
//                   </ul>
//                 </dd>
//               </motion.div>
//             ))}
//           </dl>
//         </div>
//       </div>
//     </section>
//   );
// };


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
    name: 'Hotel Management',
    description:
      'Manage bookings across multiple channels, prevent overbooking, and optimize room allocation automatically.Smooth room operations from check-in to checkout',
    icon: Calendar,
    details: [
    

`Room availability & allocation management`,

`Fast check-in and check-out process`,

`Automatic room billing`,

`Room-wise food order linking`,

`Live room status tracking`,


    ],
  },
  {
    name: 'Restaurant Management',
    description:
      'Manage bookings across multiple channels, prevent overbooking, and optimize table allocation automatically.End-to-end restaurant operations, fully automated',
    icon: Calendar,
    details: [
      `Table-wise food ordering`,

`Waiter to kitchen direct order flow`,

`Automatic KOT generation`,

`Live order status (Preparing / Ready / Served)`,

`Clear table & order visibility`,
    
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
    name: 'Smart Billing (Hotel + Restaurant)',
    description:
      'One-click billing, full clarity',
    icon: ClipboardCheck,
    details: [
    `Separate restaurant bill & room bill`,

`Room + food bill combined automatically`,

`One-click print (separate pages)`,

`Multiple payment modes`,

`Complete payment records`,
    ],
  },
  {
    name: 'In-Room Food Ordering',
    description:
      'Premium experience for room guests',
    icon: CreditCard,
    details: [
      `Guests order food directly from rooms`,

`Instant KOT sent to kitchen`,

`Food bill auto-added to room bill`,

`Full order & billing tracking`,
    ]
  },
  {
    name: 'Analytics & Reports',
    description:
      'Get insights into your business performance with detailed reports and analytics.',
    icon: BarChart2,
    details: [
      `Hotel revenue reports`,

`Restaurant sales reports`,

`Combined hotel + restaurant summary`,
`Date-wise transactions & trends`,

`Inventory consumption reports`
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
    <section className="relative overflow-hidden py-24 sm:py-32">
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
            <span className="text-white">Powerful Features for</span>{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Modern Hotels
            </span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-400">
            Our comprehensi  'Multi-channel booking sync',
      'Automated confirmation emails',
      'Group booking management',ve suite of features helps you manage every aspect of
            your hotel operations efficiently.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-6 lg:max-w-none lg:grid-cols-2">
            {features.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden flex flex-col rounded-2xl border border-cyan-500/20 bg-slate-900/50 p-8 backdrop-blur-sm hover:bg-slate-900/60"
              >
                {/* Card gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent opacity-50 transition-opacity group-hover:opacity-70" />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                {/* Border Glow */}
                <div className="absolute inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-cyan-500/30 via-transparent to-transparent blur-sm" />

                <div className="relative flex flex-col h-full">
                  <dt className="flex items-center gap-x-4">
                    <div className="rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-2 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-cyan-500/20">
                      <feature.icon
                        className="h-6 w-6 text-cyan-400 group-hover:text-cyan-300 transition-colors group-hover:animate-pulse"
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="text-lg font-semibold leading-7 text-gray-200 group-hover:bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-300">
                      {feature.name}
                    </h3>
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col">
                    <p className="flex-auto text-base leading-7 text-gray-400 group-hover:text-gray-300 transition-colors">
                      {feature.description}
                    </p>
                    <ul className="mt-4 space-y-2 text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                      {feature.details.map((detail) => (
                        <li key={detail} className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 flex-none rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 group-hover:animate-pulse" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};
