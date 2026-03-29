import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import SocialProof from "@/components/landing/SocialProof";
import Problem from "@/components/landing/Problem";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import Pricing from "@/components/landing/Pricing";
import Difference from "@/components/landing/Difference";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <SocialProof />
        <Problem />
        <HowItWorks />
        <Features />
        <Pricing />
        <Difference />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
