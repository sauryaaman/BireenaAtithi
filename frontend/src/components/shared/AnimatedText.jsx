// import { motion } from 'framer-motion';

// const defaultAnimations = {
//   hidden: {
//     opacity: 0,
//     y: 20,
//   },
//   visible: {
//     opacity: 1,
//     y: 0,
//   },
// };

// export const AnimatedText = ({
//   text,
//   el: Wrapper = 'p',
//   className,
//   once = true,
//   animation = defaultAnimations,
// }) => {
//   const words = text.split(' ');

//   const container = {
//     visible: {
//       transition: {
//         staggerChildren: 0.05,
//       },
//     },
//   };

//   return (
//     <Wrapper className={className}>
//       <motion.span
//         initial="hidden"
//         animate="visible"
//         variants={container}
//         viewport={{ once }}
//       >
//         {words.map((word, index) => (
//           <motion.span
//             key={index}
//             className="inline-block"
//             variants={animation}
//             transition={{
//               duration: 0.5,
//               ease: 'easeOut',
//             }}
//           >
//             {word}
//             {index !== words.length - 1 && ' '}
//           </motion.span>
//         ))}
//       </motion.span>
//     </Wrapper>
//   );
// };

import { motion } from 'framer-motion';

const defaultAnimations = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export const AnimatedText = ({
  text,
  el: Wrapper = 'p',
  className,
  once = true,
  animation = defaultAnimations,
}) => {
  const words = text.split(' ');

  const container = {
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  return (
    <Wrapper className={className}>
      <motion.span
        initial="hidden"
        animate="visible"
        variants={container}
        viewport={{ once }}
      >
        {words.map((word, index) => (
          <motion.span
            key={index}
            className="inline-block"
            variants={animation}
            transition={{
              duration: 0.5,
              ease: 'easeOut',
            }}
          >
            {word}
            {index !== words.length - 1 && ' '}
          </motion.span>
        ))}
      </motion.span>
    </Wrapper>
  );
};



