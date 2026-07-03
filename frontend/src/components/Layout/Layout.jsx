import Navbar from './Navbar';
import Footer from './Footer';
import ToastContainer from '../UI/Toast';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <main style={{ paddingTop: '56px' }} className="flex-grow">
        {children}
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}
