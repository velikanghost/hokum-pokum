import { useContext, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  RiCheckDoubleFill,
  RiLogoutBoxFill,
  RiWallet2Fill,
} from 'react-icons/ri'
import {
  SelectTokenChainCard,
  TokenSwapCard,
  WalletAddressCard,
} from '../components/TokenSwapCard'
import { SelectToken } from './SelectToken'
import { Token } from '@/lib/types'
import { tokens } from '@/lib/data'
import { useConversion } from '@/hooks/useConversion'
import { LoadingIcon } from './Icons/LoadingIcon'
import { JsonRpcSigner } from 'ethers'
import { StoreContext } from '@/mobx store/RootStore'
import { observer } from 'mobx-react-lite'

export type Tab = 'DEFAULT' | 'SELECT_TOKEN'

const CheckoutComponent = () => {
  const params = new URLSearchParams(window.location.search)
  const { connectStore } = useContext(StoreContext)
  const [acct, setAcct] = useState<JsonRpcSigner>()
  const [activeTab, setActiveTab] = useState<Tab>('DEFAULT')
  const [userToken, setUserToken] = useState<Token>()
  const [merchantToken, setMerChantToken] = useState<Token>(tokens[0])
  const [merchantAmount, setMerchantAmount] = useState<number>(0.003)
  const [chain, setChain] = useState<string>('Arbitrum Sepolia')
  const { setTokenSymbol } = useConversion()

  const waveAmount = params?.get('wa')
  const waveToken = params?.get('wt')
  const waveChain = params?.get('wc')

  const getAccount = async () => {
    await connectStore.connectWallet()
    const { account } = connectStore
    setAcct(account as any)
  }

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
      await connectStore.getPrice(waveToken!)
    }
    fetch()
  }, [])

  useEffect(() => {
    if (waveToken && waveAmount && waveChain) {
      const token: Token = {
        symbol: waveToken,
        name: getNetworkName(waveToken) as string,
        chainIcon: waveChain.slice(0, 3) + '.svg',
        tokenIcon: waveToken + '.svg',
      }

      const chain = waveChain.split('_')
      const amount = waveAmount.split('_')[0]

      setMerChantToken(token)
      setChain(`${chain[0]} ${chain[1]}`)
      setMerchantAmount(Number(amount))
    }
  }, [connectStore.ethPrice])

  const beginTransfer = async () => {
    await connectStore.bridgeToken('BaseSepolia', 'ArbitrumSepolia')
  }

  useEffect(() => {
    if (userToken) {
      setTokenSymbol(merchantToken.symbol)
    }
  }, [merchantToken.symbol, setTokenSymbol, userToken?.name])

  return (
    <div
      className="flex-1 checkout-container text-secondary flex flex-col justify-center items-center lg:items-start"
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
              <TokenSwapCard
                network={chain}
                token={merchantToken}
                amount={merchantAmount}
                price={connectStore.ethPrice}
              />
              {userToken ? (
                <TokenSwapCard
                  network={connectStore.selectedChain.title}
                  token={connectStore.selectedToken}
                  amount={Number(merchantAmount)}
                  price={connectStore.ethPrice}
                  setActiveTab={setActiveTab}
                  isPayCard
                />
              ) : (
                <SelectTokenChainCard setActiveTab={setActiveTab} />
              )}
              <WalletAddressCard
                account={acct}
                network={'Arb Sepolia'}
                token={merchantToken || tokens[0]}
              />
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
            </div>
            <div className="checkout-card__footer"></div>
          </>
        )}
        {activeTab === 'SELECT_TOKEN' && (
          <SelectToken setActiveTab={setActiveTab} setToken={setUserToken} />
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
