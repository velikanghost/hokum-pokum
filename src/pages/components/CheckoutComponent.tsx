import { useContext, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  RiCheckDoubleFill,
  RiLogoutBoxFill,
  RiWallet2Fill,
} from 'react-icons/ri'
import SelectToken from './SelectToken'
import { Token } from '@/lib/types'
import { tokens } from '@/lib/data'
import { LoadingIcon } from './Icons/LoadingIcon'
import { JsonRpcSigner } from 'ethers'
import { StoreContext } from '@/mobx store/RootStore'
import { observer } from 'mobx-react-lite'
import { Chain } from '@wormhole-foundation/sdk'
import { toJS } from 'mobx'

export type Tab = 'DEFAULT' | 'SELECT_TOKEN'

const CheckoutComponent = () => {
  const params = new URLSearchParams(window.location.search)
  const { connectStore } = useContext(StoreContext)
  const { userSolanaAddress, userSolanaWallet } = connectStore
  const [acct, setAcct] = useState<JsonRpcSigner>()
  const [activeTab, setActiveTab] = useState<Tab>('DEFAULT')
  const [userToken, setUserToken] = useState<Token>()
  const [merchantToken, setMerChantToken] = useState<Token>(tokens[0])
  const [merchantAmount, setMerchantAmount] = useState<number>(0.003)
  const [chain, setChain] = useState<string>('Arbitrum Sepolia')

  const waveAmount = params?.get('wa')
  const waveToken = params?.get('wt')
  const waveChain = params?.get('wc')

  const getAccount = async () => {
    await connectStore.connectWallet()
    const { userEvmAccount } = connectStore
    setAcct(userEvmAccount as any)
  }

  const getSolanaAccount = async () => {
    await connectStore.connectSolanaWallet()
  }

  console.log(toJS(userSolanaAddress))
  console.log(toJS(userSolanaWallet))

  const getNetworkName = (name: string): string | undefined => {
    const networkNames: { [key: string]: string } = {
      eth: 'Ethereum',
      usdc: 'USDC',
      usdt: 'USDT',
    }
    return networkNames[name] || undefined
  }

  useEffect(() => {
    const fetch = async () => {
      await connectStore.getPrice(
        connectStore.selectedToken.symbol.toLowerCase() || waveToken!,
      )
    }
    fetch()
  }, [connectStore.selectedToken.symbol])

  useEffect(() => {
    if (waveToken && waveAmount && waveChain) {
      const token: Token = {
        symbol: waveToken,
        name: getNetworkName(waveToken) as string,
        chainIcon: waveChain.includes('base')
          ? waveChain.slice(0, 4).trimEnd() + '.svg'
          : waveChain.slice(0, 3).trimEnd() + '.svg',
        tokenIcon: waveToken + '.svg',
      }

      const chain = waveChain.split('_')
      const amount = waveAmount.split('_')[0]

      setMerChantToken(token)
      setChain(`${chain[0]} ${chain[1] || ' '}`)
      setMerchantAmount(Number(amount))
    }
  }, [connectStore.ethPrice])

  const beginTransfer = async () => {
    const chainFrom = connectStore.selectedChain.title.replace(/\s+/g, '')
    const chainTo = chain
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')
    await connectStore.bridgeViaRouter(
      'Avalanche',
      'OptimismSepolia',
      'native',
      merchantAmount.toString(),
    )
    //await connectStore.bridgeToken('Solana', 'ArbitrumSepolia')
  }

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
              <Button
                variant="nav"
                className={`btn-primary w-full `}
                onClick={() => (acct ? beginTransfer() : getAccount())}
              >
                {connectStore.isRedeemCompleted ? (
                  <>
                    <span className="mr-3">Transaction Complete</span>
                    <RiCheckDoubleFill size={18} />
                  </>
                ) : (
                  <>
                    {userToken ? (
                      <span className="mr-3">Checkout</span>
                    ) : (
                      <span className="mr-3">
                        {(acct && acct.address) || 'Connect Wallet'}
                      </span>
                    )}
                    {acct && !userToken ? (
                      <RiLogoutBoxFill size={18} />
                    ) : (
                      <RiWallet2Fill size={18} />
                    )}
                  </>
                )}
              </Button>

              {/* for solana */}
              <Button
                variant="nav"
                className={`btn-primary w-full mt-4`}
                onClick={() =>
                  userSolanaWallet ? beginTransfer() : getSolanaAccount()
                }
              >
                <>
                  {userToken ? (
                    <span className="mr-3">Checkout</span>
                  ) : (
                    <span className="mr-3">
                      {(userSolanaAddress && userSolanaAddress) ||
                        'Connect Solana'}
                    </span>
                  )}
                  {acct && !userToken ? (
                    <RiLogoutBoxFill size={18} />
                  ) : (
                    <RiWallet2Fill size={18} />
                  )}
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
            amount={merchantAmount}
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
