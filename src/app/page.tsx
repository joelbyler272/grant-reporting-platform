import { Nav } from "@/components/landing/nav"
import { Hero } from "@/components/landing/hero"
import { SocialProof } from "@/components/landing/social-proof"
import { Problem } from "@/components/landing/problem"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Features } from "@/components/landing/features"
import Pricing from "@/components/landing/pricing"
import Difference from "@/components/landing/difference"
import FinalCta from "@/components/landing/final-cta"
import Footer from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <>
      <Nav />
      <Hero />
      <SocialProof />
      <Problem />
      <HowItWorks />
      <Features />
      <Pricing />
      <Difference />
      <FinalCta />
      <Footer />
    </>
  )
}
