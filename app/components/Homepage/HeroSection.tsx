'use client'

import { Button } from '@/components/ui/button'

export const HeroSection = () => {
  return (
    <section className="relative h-[100dvh] md:h-[88dvh]">
      <div className="absolute top-0 w-full h-full bg-secondary-foreground opacity-5 rounded-[4px] md:rounded-xl"></div>
      <div className="h-full w-full rounded-[4px] md:rounded-xl"></div>
      <div className="w-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="grid place-items-center">
          <h1 className="text-secondary drop-shadow-sm text-[45px] md:text-[70px] leading-[120%] text-center font-headings font-bold mb-6">
            Instant Transactions <br /> One Click, Any Chain.
          </h1>
          <p className="md:w-[50%] text-secondary drop-shadow-xl text-xl md:text-2xl mb-10 text-center font-medium justify-center leading-[155%] font-body">
            Experience Heekowave, A payment solution powered by Monad Layer-1
            blockchain, providing fast one-click transactions regardless of
            source and destination chains.
          </p>
          <div className="flex gap-4 md:gap-6">
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
      </div>
    </section>
  )
}
