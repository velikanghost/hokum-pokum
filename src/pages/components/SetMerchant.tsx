import { useContext, useState } from 'react'
import { BiLeftArrowAlt } from 'react-icons/bi'
import { StoreContext } from '@/mobx store/RootStore'
import { observer } from 'mobx-react-lite'
import { Tab } from '@/lib/types/all'
import { Button } from '@/components/ui/button'

interface SelectTokenProps {
  setActiveTab: (value: Tab) => void
}

const SetMerchant = ({ setActiveTab }: SelectTokenProps) => {
  const { connectStore } = useContext(StoreContext)
  const {
    merchantAmount,
    merchantAddress,
    setMerchantAmount,
    setMerchantAddress,
  } = connectStore

  const [data, setData] = useState({
    amt: merchantAmount,
    addr: merchantAddress,
  })

  const setMerchant = async () => {
    setMerchantAmount(data.amt)
    setMerchantAddress(data.addr)
    setActiveTab('DEFAULT')
  }

  return (
    <>
      <div className="mt-3 mb-4 pay-with-header">
        <BiLeftArrowAlt
          size={30}
          className="mr-auto"
          onClick={() => setActiveTab('DEFAULT')}
          style={{ cursor: 'pointer' }}
        />
      </div>
      <h3 className="mb-4 text-xl font-medium">Input either or both.</h3>
      <div className="flex flex-col">
        <label htmlFor="">Amount in USD</label>
        <input
          type="number"
          name="amount"
          className="px-4 py-3 mb-4 rounded-[8px] mt-2 text-secondary-foreground"
          placeholder="1"
          min={1}
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              amt: e.target.valueAsNumber,
            }))
          }
        />
        <label htmlFor="">Address</label>
        <input
          type="text"
          name="address"
          className="px-4 py-3 mb-3 rounded-[8px] mt-2 text-secondary-foreground"
          placeholder="Wallet address"
          onChange={(e) =>
            setData((prev) => ({
              ...prev,
              addr: e.target.value,
            }))
          }
        />
      </div>
      <Button
        className="w-full mt-6 rounded-[8px] p-6"
        variant="secondary"
        onClick={setMerchant}
      >
        Set Merchant
      </Button>
    </>
  )
}

export default observer(SetMerchant)
