import { Button } from '@/components/ui/button'
import { Token } from '@/lib/types'
import { StoreContext } from '@/mobx store/RootStore'
import { useContext, useEffect } from 'react'
import { Tab } from './CheckoutComponent'

interface Props {
  network: string
  token: Token
  amount: number
  setActiveTab?: (value: Tab) => void
  price: number
}

const UserLayer = ({ network, token, amount, setActiveTab, price }: Props) => {
  const { connectStore } = useContext(StoreContext)

  useEffect(() => {
    const fetch = async () => {
      await connectStore.getPrice(connectStore.defaultMerchantToken)
    }
    fetch()
  }, [connectStore.selectedToken.symbol])

  const getConversion = (
    amountInUsd: number,
    token: string,
    p: number,
  ): number => {
    let converted

    switch (token) {
      case 'eth':
        converted = amountInUsd
        break
      case 'weth':
        converted = amountInUsd
        break
      case 'usdt':
        converted = amountInUsd * p
        break
      case 'usdc':
        converted = amountInUsd * p
        break
      default:
        converted = amountInUsd
        break
    }
    return Number(converted.toFixed(2))
  }

  return (
    <div className="my-3 token-swap-card">
      <h4>You pay</h4>
      <div className="pb-3 swap-area">
        <span className="token-swap__amount">
          {getConversion(amount, token.symbol.toLowerCase(), price) || '--'}
        </span>

        <div className="token-swap__details">
          <div className="token-image-details">
            <img
              src={`/images/tokens/${token}`}
              alt="token"
              className="token-image"
              width={40}
              height={40}
            />
            <img
              src={`/images/chains/${token}`}
              alt="token"
              className="network-image"
              width={20}
              height={20}
            />
          </div>
          <div className="token-name-details">
            <div className="token-name">{token.name}</div>
            <div className="network-name">
              <span style={{ textTransform: 'capitalize' }}>{network}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 fiat-area">
        <p>
          ${getConversion(amount, 'usdt', price)} from{' '}
          <span style={{ textTransform: 'capitalize' }}>{network}</span>
        </p>
        <Button
          className="p-0 btn-secondary change-token-btn"
          style={{ padding: '8px 12px', borderRadius: '17px' }}
          onClick={() => setActiveTab && setActiveTab('SELECT_TOKEN')}
        >
          <span className="mr-1">Change token | chain</span>
        </Button>
      </div>
    </div>
  )
}

export default UserLayer
