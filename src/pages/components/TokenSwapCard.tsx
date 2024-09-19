import { Tab } from './CheckoutComponent'
import { Token } from '@/lib/types'
import { Button } from '@/components/ui/button'

interface Props {
  network: string
  token: Token
  amount: number
  isPayCard?: boolean
  setActiveTab?: (value: Tab) => void
  price: number
}

interface WalletAddressCardProps {
  network: string
  token: Token
  account: any
}

interface SelectTokenChainCardProps {
  setActiveTab: (value: Tab) => void
}

export const TokenSwapCard = ({
  network,
  token,
  amount,
  isPayCard,
  setActiveTab,
  price,
}: Props) => {
  const getConversion = (amountInUsd: number, token: string): number => {
    let converted

    switch (token) {
      case 'eth':
        converted = amountInUsd / price
        break
      case 'weth':
        converted = amountInUsd / price
        break
      case 'usdt':
        converted = amountInUsd
        break
      default:
        converted = amountInUsd
        break
    }
    return Number(converted.toFixed(3))
  }

  return (
    <div className="token-swap-card my-3">
      {isPayCard && <h4>You pay</h4>}
      <div className="swap-area pb-3">
        {isPayCard ? (
          <span className="token-swap__amount">
            {getConversion(amount, token.symbol.toLowerCase())}
          </span>
        ) : (
          <span className="token-swap__amount">
            {getConversion(amount, token.symbol.toLowerCase())}
          </span>
        )}

        <div className="token-swap__details">
          <div className="token-image-details">
            <img
              src={`/images/tokens/${token?.tokenIcon}`}
              alt="token"
              className="token-image"
              width={40}
              height={40}
            />
            <img
              src={`/images/chains/${token?.chainIcon}`}
              alt="token"
              className="network-image"
              width={20}
              height={20}
            />
          </div>
          <div className="token-name-details">
            <div className="token-name">{token.name}</div>
            <div className="network-name">
              on <span style={{ textTransform: 'capitalize' }}>{network}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="fiat-area flex justify-between items-center pt-3">
        <p>
          ${getConversion(amount, 'usdt')} on{' '}
          <span style={{ textTransform: 'capitalize' }}>{network}</span>
        </p>
        {isPayCard && (
          <Button
            className="btn-secondary p-0 change-token-btn"
            style={{ padding: '8px 12px', borderRadius: '17px' }}
            onClick={() => setActiveTab && setActiveTab('SELECT_TOKEN')}
          >
            <span className="mr-1">Change token | chain</span>
          </Button>
        )}
      </div>
    </div>
  )
}

export const SelectTokenChainCard = ({
  setActiveTab,
}: SelectTokenChainCardProps) => {
  return (
    <div
      className="token-swap-card my-3 select-token"
      onClick={() => setActiveTab('SELECT_TOKEN')}
    >
      <h4>You pay</h4>
      <div className="swap-area empty pb-3">
        <span className="token-swap__text">Select chain/ token</span>
      </div>
      <div className="fiat-area pt-3"></div>
    </div>
  )
}

export const WalletAddressCard = ({
  token,
  account,
}: WalletAddressCardProps) => {
  return (
    <div className="token-swap-card my-3">
      <h4>Send to wallet address</h4>
      <div className="swap-area pb-3">
        {account ? (
          <>
            <span className="token-swap__amount">
              {`${account?.address.substring(
                0,
                5,
              )}...${account?.address.substring(30)}`}
            </span>
            <div className="token-image-details">
              <img
                src={`/images/chains/${token?.chainIcon}`}
                alt="token"
                className="network-image"
                width={20}
                height={20}
              />
            </div>
          </>
        ) : (
          <span className="token-swap__amount">Recipient</span>
        )}
      </div>
    </div>
  )
}
