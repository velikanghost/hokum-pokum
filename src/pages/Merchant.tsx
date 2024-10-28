import { BiDollarCircle } from 'react-icons/bi'
import Navbar from './components/Layouts/Navbar'

const Merchant = () => {
  return (
    <div className="h-[100vh] bg-[#1F2026]">
      <Navbar />
      <div className="container flex flex-col items-center justify-center flex-1 px-6 mx-auto text-secondary lg:items-start">
        <div className="flex items-center justify-start w-full gap-6">
          <div className="border border-lime-100 rounded-[8px]">
            <h2 className="flex items-center justify-between">
              Total Revenue <BiDollarCircle />
            </h2>
            <p>10000</p>
            <span>+20% from last month</span>
          </div>
          <div className="border border-lime-100 rounded-[8px]">
            <h2 className="flex items-center justify-between">
              Completed <BiDollarCircle />
            </h2>
            <p>10000</p>
            <span>+20% from last month</span>
          </div>
          <div className="border border-lime-100 rounded-[8px]">
            <h2 className="flex items-center justify-between">
              Finalized <BiDollarCircle />
            </h2>
            <p>10000</p>
            <span>+20% from last month</span>
          </div>
          {/* <div className="border border-lime-100">
            <h2 className="flex items-center justify-between">
              Total Revenue <BiDollarCircle />
            </h2>
            <p>10000</p>
            <span>+20% from last month</span>
          </div> */}
        </div>

        <div className="r">
          <h2>Recent Sales</h2>
        </div>
      </div>
    </div>
  )
}

export default Merchant
