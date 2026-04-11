import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import Destinations from '@/components/Destinations';
import Categories from '@/components/Categories';
import WhyChoose from '@/components/WhyChoose';
import BookingPromo from '@/components/BookingPromo';
import Festivals from '@/components/Festivals';
import Testimonials from '@/components/Testimonials';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import AIAssistant from '@/components/AIAssistant';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Destinations />
      <Categories />
      <WhyChoose />
      <BookingPromo />
      <Festivals />
      <Testimonials />
      <CTA />
      <Footer />
      <AIAssistant />
    </main>
  );
}
