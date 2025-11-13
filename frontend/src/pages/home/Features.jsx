// import { motion } from 'framer-motion';
// import {
//   UtensilsCrossed,
//   Calendar,
//   CreditCard,
//   Search,
//   Star,
//   MessageSquare,
// } from 'lucide-react';

// const features = [
//   {
//     title: 'Menu Management',
//     description:
//       'Easily update and customize your menu items with real-time changes.',
//     icon: UtensilsCrossed,
//   },
//   {
//     title: 'Online Reservations',
//     description: 'Seamless table booking system for your customers.',
//     icon: Calendar,
//   },
//   {
//     title: 'Secure Payments',
//     description: 'Multiple payment options with secure transaction processing.',
//     icon: CreditCard,
//   },
//   {
//     title: 'SEO Optimized',
//     description:
//       'Enhanced visibility for better reach and customer engagement.',
//     icon: Search,
//   },
//   {
//     title: 'Loyalty Program',
//     description:
//       'Reward your regular customers with special offers and points.',
//     icon: Star,
//   },
//   {
//     title: 'Customer Feedback',
//     description: 'Collect and manage customer reviews and ratings.',
//     icon: MessageSquare,
//   },
// ];

// const containerVariants = {
//   hidden: {},
//   visible: {
//     transition: {
//       staggerChildren: 0.2,
//     },
//   },
// };

// const itemVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0 },
// };

// export const Features = () => {
//   return (
//     <section className="bg-white py-24">
//       <div className="container">
//         <div className="mx-auto mb-16 max-w-3xl text-center">
//           <h2 className="mb-6 text-3xl font-bold text-dark md:text-4xl">
//             Why Choose{' '}
//             <span className="text-primary">
//               BIREENA <span className="font-devanagari">अतिथि</span>
//             </span>
//           </h2>
//           <p className="text-dark/70">
//             Experience a perfect blend of traditional cuisine and modern dining
//             technology for an unforgettable culinary journey.
//           </p>
//         </div>

//         <motion.div
//           variants={containerVariants}
//           initial="hidden"
//           whileInView="visible"
//           viewport={{ once: true, margin: '-100px' }}
//           className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
//         >
//           {features.map((feature, index) => (
//             <motion.div
//               key={index}
//               variants={itemVariants}
//               className="rounded-lg border border-primary/10 bg-white p-6 transition-all hover:border-primary hover:shadow-lg"
//             >
//               <feature.icon className="mb-4 h-12 w-12 text-primary" />
//               <h3 className="mb-3 text-xl font-semibold text-dark">
//                 {feature.title}
//               </h3>
//               <p className="text-dark/70">{feature.description}</p>
//             </motion.div>
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// };

import { motion } from 'framer-motion';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUtensils,
  faCalendar,
  faCreditCard,
  faSearch,
  faStar,
  faMessage
} from '@fortawesome/free-solid-svg-icons';

const features = [
  {
    title: 'Menu Management',
    description:
      'Easily update and customize your menu items with real-time changes.',
    icon: faUtensils,
    colorTheme: 'primary'
  },
  {
    title: 'Online Reservations',
    description: 'Seamless table booking system for your customers.',
    icon: faCalendar,
    colorTheme: 'success'
  },
  {
    title: 'Secure Payments',
    description: 'Multiple payment options with secure transaction processing.',
    icon: faCreditCard,
    colorTheme: 'info'
  },
  {
    title: 'SEO Optimized',
    description:
      'Enhanced visibility for better reach and customer engagement.',
    icon: faSearch,
    colorTheme: 'purple'
  },
  {
    title: 'Loyalty Program',
    description:
      'Reward your regular customers with special offers and points.',
    icon: faStar,
    colorTheme: 'warning'
  },
  {
    title: 'Customer Feedback',
    description: 'Collect and manage customer reviews and ratings.',
    icon: faMessage,
    colorTheme: 'danger'
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

const colorThemes = {
  primary: {
    bg: 'from-blue-900/50 to-blue-950/50',
    border: 'border-blue-500/20 hover:border-blue-400',
    icon: 'text-blue-400',
    iconBg: 'bg-blue-500/10',
    title: 'text-slate-200',
    value: 'text-slate-100',
    secondary: 'text-slate-400',
    hoverBg: 'hover:bg-blue-500/20'
  },
  success: {
    bg: 'from-emerald-900/50 to-emerald-950/50',
    border: 'border-emerald-500/20 hover:border-emerald-400',
    icon: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10',
    title: 'text-slate-200',
    value: 'text-slate-100',
    secondary: 'text-slate-400',
    hoverBg: 'hover:bg-emerald-500/20'
  },
  warning: {
    bg: 'from-amber-900/50 to-amber-950/50',
    border: 'border-amber-500/20 hover:border-amber-400',
    icon: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    title: 'text-slate-200',
    value: 'text-slate-100',
    secondary: 'text-slate-400',
    hoverBg: 'hover:bg-amber-500/20'
  },
  danger: {
    bg: 'from-teal-900/50 to-teal-950/50',
    border: 'border-teal-500/20 hover:border-teal-400',
    icon: 'text-teal-400',
    iconBg: 'bg-teal-500/10',
    title: 'text-slate-200',
    value: 'text-slate-100',
    secondary: 'text-slate-400',
    hoverBg: 'hover:bg-teal-500/20'
  },
  info: {
    bg: 'from-cyan-900/50 to-cyan-950/50',
    border: 'border-cyan-500/20 hover:border-cyan-400',
    icon: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10',
    title: 'text-slate-200',
    value: 'text-slate-100',
    secondary: 'text-slate-400',
    hoverBg: 'hover:bg-cyan-500/20'
  },
  purple: {
    bg: 'from-purple-900/50 to-purple-950/50',
    border: 'border-purple-500/20 hover:border-purple-400',
    icon: 'text-purple-400',
    iconBg: 'bg-purple-500/10',
    title: 'text-slate-200',
    value: 'text-slate-100',
    secondary: 'text-slate-400',
    hoverBg: 'hover:bg-purple-500/20'
  }
};

const getColorTheme = (colorTheme) => {
  return colorThemes[colorTheme] || colorThemes.primary;
};

export const Features = () => {
  return (
    <section className="relative overflow-hidden py-24">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-10" />
      {/* Base dark background */}
      <div className="absolute inset-0 bg-slate-950" />
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
      {/* Decorative gradients */}
      <div className="absolute right-0 top-1/4 h-64 w-64 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-3xl rounded-full" />
      <div className="absolute left-0 bottom-1/4 h-64 w-64 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 blur-3xl rounded-full" />
      
      <div className="container relative">
        <div className="mx-auto mb-20 max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl text-slate-100">
            Why Choose{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient font-devanagari">
              BIREENA<span className="font-devanagari">अतिथि</span>
            </span>
          </h2>
          <p className="text-base md:text-lg text-slate-400 leading-relaxed">
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
              className={`
                group relative overflow-hidden 
                bg-gradient-to-br ${getColorTheme(feature.colorTheme).bg}
                backdrop-blur-xl rounded-xl p-8
                border ${getColorTheme(feature.colorTheme).border}
                shadow-lg transition-all duration-500
                hover:scale-[1.02] hover:shadow-2xl ${getColorTheme(feature.colorTheme).hoverBg}
                before:absolute before:inset-0 before:bg-slate-950/30 before:rounded-xl
                after:absolute after:inset-0 after:rounded-xl after:bg-gradient-to-br after:from-transparent after:to-white/5
              `}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out"></div>
              
              <div className="relative z-10 flex items-start gap-6">
                {/* Icon */}
                <div className={`${getColorTheme(feature.colorTheme).iconBg} p-4 rounded-xl flex-shrink-0 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg ring-1 ring-white/10`}>
                  <FontAwesomeIcon 
                    icon={feature.icon}
                    className={`text-xl ${getColorTheme(feature.colorTheme).icon} group-hover:animate-pulse`}
                  />
                </div>

                <div className="flex-1 pt-1">
                  <h3 className={`text-lg font-semibold ${getColorTheme(feature.colorTheme).title} group-hover:text-white transition-colors duration-500 mb-2`}>
                    {feature.title}
                  </h3>
                  
                  <p className={`text-sm ${getColorTheme(feature.colorTheme).secondary} tracking-tight leading-relaxed transition-colors duration-500`}>
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Hover glow effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-xl"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
