// import { motion } from 'framer-motion';
// import { useNavigate } from 'react-router-dom';
// import { useEffect, useState } from 'react';
// import { Button } from '@/components/ui';
// import { Home } from 'lucide-react';

// export const NotFoundPage = () => {
//   const navigate = useNavigate();
//   const [secondsLeft, setSecondsLeft] = useState(7);
//   const [isRedirecting, setIsRedirecting] = useState(true);

//   useEffect(() => {
//     if (!isRedirecting) return;

//     // Only decrement secondsLeft inside the interval. Do NOT call navigate from
//     // inside the state updater function (that can cause updates to other
//     // components while rendering). We'll perform navigation from a separate
//     // effect when secondsLeft reaches 0.
//     const timer = setInterval(() => {
//       setSecondsLeft((prev) => Math.max(prev - 1, 0));
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [navigate, isRedirecting]);

//   // When secondsLeft reaches 0 and auto-redirect is still enabled, perform
//   // navigation here (outside the setState updater) to avoid React's warning
//   // about updating other components while rendering.
//   useEffect(() => {
//     if (isRedirecting && secondsLeft <= 0) {
//       setIsRedirecting(false);
//       navigate('/');
//     }
//   }, [secondsLeft, isRedirecting, navigate]);

//   const handleManualNavigation = (action) => {
//     setIsRedirecting(false); // Stop the auto-redirect
//     action();
//   };

//   return (
//     <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-primary/5 via-white to-primary/5">
//       {/* Animated background elements */}
//       <div className="absolute inset-0 overflow-hidden">
//         <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-5"></div>
//         {[...Array(5)].map((_, i) => (
//           <motion.div
//             key={i}
//             className="absolute h-64 w-64 rounded-full bg-primary/10"
//             initial={{ x: '-50%', y: '-50%' }}
//             animate={{
//               x: [
//                 `${Math.random() * 100}%`,
//                 `${Math.random() * 100}%`,
//                 `${Math.random() * 100}%`,
//               ],
//               y: [
//                 `${Math.random() * 100}%`,
//                 `${Math.random() * 100}%`,
//                 `${Math.random() * 100}%`,
//               ],
//             }}
//             transition={{
//               duration: 20,
//               repeat: Infinity,
//               repeatType: 'reverse',
//               ease: 'linear',
//               delay: i * 2,
//             }}
//             style={{ filter: 'blur(50px)' }}
//           />
//         ))}
//       </div>

//       <div className="container relative flex min-h-screen items-center justify-center">
//         <div className="text-center">
//           {/* 3D Animated 404 */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.5 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{
//               duration: 0.5,
//               ease: [0.43, 0.13, 0.23, 0.96],
//             }}
//             className="relative"
//           >
//             <motion.div
//               animate={{ rotateY: 360 }}
//               transition={{
//                 duration: 20,
//                 repeat: Infinity,
//                 ease: 'linear',
//               }}
//               className="perspective-1000"
//             >
//               <h1 className="text-[150px] font-black leading-none tracking-tighter text-primary sm:text-[200px] md:text-[250px]">
//                 404
//               </h1>
//             </motion.div>

//             {/* Text glitch effect */}
//             <motion.div
//               animate={{
//                 x: [-2, 2, -2],
//                 opacity: [0.5, 1, 0.5],
//               }}
//               transition={{
//                 duration: 2,
//                 repeat: Infinity,
//                 ease: 'linear',
//               }}
//               className="absolute inset-0 text-[150px] font-black leading-none tracking-tighter text-primary/30 sm:text-[200px] md:text-[250px]"
//             >
//               404
//             </motion.div>
//           </motion.div>

//           {/* Content */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="mt-8 space-y-6"
//           >
//             <h2 className="text-2xl font-bold text-dark sm:text-3xl">
//               Oops! Page Not Found
//             </h2>
//             <p className="mx-auto max-w-md text-dark/60">
//               The page you're looking for doesn't exist or has been moved. Let's
//               get you back on track!
//             </p>
//             <div className="flex justify-center gap-4">
//               <Button
//                 onClick={() => handleManualNavigation(() => navigate('/'))}
//                 className="group flex items-center gap-2"
//               >
//                 <Home className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
//                 Back to Home
//               </Button>
//               <Button
//                 onClick={() => handleManualNavigation(() => navigate(-1))}
//                 className="bg-dark/5 text-dark hover:bg-dark/10"
//               >
//                 Go Back
//               </Button>
//             </div>
//             {isRedirecting && (
//               <motion.p
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 className="mt-4 text-sm text-dark/60"
//               >
//                 Redirecting to home page in {secondsLeft} seconds...
//               </motion.p>
//             )}
//           </motion.div>

//           {/* Animated dots */}
//           <div className="mt-16 flex justify-center gap-3">
//             {[...Array(3)].map((_, i) => (
//               <motion.div
//                 key={i}
//                 className="h-3 w-3 rounded-full bg-primary"
//                 animate={{
//                   y: [-10, 0, -10],
//                   opacity: [0.5, 1, 0.5],
//                 }}
//                 transition={{
//                   duration: 1.5,
//                   repeat: Infinity,
//                   delay: i * 0.2,
//                 }}
//               />
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default NotFoundPage;



import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import { Home } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(7);
  const [isRedirecting, setIsRedirecting] = useState(true);

  useEffect(() => {
    if (!isRedirecting) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/');
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, isRedirecting]);

  const handleManualNavigation = (action) => {
    setIsRedirecting(false); // Stop the auto-redirect
    action();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Radial gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(14,165,233,0.15),transparent)]"></div>
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-[0.03]"></div>
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-96 w-96 rounded-full bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10"
            initial={{ x: '-50%', y: '-50%' }}
            animate={{
              x: [
                `${Math.random() * 100}%`,
                `${Math.random() * 100}%`,
                `${Math.random() * 100}%`,
              ],
              y: [
                `${Math.random() * 100}%`,
                `${Math.random() * 100}%`,
                `${Math.random() * 100}%`,
              ],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear',
              delay: i * 2,
            }}
            style={{ filter: 'blur(50px)' }}
          />
        ))}
      </div>

      <div className="container relative flex min-h-screen items-center justify-center">
        <div className="text-center">
          {/* 3D Animated 404 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              ease: [0.43, 0.13, 0.23, 0.96],
            }}
            className="relative"
          >
            <motion.div
              animate={{ rotateY: 360 }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="perspective-1000"
            >
              <h1 className="text-[150px] font-black leading-none tracking-tighter bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-gradient sm:text-[200px] md:text-[250px]">
                404
              </h1>
            </motion.div>

            {/* Text glitch effect */}
            <motion.div
              animate={{
                x: [-2, 2, -2],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
              className="absolute inset-0 text-[150px] font-black leading-none tracking-tighter text-slate-700 sm:text-[200px] md:text-[250px]"
            >
              404
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 space-y-6"
          >
            <h2 className="text-2xl font-bold text-slate-200 sm:text-3xl">
              Oops! Page Not Found
            </h2>
            <p className="mx-auto max-w-md text-slate-400">
              The page you're looking for doesn't exist or has been moved. Let's
              get you back on track!
            </p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => handleManualNavigation(() => navigate('/'))}
                className="group flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-slate-950"
              >
                <Home className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
                Back to Home
              </Button>
              <Button
                onClick={() => handleManualNavigation(() => navigate(-1))}
                className="bg-slate-800 text-slate-200 hover:bg-slate-700 ring-1 ring-slate-700/50"
              >
                Go Back
              </Button>
            </div>
            {isRedirecting && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-sm text-slate-400"
              >
                Redirecting to home page in {secondsLeft} seconds...
              </motion.p>
            )}
          </motion.div>

          {/* Animated dots */}
          <div className="mt-16 flex justify-center gap-3">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="h-3 w-3 rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"
                animate={{
                  y: [-10, 0, -10],
                  opacity: [0.5, 1, 0.5],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
