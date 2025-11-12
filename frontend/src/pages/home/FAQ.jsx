import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'What are your opening hours?',
    answer:
      'We are open Monday through Friday from 11:00 AM to 10:00 PM, and Saturday to Sunday from 12:00 PM to 11:00 PM. Last orders are taken 30 minutes before closing time.',
  },
  {
    question: 'Do I need to make a reservation?',
    answer:
      'While walk-ins are welcome, we highly recommend making a reservation, especially for dinner service and weekends, to ensure you get your preferred dining time. You can book through our website or call us directly.',
  },
  {
    question: 'What cuisines do you specialize in?',
    answer:
      'We offer an exquisite blend of traditional Indian and modern fusion cuisine. Our menu features both authentic recipes passed down through generations and innovative contemporary interpretations.',
  },
  {
    question: 'Do you accommodate dietary restrictions?',
    answer:
      'Yes, we cater to various dietary requirements including vegetarian, vegan, gluten-free, and halal options. Our chefs can modify most dishes to accommodate allergies. Please inform us of any restrictions when making your reservation.',
  },
  {
    question: 'Is there parking available?',
    answer:
      'Yes, we offer complimentary valet parking for our guests. There is also street parking and a public parking garage within walking distance. For large events, we can arrange special parking arrangements.',
  },
  {
    question: 'What is your dress code?',
    answer:
      'We maintain a smart casual dress code. While formal attire is not required, we ask that guests refrain from wearing beachwear, athletic wear, or flip-flops. Collared shirts are preferred for gentlemen.',
  },
  {
    question: 'Do you offer private dining or event spaces?',
    answer:
      'Yes, we have elegant private dining rooms available for special events, corporate functions, and celebrations. Our event spaces can accommodate groups from 10 to 100 guests. Please contact our events team for more information.',
  },
  {
    question: 'Are children welcome at the restaurant?',
    answer:
      "Yes, we welcome families and offer a special children's menu. High chairs and booster seats are available. For the best experience, we recommend making early reservations for families with young children.",
  },
  {
    question: 'Do you have live entertainment?',
    answer:
      'We feature live classical Indian music performances on Friday and Saturday evenings. Special cultural performances are also arranged during festivals and events.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards, debit cards, and digital payment methods including UPI. For private events, we also accept bank transfers.',
  },
];

const FAQ = ({ question, answer, isOpen, onClick }) => {
  return (
    <motion.div
      initial={false}
      className="border-b border-primary/10 last:border-0"
    >
      <button
        className="group flex w-full items-center justify-between px-6 py-6 text-left transition-colors hover:bg-primary/5"
        onClick={onClick}
      >
        <span className="text-lg font-medium text-dark group-hover:text-primary">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-4 shrink-0"
        >
          <ChevronDown className="h-5 w-5 text-primary" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden px-6"
          >
            <p className="pb-6 leading-relaxed text-dark/70">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

import { ContactForm } from '../../components/ContactForm';

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-white to-primary/5 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="container relative">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold text-dark md:text-4xl lg:text-5xl">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
            <p className="text-lg text-dark/70">
              Find answers to common questions about dining at BIREENA{' '}
              <span className="font-devanagari">अतिथि</span>.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <div className="divide-y divide-primary/10 rounded-2xl border border-primary/20 bg-white/80 shadow-xl backdrop-blur-sm">
              {faqs.map((faq, index) => (
                <FAQ
                  key={index}
                  {...faq}
                  isOpen={index === openIndex}
                  onClick={() => setOpenIndex(index === openIndex ? -1 : index)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <ContactForm />
    </>
  );
};
