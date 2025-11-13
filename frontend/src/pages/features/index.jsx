// import { motion } from 'framer-motion';
// import { HeroSection } from './HeroSection';
// import { FeaturesList } from './FeaturesList';
// import { IntegrationSection } from './IntegrationSection';
// import { PricingComparison } from './PricingComparison';

// export const FeaturesPage = () => {
//   return (
//     <div className="min-h-screen bg-white">
//       <HeroSection />
//       <FeaturesList />
//       <IntegrationSection />
//       <PricingComparison />
//     </div>
//   );
// };


import { motion } from 'framer-motion';
import { HeroSection } from './HeroSection';
import { FeaturesList } from './FeaturesList';
import { IntegrationSection } from './IntegrationSection';
import { PricingComparison } from './PricingComparison';

export const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-slate-950">
      <HeroSection />
      <FeaturesList />
      <IntegrationSection />
      <PricingComparison />
    </div>
  );
};
