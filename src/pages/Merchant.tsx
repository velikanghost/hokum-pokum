import DataTable from './components/Table'
import { observer } from 'mobx-react-lite'
import { useContext, useEffect } from 'react'
import { StoreContext } from '@/mobx store/RootStore'
import MerchantNavbar from './components/Layouts/MerchantNavbar'

const Merchant = () => {
  const { merchantStore } = useContext(StoreContext)
  const {
    merchantEvmAccount,
    allMerchantOperations,
    merchantPendingOperations,
  } = merchantStore

  useEffect(() => {
    merchantStore.fetchAllOperations(merchantEvmAccount.address)
  }, [merchantEvmAccount])

  return (
    <div className="min-h-[100dvh] bg-[#1F2026]">
      <MerchantNavbar />
      <div className="container flex flex-col items-center justify-center flex-1 px-6 mx-auto mt-10 text-secondary lg:items-start">
        <div className="flex flex-col items-start justify-start w-full gap-6 md:items-center md:flex-row md:flex-wrap">
          <div className="border border-secondary rounded-[4px] p-6 min-w-[250px]">
            <h2 className="flex items-center justify-between text-base font-semibold">
              Total Transactions
            </h2>
            <p className="text-3xl font-medium">
              {allMerchantOperations.length}
            </p>
          </div>

          <div className="border border-secondary rounded-[4px] p-6 min-w-[250px]">
            <h2 className="flex items-center justify-between text-base font-semibold">
              Pending Transactions
            </h2>
            <p className="text-3xl font-medium">
              {merchantPendingOperations.length}
            </p>
          </div>

          <div className="border border-secondary rounded-[4px] p-6 min-w-[250px]">
            <h2 className="flex items-center justify-between text-base font-semibold">
              Complete Transactions
            </h2>
            <p className="text-3xl font-medium">
              {Math.abs(
                allMerchantOperations.length - merchantPendingOperations.length,
              )}
            </p>
          </div>
        </div>

        <div className="relative w-full mt-10">
          <h2 className="mb-3 text-xl font-semibold">Recent Payments</h2>
          <DataTable />
        </div>
      </div>
    </div>
  )
}

export default observer(Merchant)
