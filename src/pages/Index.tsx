import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import MenuSection from '@/components/MenuSection';
import ReservationSection from '@/components/ReservationSection';
import ReviewsSection from '@/components/ReviewsSection';
import ContactSection from '@/components/ContactSection';
import CartDrawer from '@/components/CartDrawer';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <MenuSection />
      <ReservationSection />
      <ReviewsSection />
      <ContactSection />
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Index;
