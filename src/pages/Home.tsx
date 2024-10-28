import { Button } from '@/components/ui/button'
import CheckoutComponent from './components/CheckoutComponent'
import Navbar from './components/Layouts/Navbar'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate()
  return (
    <>
      <section className="relative h-[100dvh] bg-[#1F2026]">
        <Navbar />
        <div className="container w-full mx-auto lg:absolute lg:top-1/2 lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:-translate-y-1/2">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-20 pb-[60px] lg:pb-0">
            <div className="flex-1 text-center lg:text-start">
              <h1 className="text-secondary drop-shadow-sm text-[40px] md:text-[60px] lg:text-[65px] leading-[120%] font-headings font-bold mb-6">
                Instant Transactions <br /> One Click, Any Chain.
              </h1>
              <p className="text-secondary drop-shadow-xl text-xl md:text-2xl mb-10 font-medium justify-center leading-[155%]">
                Experience Heekowave, A payment solution powered by Monad
                Layer-1 blockchain, providing fast one-click transactions
                regardless of source and destination chains.
              </p>
              <div className="flex items-center justify-center gap-4 lg:justify-start md:gap-6">
                <Button
                  variant="default"
                  className=" btn-primary text-primary-foreground"
                  onClick={() => console.log('click')}
                >
                  Read our Blog
                </Button>
                <Button
                  variant="nav"
                  className="btn-primary"
                  onClick={() => navigate('/demo')}
                >
                  Try Demo
                </Button>
              </div>
            </div>

            <CheckoutComponent />
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
