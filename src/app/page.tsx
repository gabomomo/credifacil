import { Hero } from "@/components/home/Hero";
import { TrustBar } from "@/components/home/TrustBar";
import { ProductGrid } from "@/components/home/ProductGrid";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Comparison } from "@/components/home/Comparison";
import { AdvisorBand } from "@/components/home/AdvisorBand";
import { Stats } from "@/components/home/Stats";
import { Testimonials } from "@/components/home/Testimonials";
import { Faq } from "@/components/home/Faq";
import { CtaBanner } from "@/components/home/CtaBanner";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <ProductGrid />
      <HowItWorks />
      <Comparison />
      <AdvisorBand />
      <Stats />
      <Testimonials />
      <Faq />
      <CtaBanner />
    </>
  );
}
