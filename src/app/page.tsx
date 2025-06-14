import FallingImages from "@/components/FallingImages";
import HeroSlider from "@/components/HeroSlider";
import Services from "@/components/Services";
import WhyChoose from "@/components/WhyChoose";
import WhoWeAre from "@/components/WhoWeAre";
import OurBrands from "@/components/OurBrands";

export default function Home() {
  return (
    <main className="relative">
      <FallingImages /> {/* ✅ Falling PNGs only appear while scrolling */}
      <HeroSlider />
      <Services />
      <WhyChoose />
      <WhoWeAre />
      <OurBrands />
    </main>
  );
}
