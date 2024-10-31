import { useContext, useEffect } from 'react'
import { BiLeftArrowAlt, BiSearchAlt } from 'react-icons/bi'
import { Token } from '@/lib/types'
import { Chain } from '@/lib/types/chain'
import { chains } from '@/lib/data/chains'
import { StoreContext } from '@/mobx store/RootStore'
import { observer } from 'mobx-react-lite'
import { Tab } from '@/lib/types/all'

interface SelectTokenProps {
  setActiveTab: (value: Tab) => void
  setToken?: (value: Token) => void
  amount: number
}

const SelectToken = ({ setActiveTab, setToken, amount }: SelectTokenProps) => {
  const { connectStore } = useContext(StoreContext)
  const { userTokensInWallet, userEvmAddress } = connectStore

  const getConversion = (amountInUsd: number, token: string): number => {
    let converted

    switch (token) {
      case 'eth':
        converted = amountInUsd / connectStore.ethPrice
        break
      case 'weth':
        converted = amountInUsd / connectStore.ethPrice
        break
      case 'usdt':
        converted = amountInUsd
        break
      default:
        converted = amountInUsd
        break
    }

    return Number(converted.toFixed(4))
  }

  useEffect(() => {
    connectStore.setSelectedChain(chains[0])
    connectStore.getUserTokensInWallet(userEvmAddress, chains[0].title)
  }, [])

  const selectUserToken = async (token: Token) => {
    if (setToken) setToken(token)
    await connectStore.getPrice(token.symbol.toLowerCase())
    connectStore.setSelectedToken(token as any)
    const amt = getConversion(amount, token.symbol.toLowerCase())
    connectStore.setTransferAmmount(amt.toString())
    setActiveTab('DEFAULT')
  }

  const handleChainSelect = (chn: Chain) => {
    connectStore.setSelectedChain(chn)
    connectStore.getUserTokensInWallet(userEvmAddress, chn.title)
  }

  const getBalance = (balance: string, decimals: string) => {
    return parseFloat(balance) / Math.pow(10, parseInt(decimals))
  }

  return (
    <>
      <div className="mt-3 mb-4 pay-with-header">
        <BiLeftArrowAlt
          size={30}
          className="mr-auto"
          onClick={() => setActiveTab('DEFAULT')}
          style={{ cursor: 'pointer' }}
        />
        <span className="mr-auto text-muted">Pay with</span>
      </div>
      <div className="mb-4 network-options">
        {chains.map((chn, i) => (
          <div
            key={i}
            onClick={() => handleChainSelect(chn)}
            className={
              connectStore.selectedChain.title === chn.title
                ? 'network active'
                : 'network'
            }
          >
            <img
              src={`/images/chains/${chn?.icon}`}
              alt="token"
              className="network-image"
              width={100}
              height={100}
            />
          </div>
        ))}
      </div>
      <div className="search-form">
        <input type="text" placeholder="Enter token name or address" />
        <BiSearchAlt size={30} />
      </div>
      <div className="mt-8 tokens-list">
        {userTokensInWallet?.map((token, i) => (
          <div
            className="token-details"
            key={i}
            onClick={() => selectUserToken(token)}
          >
            <img
              src={`/images/tokens/${token?.symbol?.toLowerCase()}.svg`}
              alt="token"
              className="token-image"
              width={100}
              height={100}
            />
            <div className="w-full">
              <div className="token-symbol">{token?.symbol}</div>
              <div className="token-name">{token?.name?.toUpperCase()}</div>
            </div>
            <div className="">
              {getBalance(token?.balance!, token?.decimals!)}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default observer(SelectToken)
