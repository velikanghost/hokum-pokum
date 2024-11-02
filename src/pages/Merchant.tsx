import { BiDollarCircle } from 'react-icons/bi'
import Navbar from './components/Layouts/Navbar'
import { DataTable } from './components/Table'

const Merchant = () => {
  return (
    <div className="h-[100vh] bg-[#1F2026]">
      <Navbar />
      <div className="container flex flex-col items-center justify-center flex-1 px-6 mx-auto mt-10 text-secondary lg:items-start">
        <div className="flex items-center justify-between w-full gap-6">
          <div className="border border-secondary rounded-[6px] p-6 min-w-[250px]">
            <h2 className="flex items-center justify-between text-base font-semibold">
              Total Income <BiDollarCircle />
            </h2>
            <p className="text-3xl font-medium">10000</p>
          </div>

          <div className="border border-secondary rounded-[6px] p-6 min-w-[250px]">
            <h2 className="flex items-center justify-between text-base font-semibold">
              All Payments
            </h2>
            <p className="text-3xl font-medium">10000</p>
          </div>

          <div className="border border-secondary rounded-[6px] p-6 min-w-[250px]">
            <h2 className="flex items-center justify-between text-base font-semibold">
              Pending Payments
            </h2>
            <p className="text-3xl font-medium">10000</p>
          </div>

          <div className="border border-secondary rounded-[6px] p-6 min-w-[250px]">
            <h2 className="flex items-center justify-between text-base font-semibold">
              Completed Payments
            </h2>
            <p className="text-3xl font-medium">10000</p>
          </div>
        </div>

        <div className="r">
          <h2>Recent Payments</h2>
          <DataTable />
        </div>
      </div>
    </div>
  )
}

export default Merchant
