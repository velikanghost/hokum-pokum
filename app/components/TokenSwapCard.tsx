import React from 'react'
import Image from 'next/image'
import { Tab } from './CheckoutComponent'

interface Props {
  network: string
  token: string
  amount: number
  isPayCard?: boolean
}

interface WalletAddressCardProps {
  network: string
  token: string
}

interface SelectTokenChainCardProps {
  setActiveTab: (value: Tab) => void
}

export const TokenSwapCard = ({ network, token, amount, isPayCard }: Props) => {
  return (
    <div className="token-swap-card my-3">
      {isPayCard && <h4>You pay</h4>}
      <div className="swap-area pb-3">
        <span className="token-swap__amount">{amount}</span>
        <div className="token-swap__details">
          <div className="token-image-details">
            <Image
              src={'/assets/trx.svg'}
              className="token-image"
              alt="token"
              width={40}
              height={40}
            />
            <Image
              src={'/assets/trx.svg'}
              className="network-image"
              alt="token"
              width={20}
              height={20}
            />
          </div>
          <div className="token-name-details">
            <div className="token-name">{token}</div>
            <div className="network-name">on {network}</div>
          </div>
        </div>
      </div>
      <div className="fiat-area pt-3">
        <span>
          ${100 * 0.159} USDT on {network}
        </span>
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
      <div className="fiat-area pt-3">
        {/* <span>$35,652 USDT on {network}</span> */}
      </div>
    </div>
  )
}

export const WalletAddressCard = ({
  network,
  token,
}: WalletAddressCardProps) => {
  return (
    <div className="token-swap-card my-3">
      <h4>Send to wallet address</h4>
      <div className="swap-area pb-3">
        <span className="token-swap__amount">0xEC2...4faF</span>
        <div className="token-swap__details">
          <div className="token-image-details">
            <Image
              src={'/assets/dash.svg'}
              className="token-image"
              alt="token"
              width={40}
              height={40}
            />
            <Image
              src={'/assets/trx.svg'}
              className="network-image"
              alt="token"
              width={20}
              height={20}
            />
          </div>
          <div className="token-name-details">
            <div className="token-name">{token}</div>
            <div className="network-name">on {network}</div>
          </div>
        </div>
      </div>
      {/* <div className="fiat-area pt-3">
        <span>$35,652 USDT on {network}</span>
      </div> */}
    </div>
  )
}
