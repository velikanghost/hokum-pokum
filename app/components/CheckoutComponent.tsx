'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { RiLogoutBoxFill, RiWallet2Fill } from 'react-icons/ri'
import {
  SelectTokenChainCard,
  TokenSwapCard,
  WalletAddressCard,
} from '../components/TokenSwapCard'
import { SelectToken } from './SelectToken'
import {
  AdapterState,
  WalletReadyState,
} from '@tronweb3/tronwallet-abstract-adapter'
import { TronLinkAdapter } from '@tronweb3/tronwallet-adapters'
import { Token } from '@/lib/types'
import {
  contractABI,
  contractAddress,
  tokens,
  recipientAddress,
} from '@/lib/data'
import { useConversion } from '@/hooks/useConversion'

export type Tab = 'DEFAULT' | 'SELECT_TOKEN'

export const CheckoutComponent = () => {
  const [activeTab, setActiveTab] = useState<Tab>('DEFAULT')
  const [readyState, setReadyState] = useState<AdapterState | WalletReadyState>(
    WalletReadyState.NotFound,
  )
  const [account, setAccount] = useState('')
  const [network, setNetwork] = useState<any>({})
  const [signedMessage, setSignedMessage] = useState('')
  const [merchantToken, setMerchantToken] = useState<Token>(tokens[1])
  const [merchantAmount, setMerchantAmount] = useState<number>(100)
  const [userToken, setUserToken] = useState<Token>()
  const { setTokenSymbol, tokenPrice } = useConversion()

  const adapter = useMemo(() => new TronLinkAdapter(), [])

  const swapAmount = useMemo(
    () => tokenPrice * merchantAmount,
    [merchantAmount, tokenPrice],
  )

  const runTransaction = useCallback(async () => {
    // Ensure tronWeb is initialized with the connected wallet
    const tronWeb = window.tronWeb

    // Check if the wallet is connected
    if (tronWeb && tronWeb.ready) {
      console.log('Tron web is ready')
      console.log('The network ', network)
      // The wallet is connected, proceed with contract interactions

      const contract = await tronWeb.contract(contractABI, contractAddress)

      // Reading data example
      const result = await contract.routerAddress().call()
      console.log('Router address:', result)

      // Writing data example
      try {
        const tronSwapAmount = tronWeb.toSun(swapAmount.toFixed(6))
        const response = await contract
          .inputSwap(merchantToken.address, tronSwapAmount, recipientAddress)
          .send({
            callValue: tronSwapAmount,
            shouldPollResponse: true, // Optional: waits for transaction confirmation
          })
        console.log('Transaction Response:', response)
      } catch (error) {
        console.error('Transaction failed:', error)
      }
    } else {
      console.error('TronWeb is not ready or wallet is not connected')
    }
  }, [network, swapAmount])

  useEffect(() => {
    setReadyState(adapter.state)
    setAccount(adapter.address!)

    adapter.on('connect', () => {
      setAccount(adapter.address!)
    })

    adapter.on('readyStateChanged', (state) => {
      setReadyState(state)
    })

    adapter.on('accountsChanged', (data) => {
      setAccount(data)
    })

    adapter.on('chainChanged', (data) => {
      setNetwork(data)
    })

    adapter.on('disconnect', () => {
      // when disconnect from wallet
    })
    return () => {
      // remove all listeners when components is destroyed
      adapter.removeAllListeners()
    }
  }, [adapter])

  useEffect(() => {
    if (userToken) {
      console.log('The user token called')
      setTokenSymbol(merchantToken.symbol)
    }
  }, [merchantToken.symbol, setTokenSymbol, userToken?.name])

  return (
    <div className="flex-1 checkout-container text-secondary flex flex-col justify-center items-center lg:items-start">
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
              <TokenSwapCard
                network={'Tron'}
                token={merchantToken}
                amount={merchantAmount}
              />
              {userToken ? (
                <TokenSwapCard
                  network={'Tron'}
                  token={userToken}
                  amount={Number(swapAmount.toFixed(6))}
                  setActiveTab={setActiveTab}
                  isPayCard
                />
              ) : (
                <SelectTokenChainCard setActiveTab={setActiveTab} />
              )}
              <WalletAddressCard
                network={'Tether'}
                token={merchantToken || tokens[0]}
              />
              <Button
                variant="nav"
                className="btn-primary w-full"
                // disabled={adapter.connected}
                onClick={() => (account ? runTransaction() : adapter.connect())}
              >
                <span className="mr-3">{account || 'Connect Wallet'}</span>
                {account ? (
                  <RiLogoutBoxFill size={18} />
                ) : (
                  <RiWallet2Fill size={18} />
                )}
              </Button>
            </div>
            <div className="checkout-card__footer"></div>
          </>
        )}
        {activeTab === 'SELECT_TOKEN' && (
          <SelectToken setActiveTab={setActiveTab} setToken={setUserToken} />
        )}
      </div>
    </div>
  )
}
