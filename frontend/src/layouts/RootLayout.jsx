import { Outlet } from 'react-router-dom';
import { Header } from '../components/shared/Header';
import { Footer } from '../components/shared/Footer';

export const RootLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-grow bg-white">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
