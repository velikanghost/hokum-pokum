import { Button } from '@/components/ui/button'
import { tokens } from '@/lib/data'
import { StoreContext } from '@/mobx store/RootStore'
import { JsonRpcSigner } from 'ethers'
import { observer } from 'mobx-react-lite'
import { useContext, useState } from 'react'
import { Tab } from './components/CheckoutComponent'
import { LoadingIcon } from './components/Icons/LoadingIcon'
import SelectToken from './components/SelectToken'
import { Token } from '@/lib/types/token'
import Navbar from './components/Layouts/Navbar'
import MerchantLayer from './components/MerchantLayer'
import UserLayer from './components/UserLayer'
import { Chain } from '@wormhole-foundation/sdk'
import { Link } from 'react-router-dom'
import { MdArrowOutward } from 'react-icons/md'

const Transfer = () => {
  const { connectStore } = useContext(StoreContext)
  const { transferAmount, bridgeComplete, transactionHash } = connectStore
  const [acct, setAcct] = useState<JsonRpcSigner>()
  const [activeTab, setActiveTab] = useState<Tab>('DEFAULT')
  const [userToken, setUserToken] = useState<Token>()
  const [merchantToken] = useState<Token>(tokens[2])
  const [merchantAmount] = useState<number>(5)
  const [chain] = useState<string>('Arbitrum Sepolia')

  const getAccount = async () => {
    await connectStore.connectWallet()
    const { userEvmAccount, userEvmAddress } = connectStore
    setAcct(userEvmAccount as any)
    connectStore.getUserTokensInWallet(
      userEvmAddress,
      userEvmAccount?.provider._network.name!,
    )
  }

  const beginTransfer = async () => {
    const chainFrom = connectStore.selectedChain.title.replace(/\s+/g, '')
    const chainTo = chain
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')

    await connectStore.bridgeViaRouter(
      chainFrom as Chain,
      chainTo as Chain,
      userToken?.address!,
      transferAmount,
      '0x0cf76957af81329917e7c29f8cbf9b8fad7842ce',
    )
  }

  return (
    <div className="h-[100vh] bg-[#1F2026]">
      <Navbar />
      <div className="flex">
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
              <MerchantLayer
                network={chain}
                token={merchantToken}
                amount={Number(merchantAmount)}
              />
            )}

            {activeTab === 'DEFAULT' && (
              <div className="checkout-card__body">
                {userToken ? (
                  <UserLayer
                    network={connectStore.selectedChain.title}
                    token={connectStore.selectedToken}
                    amount={Number(merchantAmount)}
                    price={connectStore.ethPrice}
                    setActiveTab={setActiveTab}
                  />
                ) : (
                  <div
                    className="my-3 token-swap-card select-token"
                    onClick={() => {
                      if (acct) {
                        setActiveTab('SELECT_TOKEN')
                      } else {
                        getAccount()
                      }
                    }}
                  >
                    <h4>You pay</h4>
                    <div className="pb-3 swap-area empty">
                      <span className="token-swap__text">
                        Select chain/ token
                      </span>
                    </div>
                    <div className="pt-3 fiat-area"></div>
                  </div>
                )}

                {!bridgeComplete && (
                  <div className="my-3 token-swap-card">
                    <h4>Send to merchant address</h4>
                    <div className="pb-3 swap-area">
                      <span className="token-swap__amount">
                        {`${'0x0cf76957af81329917e7c29f8cbf9b8fad7842ce'?.substring(
                          0,
                          6,
                        )}.......${'0x0cf76957af81329917e7c29f8cbf9b8fad7842ce'.substring(
                          36,
                        )}`}
                      </span>
                      <div className="token-image-details">
                        <img
                          src={`/images/chains/${chain
                            .split(' ')[0]
                            .toLowerCase()}.svg`}
                          alt="token"
                          className="network-image"
                          width={20}
                          height={20}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {bridgeComplete && (
                  <div className="my-3 bg-[#EBE8E2]/70 token-swap-card">
                    <p className="mb-3 text-2xl font-semibold text-secondary-foreground">
                      Payment complete
                    </p>
                    <Link
                      className="flex items-center gap-2"
                      target="_blank"
                      to={`https://wormholescan.io/#/tx/${transactionHash}?network=Testnet`}
                    >
                      View transaction details
                      <MdArrowOutward />
                    </Link>
                  </div>
                )}
                {bridgeComplete ? null : (
                  <Button
                    variant="nav"
                    className="w-full btn-primary"
                    onClick={() => (acct ? beginTransfer() : getAccount())}
                  >
                    {acct ? 'Checkout' : 'Connect Wallet'}
                  </Button>
                )}
              </div>
            )}
            {activeTab === 'SELECT_TOKEN' && (
              <SelectToken
                setActiveTab={setActiveTab}
                setToken={setUserToken}
                amount={merchantAmount}
              />
            )}
          </div>
          {connectStore.loading && (
            <div className="container-overlay">
              <LoadingIcon />
              <p>Please wait</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default observer(Transfer)
