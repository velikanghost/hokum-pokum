'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { RiWallet2Fill } from 'react-icons/ri'
import {
  SelectTokenChainCard,
  TokenSwapCard,
  WalletAddressCard,
} from '../components/TokenSwapCard'
import { SelectToken } from './SelectToken'

export type Tab = 'DEFAULT' | 'SELECT_TOKEN'

export const CheckoutComponent = () => {
  const [activeTab, setActiveTab] = useState<Tab>('DEFAULT')
  return (
    <div className="flex-1 checkout-container text-secondary">
      <div className="checkout-header font-headings">
        <Image
          className="logo"
          src={'/assets/logo.jpg'}
          width={100}
          height={100}
          alt="Logo"
        />
        <span>Pay with heekowave</span>
      </div>
      <div className="checkout-card">
        <div className="checkout-card__header">
          {/* <Button className="btn-secondary p-0 transparent ml-auto">
            <span className="mr-1">Connect Wallet</span>{' '}
            <RiWallet2Fill size={18} />
          </Button> */}
          <h3 className="title">Checkout</h3>
        </div>
        {activeTab === 'DEFAULT' && (
          <>
            <div className="checkout-card__body">
              <TokenSwapCard network={'Tron'} token={'TRX'} amount={100} />
              {/* <TokenSwapCard
              network={"Tron"}
              token={"DASH"}
              amount={30000}
              isPayCard
            /> */}
              <SelectTokenChainCard setActiveTab={setActiveTab} />
              <WalletAddressCard network={'Tron'} token={'DASH'} />
              <Button variant="nav" className="btn-primary w-full">
                <span className="mr-3">Connect Wallet</span>
                <RiWallet2Fill size={18} />
              </Button>
            </div>
            <div className="checkout-card__footer"></div>
          </>
        )}
        {activeTab === 'SELECT_TOKEN' && (
          <SelectToken setActiveTab={setActiveTab} />
        )}
      </div>
    </div>
  )
}
