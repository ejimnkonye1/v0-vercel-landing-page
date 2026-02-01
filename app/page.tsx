import { StarfieldBackground } from '@/components/StarfieldBackground'
import { Navbar } from '@/components/Navbar'
import { Hero } from '@/components/Hero'
import { HowItWorks } from '@/components/HowItWorks'
import { BentoGrid } from '@/components/BentoGrid'
import { DashboardPreview } from '@/components/DashboardPreview'
import { Stats } from '@/components/Stats'
import { CTA } from '@/components/CTA'
import { Footer } from '@/components/Footer'

export default function Home() {
  return (
    <>
      <StarfieldBackground />
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <BentoGrid />
        <DashboardPreview />
        <Stats />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
