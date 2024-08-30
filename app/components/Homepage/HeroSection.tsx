'use client'

import { Button } from '@/components/ui/button'
import { CheckoutComponent } from '../CheckoutComponent'

export const HeroSection = () => {
  return (
    <section className="relative h-[100dvh] lg:h-[88dvh]">
      <div className="w-full lg:absolute lg:top-1/2 lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:-translate-y-1/2">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-20 pb-[60px] lg:pb-0">
          <div className="text-center lg:text-start flex-1">
            <h1 className="text-secondary drop-shadow-sm text-[40px] md:text-[60px] lg:text-[65px] leading-[120%] font-headings font-bold mb-6">
              Instant Transactions <br /> One Click, Any Chain.
            </h1>
            <p className="text-secondary drop-shadow-xl text-xl md:text-2xl mb-10 font-medium justify-center leading-[155%]">
              Experience Heekowave, A payment solution powered by Monad Layer-1
              blockchain, providing fast one-click transactions regardless of
              source and destination chains.
            </p>
            <div className="flex justify-center items-center lg:justify-start gap-4 md:gap-6">
              <Button
                variant="default"
                className=" btn-primary text-primary-foreground"
                onClick={() => console.log('click')}
              >
                Read our Blog
              </Button>
              <Button variant="nav" className="btn-primary">
                Stay In Touch
              </Button>
            </div>
          </div>

          <CheckoutComponent />
        </div>
      </div>
    </section>
  )
}
