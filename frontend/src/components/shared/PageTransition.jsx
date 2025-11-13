// import { motion } from 'framer-motion';

// const pageVariants = {
//   initial: {
//     opacity: 0,
//     y: 20,
//   },
//   enter: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.4,
//       ease: 'easeOut',
//     },
//   },
//   exit: {
//     opacity: 0,
//     y: 20,
//     transition: {
//       duration: 0.3,
//       ease: 'easeIn',
//     },
//   },
// };

// export const PageTransition = ({ children, className }) => {
//   return (
//     <motion.div
//       initial="initial"
//       animate="enter"
//       exit="exit"
//       variants={pageVariants}
//       className={className}
//     >
//       {children}
//     </motion.div>
//   );
// };


import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.1,
      ease: 'easeIn',
    },
  },
};

export const PageTransition = ({ children, className }) => {
  return (
    <>
      <motion.div
        className="fixed inset-0 bg-slate-950 z-[-1]"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 1 }}
      />
      <motion.div
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        className={className}
      >
        {children}
      </motion.div>
    </>
  );
};

