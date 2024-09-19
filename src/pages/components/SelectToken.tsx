import { useContext, useState } from 'react'
import { Tab } from './CheckoutComponent'
import { BiLeftArrowAlt, BiSearchAlt } from 'react-icons/bi'
import { Token } from '@/lib/types'
import { Chain } from '@/lib/types/chain'
import { chains } from '@/lib/data/chains'
import { StoreContext } from '@/mobx store/RootStore'

interface SelectTokenProps {
  setActiveTab: (value: Tab) => void
  setToken?: (value: Token) => void
}

export const SelectToken = ({ setActiveTab, setToken }: SelectTokenProps) => {
  const { connectStore } = useContext(StoreContext)
  const [tokens, setTokens] = useState<Token[]>()

  const selectUserToken = (token: Token) => {
    if (setToken) setToken(token)
    connectStore.setSelectedToken(token)
    setActiveTab('DEFAULT')
  }

  const handleChainSelect = (chn: Chain) => {
    connectStore.setSelectedChain(chn)
    setTokens(chn.tokens)
  }

  return (
    <>
      <div className="pay-with-header mt-3 mb-4">
        <BiLeftArrowAlt
          size={30}
          className="mr-auto"
          onClick={() => setActiveTab('DEFAULT')}
          style={{ cursor: 'pointer' }}
        />
        <span className="mr-auto text-muted">Pay with</span>
      </div>
      <div className="network-options mb-4">
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
      <div className="tokens-list mt-8">
        {tokens?.map((token, i) => (
          <div
            className="token-details"
            key={i}
            onClick={() => selectUserToken(token)}
          >
            <img
              src={`/images/tokens/${token?.tokenIcon}`}
              alt="token"
              className="token-image"
              width={100}
              height={100}
            />
            <div className="w-full">
              <div className="token-symbol">{token.symbol}</div>
              <div className="token-name">{token.name.toUpperCase()}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
