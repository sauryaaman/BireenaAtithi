


import { motion } from 'framer-motion';
import { Button } from '@/components/ui';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const pricingPlans = [
  {
    name: 'Hotel Management',
    id: 'hotel',
    description: 'Complete hotel management solution with all features.',
    prices: {
      monthly: '2,799',
      halfYearly: '16,999',
      yearly: '28,999',
    },
    features: [
      'Room Management & Availability',
      'Guest Check-in & Check-out',
      'Booking Management',
      'Room Pricing & Billing',
      'Guest Profile Management',
      'Housekeeping Management',
      'Front Desk Operations',
      'Advanced Reports & Analytics',
      'User Roles & Permissions',
      'Automatic Room Billing',
      'Payment Gateway Integration',
      'Email & SMS Notifications',
    ],
    mostPopular: false,
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    name: 'Restaurant Management',
    id: 'restaurant',
    description: 'Complete restaurant & food service management.',
    prices: {
      monthly: '2,899',
      halfYearly: '17,999',
      yearly: '29,999',
    },
    features: [
      'Food Menu Management',
      'Category & Pricing Control',
      'Table Management System',
      'KOT (Kitchen Order Token)',
      'Order Management',
      'Food Billing System',
      'In-Room Food Ordering',
      'Restaurant Operations',
      'Kitchen Display System',
      'Advanced Reports & Analytics',
      'User Roles & Permissions',
      'Payment Integration',
    ],
    mostPopular: false,
    gradient: 'from-blue-500 to-purple-500',
  },
  {
    name: 'Combo Package',
    id: 'combo',
    description: 'Hotel + Restaurant - Complete management solution.',
    prices: {
      monthly: '5,499',
      halfYearly: '33,999',
      yearly: '54,999',
    },
    features: [
      '✨ All Hotel Management Features',
      '✨ All Restaurant Management Features',
      'Unified Dashboard',
      'Combined Billing System',
      'Room + Food Bill Together',
      'Smart KOT Management',
      'In-Room Food Ordering',
      'Complete Guest Experience',
      'Integrated Reports & Analytics',
      'Seamless Operations',
      'Priority Support',
      'Regular Updates & Maintenance',
    ],
    mostPopular: true,
    gradient: 'from-purple-500 via-pink-500 to-cyan-500',
    badge: 'Best Value',
  },
];

export const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState('yearly');

  const getPriceByBilling = (prices) => {
    switch (billingCycle) {
      case 'monthly':
        return prices.monthly;
      case 'halfYearly':
        return prices.halfYearly;
      case 'yearly':
        return prices.yearly;
      default:
        return prices.yearly;
    }
  };

  const getBillingLabel = () => {
    switch (billingCycle) {
      case 'monthly':
        return '/month';
      case 'halfYearly':
        return '/6 months';
      case 'yearly':
        return '/year';
      default:
        return '/year';
    }
  };

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
            className="mx-auto max-w-3xl text-center"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="text-white">Simple,</span>{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Transparent Pricing
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-400">
              Choose the perfect plan for your business. All features included in every plan - 
              Hotel Management, Restaurant Management, or both together.
            </p>

            {/* Billing Cycle Toggle */}
            <div className="mt-10 flex justify-center">
              <div className="relative rounded-full bg-slate-900/80 p-1.5 border border-cyan-500/30 backdrop-blur-sm">
                <div className="flex gap-1">
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`relative rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                      billingCycle === 'monthly'
                        ? 'text-white'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    {billingCycle === 'monthly' && (
                      <motion.div
                        layoutId="activeBilling"
                        className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        transition={{ type: 'spring', duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10">1 Month</span>
                  </button>
                  <button
                    onClick={() => setBillingCycle('halfYearly')}
                    className={`relative rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                      billingCycle === 'halfYearly'
                        ? 'text-white'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    {billingCycle === 'halfYearly' && (
                      <motion.div
                        layoutId="activeBilling"
                        className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        transition={{ type: 'spring', duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10">6 Months</span>
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className={`relative rounded-full px-6 py-2.5 text-sm font-semibold transition-all duration-300 ${
                      billingCycle === 'yearly'
                        ? 'text-white'
                        : 'text-gray-400 hover:text-gray-300'
                    }`}
                  >
                    {billingCycle === 'yearly' && (
                      <motion.div
                        layoutId="activeBilling"
                        className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        transition={{ type: 'spring', duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10">1 Year</span>
                    <span className="ml-1.5 text-xs text-cyan-400">Save More</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing section */}
      <section className="relative py-16 sm:py-24">
        <div className="container relative">
          <div className="isolate mx-auto grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative overflow-hidden rounded-2xl border ${
                  plan.mostPopular
                    ? 'border-cyan-500/50 bg-slate-900/80 shadow-xl shadow-cyan-500/20'
                    : 'border-cyan-500/20 bg-slate-900/50'
                } p-8 backdrop-blur-sm transform transition-all duration-300 hover:scale-105`}
              >
                {/* Card gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-10`} />
                
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                <div className="relative">
                  <div className="flex items-start justify-between">
                    <h3 className={`text-xl font-bold leading-8 ${
                      plan.mostPopular 
                        ? `bg-gradient-to-r ${plan.gradient} bg-clip-text text-transparent`
                        : 'text-white'
                    }`}>
                      {plan.name}
                    </h3>

                    {plan.mostPopular && plan.badge && (
                      <span className={`rounded-full bg-gradient-to-r ${plan.gradient} px-3 py-1 text-xs font-semibold text-white shadow-lg`}>
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="mt-4 text-sm leading-6 text-gray-400">
                    {plan.description}
                  </p>
                  
                  <div className="mt-6">
                    <p className="flex items-baseline gap-x-1">
                      <span className="text-xl font-bold text-cyan-400">₹</span>
                      <span className="text-4xl font-bold tracking-tight text-white">
                        {getPriceByBilling(plan.prices)}
                      </span>
                      <span className="text-sm font-semibold leading-6 text-gray-400">
                        {getBillingLabel()}
                      </span>
                    </p>
                    
                    {/* Savings indicator */}
                    {billingCycle === 'yearly' && (
                      <p className="mt-2 text-xs text-green-400 font-medium">
                        💰 Best value - Save more with yearly plan
                      </p>
                    )}
                    {billingCycle === 'halfYearly' && (
                      <p className="mt-2 text-xs text-cyan-400 font-medium">
                        ⚡ Great savings with 6-month plan
                      </p>
                    )}
                  </div>

                  <Button
                    asChild
                    className={`relative mt-6 w-full overflow-hidden ${
                      plan.mostPopular
                        ? `bg-gradient-to-r ${plan.gradient} text-white hover:opacity-90 shadow-lg`
                        : 'border border-cyan-500/50 bg-slate-800/50 text-cyan-400 hover:bg-cyan-500/10'
                    }`}
                  >
                    <Link to="/contact">
                      <span className="relative z-10">Get Started</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
                    </Link>
                  </Button>

                  <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-300">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-x-3 group-hover:text-white transition-colors">
                        <Check
                          className={`h-5 w-5 flex-none ${
                            plan.mostPopular ? 'text-cyan-400' : 'text-cyan-500/70'
                          }`}
                          aria-hidden="true"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 text-center"
          >
            <div className="mx-auto max-w-3xl rounded-2xl border border-cyan-500/20 bg-slate-900/50 p-8 backdrop-blur-sm">
              <p className="text-lg text-gray-300">
                🎯 All plans include <span className="font-semibold text-cyan-400">full access to all features</span> - 
                no hidden costs or feature restrictions. 
              </p>
              <p className="mt-4 text-sm text-gray-400">
                Choose based on your needs: Hotel only, Restaurant only, or both together for maximum efficiency.
              </p>
            </div>
          </motion.div>
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
                  What billing options are available?
                </dt>
                <dd className="mt-4 text-base leading-7 text-gray-400 group-hover:text-gray-300 transition-colors">
                  We offer flexible billing: 1 month, 6 months, or 1 year plans. 
                  Longer plans provide better value and savings.
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
