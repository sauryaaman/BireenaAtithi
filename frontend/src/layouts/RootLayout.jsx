// import { Outlet } from 'react-router-dom';
// import { Header } from '../components/shared/Header';
// import { Footer } from '../components/shared/Footer';

// export const RootLayout = () => {
//   return (
//     <div className="flex min-h-screen flex-col bg-white">
//       <Header />
//       <main className="flex-grow bg-white">
//         <Outlet />
//       </main>
//       <Footer />
//     </div>
//   );
// };


import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { PageTransition } from '@/components/shared/PageTransition';
import { useLayoutEffect } from 'react';

export const RootLayout = () => {
  const location = useLocation();
  
  // Scroll to top on route change, using useLayoutEffect to ensure it happens before paint
  useLayoutEffect(() => {
    // Using requestAnimationFrame to ensure smooth transition
    const timeoutId = requestAnimationFrame(() => {
      window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(timeoutId);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <Header />
      <main className="flex-grow" style={{ width: '100%', margin: 0, padding: 0 }}>
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};
