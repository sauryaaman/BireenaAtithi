import { Hero } from './Hero';
import { Features } from './Features';
import { Owner } from './Owner';
import { Testimonials } from './Testimonials';
import { FAQSection } from './FAQ';

export const HomePage = () => {
  return (
    <>
      <Hero />
      <Features />
      <Owner />
      <Testimonials />
      <FAQSection />
    </>
  );
};
