import { Token } from '@/lib/types'
import { StoreContext } from '@/mobx store/RootStore'
import { useContext, useEffect, useState } from 'react'

interface Props {
  network: string
  token: Token
  amount: number
}

const MerchantLayer = ({ network, token, amount }: Props) => {
  const { connectStore } = useContext(StoreContext)
  const [merchantPrice] = useState<number>(0)

  useEffect(() => {
    connectStore.setDefaultMerchantToken(token.symbol.toLowerCase())
  }, [token])

  const getConversion = (
    amountInUsd: number,
    token: string,
    p: number,
  ): number => {
    let converted

    switch (token) {
      case 'eth':
        converted = amountInUsd * p
        break
      case 'weth':
        converted = amountInUsd * p
        break
      case 'usdt':
        converted = amountInUsd
        break
      default:
        converted = amountInUsd
        break
    }
    return Number(converted.toFixed(2))
  }

  const conversionValue = getConversion(
    amount,
    token.symbol.toLowerCase(),
    merchantPrice,
  )

  return (
    <div className="my-3 token-swap-card">
      <div className="pb-3 swap-area">
        <span className="token-swap__amount">{amount || '--'}</span>

        <div className="token-swap__details">
          <div className="token-image-details">
            <img
              src={`/images/tokens/${token.symbol.toLowerCase()}.svg`}
              alt="token"
              className="token-image"
              width={40}
              height={40}
            />
            <img
              src={`/images/chains/${network.split(' ')[0].toLowerCase()}.svg`}
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
          ${conversionValue} to{' '}
          <span style={{ textTransform: 'capitalize' }}>{network}</span>
        </p>
      </div>
    </div>
  )
}

export default MerchantLayer
