


import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

const faqs = [
  
  
     {
    question: 'Does the software manage both hotel rooms and restaurant billing?',
    answer:
      'Yes. The software manages hotel room billing and restaurant billing together in a single platform.',
  },
   
   {
    question: 'Can room and food bills be printed together?',
    answer:
      'Each restaurant order generates its own food bill and KOT token, ensuring accurate billing and smooth kitchen operations.',
  },
   {
    question: 'Are all payments recorded?',
    answer:
      'Yes. The software maintains complete payment records for every room and food transaction, including different payment modes.',
  },
   {
    question: 'Is the software easy for  staff to use??',
    answer:
      'Yes. The dashboard is simple, clean, and user-friendly, so staff can use it with minimal training.',
  },
     {
    question: 'Is KOT (Kitchen Order Ticket) generated for food orders?',
    answer:
      'Yes. A KOT token is automatically generated for every food order, whether the order comes from the restaurant table or from a hotel room.',
  },
     {
    question: 'How does billing work for restaurant orders?',
    answer:
      'Each restaurant order generates its own food bill and KOT token, ensuring accurate billing and smooth kitchen operations.',
  },
     
 
 
 
  
];

const FAQ = ({ question, answer, isOpen, onClick }) => {
  return (
    <motion.div
      initial={false}
      className="relative overflow-hidden border-b border-cyan-500/20 last:border-0 group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      <button
        className="group/btn relative flex w-full items-center justify-between px-6 py-6 text-left transition-all duration-300 hover:bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"
        onClick={onClick}
      >
        <span className="text-lg font-medium text-gray-200 group-hover/btn:text-cyan-400 transition-colors">
          {question}
        </span>
        <motion.div
          animate={{ 
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 1.1 : 1
          }}
          transition={{ duration: 0.3, type: "spring" }}
          className="ml-4 shrink-0 bg-cyan-500/20 rounded-full p-2 group-hover/btn:bg-cyan-500/30 transition-colors"
        >
          <FontAwesomeIcon 
            icon={faChevronDown} 
            className="h-4 w-4 text-cyan-400 group-hover/btn:text-cyan-300" 
          />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: 'auto', 
              opacity: 1,
            }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ 
              duration: 0.3,
              ease: "easeInOut"
            }}
            className="overflow-hidden px-6 bg-gradient-to-r from-cyan-500/5 via-transparent to-cyan-500/5"
          >
            <motion.p 
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              exit={{ y: 20 }}
              className="pb-6 leading-relaxed text-gray-400 group-hover:text-gray-300 transition-colors"
            >
              {answer}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

import { ContactForm } from '@/components/ContactForm';

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <>
      <section className="relative overflow-hidden py-24">
        {/* Background gradients */}
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/50 to-slate-950" />
        <div className="absolute right-0 top-1/4 h-64 w-64 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-3xl rounded-full" />
        <div className="absolute left-0 bottom-1/4 h-64 w-64 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 blur-3xl rounded-full" />
        
        <div className="container relative">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Frequently Asked Questions
              </span>
            </h2>
            <p className="text-lg text-gray-400">
              Find answers to common questions about dining at{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent font-medium">
                BIREENA{' '}
                <span className="font-devanagari">अतिथि</span>
              </span>.
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <div className="relative rounded-2xl border border-cyan-500/20 bg-slate-950/80 shadow-2xl shadow-cyan-500/10 backdrop-blur-sm overflow-hidden">
              {/* Card inner glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-transparent opacity-50" />
              
              {/* Content */}
              <div className="relative">
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
        </div>
      </section>

      <ContactForm />
    </>
  );
};
