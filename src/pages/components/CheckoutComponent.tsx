import { useContext, useState } from 'react'
import { Button } from '@/components/ui/button'
import { RiCheckDoubleFill } from 'react-icons/ri'
import SelectToken from './SelectToken'
import { Token } from '@/lib/types'
import { LoadingIcon } from './Icons/LoadingIcon'
import { StoreContext } from '@/mobx store/RootStore'
import { observer } from 'mobx-react-lite'

export type Tab = 'DEFAULT' | 'SELECT_TOKEN'

const CheckoutComponent = () => {
  const { connectStore } = useContext(StoreContext)
  const [activeTab, setActiveTab] = useState<Tab>('DEFAULT')
  const [userToken, setUserToken] = useState<Token>()

  return (
    <div
      className="flex flex-col items-center justify-center flex-1 checkout-container text-secondary lg:items-start"
      style={{ position: 'relative' }}
    >
      <div className="checkout-header font-headings">
        <img
          src="/images/logo.jpg"
          className="logo"
          width={100}
          height={100}
          alt="Logo"
        />

        <span>Pay with heekowave</span>
      </div>
      <div className="checkout-card">
        <div className="checkout-card__header">
          <h3 className="title">Checkout</h3>
        </div>
        {activeTab === 'DEFAULT' && (
          <>
            <div className="checkout-card__body">
              <Button variant="nav" className={`btn-primary w-full `}>
                <>
                  <span className="mr-3">Transaction Complete</span>
                  <RiCheckDoubleFill size={18} />
                </>
              </Button>
            </div>
            <div className="checkout-card__footer"></div>
          </>
        )}
        {activeTab === 'SELECT_TOKEN' && (
          <SelectToken
            setActiveTab={setActiveTab}
            setToken={setUserToken}
            amount={0}
          />
        )}
      </div>
      {connectStore.isAwaitingVAA && (
        <div className="container-overlay">
          <LoadingIcon />
          <p>Please wait</p>
        </div>
      )}
    </div>
  )
}

export default observer(CheckoutComponent)
