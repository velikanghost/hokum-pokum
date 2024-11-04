import { makeAutoObservable } from 'mobx'
import { ethers, JsonRpcSigner } from 'ethers'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import {
  wormhole,
  signSendWait,
  Wormhole,
  Chain,
  routes,
  canonicalAddress,
} from '@wormhole-foundation/sdk'
import {
  MayanRouteMCTP,
  MayanRouteSWIFT,
  MayanRouteWH,
} from '@mayanfinance/wormhole-sdk-route'
import { EvmAddress } from '@wormhole-foundation/sdk-evm'
import evm from '@wormhole-foundation/sdk/evm'
import solana from '@wormhole-foundation/sdk/solana'
import { MetaMaskSigner, SolanaWalletSigner } from '@/lib/helpers/signer'
import { Chain as ChainType } from '@/lib/types/chain'
import { Token } from '@/lib/types'
import axios from 'axios'
import { Connection } from '@solana/web3.js'
import { UsdPrice } from '@/lib/types/all'
import { toast } from 'sonner'

type Account = {
  address: string
  provider: any
}

export class ConnectStore {
  userEvmAccount: Account = {
    address: '',
    provider: undefined,
  }
  userEvmAddress: string = ''
  solanaProvider: any = ''
  userSolanaAddress: string = ''
  userSolanaWallet: any = ''
  isAwaitingVAA: boolean = false
  isRedeemCompleted: boolean = false
  isInitiatingTransfer: boolean = false
  loading = false
  selectedToken: Token = {
    symbol: '',
    name: '',
    address: '',
  }
  selectedChain: ChainType = {
    title: '',
    explorer: '',
    icon: '',
  }
  merchantAmount: number = 5
  merchantAddress: string = '0x0cf76957AF81329917E7c29f8cbf9b8FAd7842ce'
  transferAmount: string = ''
  availableSourceTokens: Token[] = []
  userTokensInWallet: Token[] = []
  tokensInWallet: any[] = []
  availableDestinationTokens: string[] = []
  availableRoutes: any[] = []
  bestRouteQuote: any = {}
  initiateReceipt: any = {}
  finalReceipt: any = {}
  bridgeComplete: boolean = false
  transactionHash: string = ''
  usdPrice: UsdPrice = {
    usd: 0,
  }
  ethPrice: number = 0
  defaultPrice: number = 0
  defaultMerchantToken: string = ''
  defaultMerchantPrice: string = ''
  INFURA_API_KEY = import.meta.env.VITE_INFURA_API_KEY
  ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY
  ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY
  MORALIS_API_KEY = import.meta.env.VITE_MORALIS_API_KEY
  solanaConnection = new Connection('https://api.devnet.solana.com')

  chains = {
    OptimismSepolia: {
      rpc: `https://optimism-sepolia.infura.io/v3/${this.INFURA_API_KEY}`,
    },
    ArbitrumSepolia: {
      rpc: `https://arbitrum-sepolia.infura.io/v3/${this.INFURA_API_KEY}`,
    },
    BaseSepolia: {
      rpc: `https://base-sepolia.g.alchemy.com/v2/${this.ALCHEMY_API_KEY}`,
    },
    Sepolia: {
      rpc: `https://sepolia.infura.io/v3/${this.INFURA_API_KEY}`,
    },
    Solana: {
      rpc: `https://api.devnet.solana.com`,
    },
    Celo: {
      rpc: `https://celo-alfajores.infura.io/v3/${this.INFURA_API_KEY}`,
    },
    Avalanche: {
      rpc: `https://avalanche-fuji.infura.io/v3/${this.INFURA_API_KEY}`,
    },
  }

  priority = [
    'MayanRouteSWIFT',
    'MayanRouteMCTP',
    'MayanRouteWH',
    'AutomaticCCTPRoute',
    'AutomaticTokenBridgeRoute',
    'AutomaticPorticoRoute',
    'CCTPRoute',
    'TokenBridgeRoute',
  ]

  constructor() {
    makeAutoObservable(this)
  }

  isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined'
  }

  isPhantomInstalled = () => {
    return window.solana && window.solana.isPhantom
  }

  connectWallet = async () => {
    if (this.isMetaMaskInstalled()) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        const address = accounts[0]
        this.setUserEvmAddress(address)
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        this.setUserEvmAccount(signer)
        //console.log('Connected wallet address:', address)
      } catch (error: any) {
        console.error('Error connecting wallet:', error)
      }
    } else {
      console.log(
        'MetaMask is not installed. Please install it to use this dApp.',
      )
    }
  }

  connectSolanaWallet = async () => {
    if (this.isPhantomInstalled()) {
      try {
        const wallet = new PhantomWalletAdapter()
        await wallet.connect() // Connect to Phantom

        const userAddress = wallet.publicKey?.toString() || ''
        this.setUserSolanaAddress(userAddress)
        this.setUserSolanaWallet(wallet)
      } catch (error: any) {
        console.error('Error connecting wallet:', error)
      }
    } else {
      console.log(
        'MetaMask is not installed. Please install it to use this dApp.',
      )
    }
  }

  getChainIdByNetworkName = (networkName: string): string | undefined => {
    // Define a mapping of network names to chain IDs
    const networkChainIds: { [key: string]: string } = {
      Sepolia: '0xaa36a7',
      BaseSepolia: '0x14a34',
      OptimismSepolia: '0xaa37dc',
      ArbitrumSepolia: '0x66eee',
      Holesky: '0x4268',
      Avalanche: '0xa869',
      Celo: '0xaef3',
    }
    return networkChainIds[networkName] || undefined
  }

  switchNetwork = async (chainId: string) => {
    if (window.ethereum) {
      try {
        // Request to switch to a specific network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainId }], // Chain ID must be in hexadecimal
        })
        console.log('Network switched to', chainId)
      } catch (error: any) {
        console.error('Error switching network', error)
        // If the network has not been added to MetaMask

        if (error.code === 4902) {
          try {
            // Add the network (if it doesn't exist in MetaMask)
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: chainId,
                  rpcUrls: [
                    `https://base-sepolia.g.alchemy.com/v2/${this.ALCHEMY_API_KEY}`,
                  ], // RPC URL of the network
                  chainName: 'Base Sepolia Testnet', // Name of the network
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH', // Symbol of the currency (e.g., ETH for Ethereum)
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://base-sepolia.blockscout.com'], // Block explorer URL
                },
              ],
            })
          } catch (addError) {
            console.error('Error adding the network', addError)
          }
        } else {
          console.error('Error switching network', error)
        }
      }
    } else {
      console.error('MetaMask is not installed')
    }
  }

  redeemAndFinalize = async (recoverTxid: string, destinationChain: Chain) => {
    this.setIsAwaitingVAA(true)
    try {
      // EXAMPLE_WORMHOLE_INIT
      const wh = await wormhole('Testnet', [evm], {
        chains: {
          OptimismSepolia: {
            rpc: `https://optimism-sepolia.infura.io/v3/${this.INFURA_API_KEY}`,
          },
          ArbitrumSepolia: {
            rpc: `https://arbitrum-sepolia.infura.io/v3/${this.INFURA_API_KEY}`,
          },
          BaseSepolia: {
            rpc: `https://base-sepolia.g.alchemy.com/v2/${this.ALCHEMY_API_KEY}`,
          },
          Sepolia: {
            rpc: `https://sepolia.infura.io/v3/${this.INFURA_API_KEY}`,
          },
          Holesky: {
            rpc: `https://holesky.infura.io/v3/${this.INFURA_API_KEY}`,
          },
        },
      })

      const destination = wh.getChain(destinationChain)

      const destinationSigner = new MetaMaskSigner(
        this.userEvmAccount as JsonRpcSigner,
        destinationChain,
        this.userEvmAddress,
      )

      // Get the VAA from the wormhole message id
      const vaa = await wh.getVaa(
        recoverTxid,
        // Protocol:Payload name to use for decoding the VAA payload
        'TokenBridge:Transfer',
        // Timeout in milliseconds, depending on the chain and network, the VAA may take some time to be available
        60_000,
      )

      this.setIsAwaitingVAA(false)

      this.setLoading(true)
      // Now get the token bridge on the redeem side
      const rcvTb = await destination.getTokenBridge()

      // Create a transaction stream for redeeming
      const redeem = rcvTb.redeem(destinationSigner.address() as any, vaa!)

      // Sign and send the transaction
      const rcvTxids = await signSendWait(
        destination,
        redeem,
        destinationSigner,
      )
      console.log('redeemSent: ', rcvTxids)
      this.setLoading(false)

      // Now check if the transfer is completed according to
      // the destination token bridge
      const finished = await rcvTb.isTransferCompleted(vaa!)
      console.log('Transfer completed: ', finished)
      this.setIsRedeemCompleted(finished)
    } catch (error) {
      console.error(error)
      this.setLoading(false)
      this.setIsAwaitingVAA(false)
    }
  }

  selectRoute(routes: any) {
    const selectedRoute = this.priority.find((route) => routes.includes(route))
    return selectedRoute || null
  }

  bridgeViaRouter = async (
    source: Chain,
    destination: Chain,
    selectedToken: string,
    amount: string,
    destinationAddress: string,
  ) => {
    this.setLoading(true)
    // Get the current chain ID
    const currentChainId = await window.ethereum.request({
      method: 'eth_chainId',
    })

    const sourceChainId = this.getChainIdByNetworkName(source)

    // Check if we're not on Sepolia
    if (currentChainId !== sourceChainId) {
      console.log(`Not on ${source} , switching...`)

      // Attempt to switch to Sepolia
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: sourceChainId }],
      })
      console.log(`Successfully switched to ${source}`)
    } else {
      console.log('Already on required chain')
    }

    const wh = await wormhole('Testnet', [evm, solana], {
      chains: this.chains,
    })

    // Grab a ChainContext object from our configured Wormhole instance
    const ctx = wh.getChain(source)
    const rcv = wh.getChain(destination)

    let sender: MetaMaskSigner | SolanaWalletSigner

    if (source === 'Solana') {
      sender = new SolanaWalletSigner(
        this.solanaConnection,
        ctx.chain,
        this.userSolanaWallet,
        this.userSolanaAddress,
      )
    } else if (source === 'Avalanche') {
      sender = new MetaMaskSigner(
        this.userEvmAccount as JsonRpcSigner,
        ctx.chain,
        this.userEvmAddress,
        {
          maxFeePerGas: 25_000_000_000n,
          maxPriorityFeePerGas: 22_000_000_000n,
        },
      )
    } else {
      sender = new MetaMaskSigner(
        this.userEvmAccount as JsonRpcSigner,
        ctx.chain,
        this.userEvmAddress,
      )
    }

    const receiver = new MetaMaskSigner(
      this.userEvmAccount as JsonRpcSigner,
      rcv.chain,
      this.userEvmAddress,
    )

    // Create new resolver, passing the set of routes to consider
    const resolver = wh.resolver([
      routes.TokenBridgeRoute as any,
      routes.AutomaticTokenBridgeRoute,
      routes.CCTPRoute,
      routes.AutomaticCCTPRoute,
      routes.AutomaticPorticoRoute,
      MayanRouteMCTP,
      MayanRouteSWIFT,
      MayanRouteWH,
    ])

    const sendToken = Wormhole.tokenId(ctx.chain, selectedToken)

    // Given the send token, what can we possibly get on the destination chain?
    const destTokens = await resolver.supportedDestinationTokens(
      sendToken,
      ctx,
      rcv,
    )

    this.setAvailableDestinationTokens(
      destTokens.map((t) => canonicalAddress(t)),
    )

    //console.log(destTokens.map((t) => canonicalAddress(t)))

    const allFoundRoutesWithTr = await Promise.all(
      destTokens.map(async (destinationToken) => {
        const tr = await routes.RouteTransferRequest.create(wh, {
          source: sendToken,
          destination: destinationToken,
        })

        const foundRoutes = await resolver.findRoutes(tr)
        //console.log(`Found routes for destinationToken:`, foundRoutes)

        return foundRoutes.length ? { tr, foundRoutes } : null // Return { tr, foundRoutes } or null if no routes
      }),
    )

    // Filter out null values and flatten foundRoutes into a single-level array
    const nonEmptyResults = allFoundRoutesWithTr.filter(Boolean)
    const nonEmptyFoundRoutes = nonEmptyResults.flatMap(
      (result) => result?.foundRoutes,
    )
    const transferRequests = nonEmptyResults.map((result) => result?.tr)

    //console.log('All non-empty found routes:', nonEmptyFoundRoutes)
    //console.log('Associated transfer requests (tr):', transferRequests[0])

    this.setAvailableRoutes(nonEmptyFoundRoutes)

    const transferParams = { amount: amount, options: { nativeGas: 0 } }

    // Create an array to store the results
    const quotesArray: any = []
    let bestRoute: any
    let bestQuote: any
    let firstRoute

    // Iterate over the arr and make an API request for each token address
    const requests = nonEmptyFoundRoutes.map(async (route, index) => {
      try {
        // Save the first route as a fallback
        if (index === 0) firstRoute = route
        // Validate the transfer params passed, this returns a new type of ValidatedTransferParams
        // which (believe it or not) is a validated version of the input params
        // This new var must be passed to the next step, quote
        const validated = await route?.validate(
          transferRequests[0]!,
          transferParams,
        )
        if (!validated?.valid) throw validated?.error
        //console.log('Validated parameters: ', validated.params)

        // Get a quote for the transfer, this too returns a new type that must
        // be passed to the next step, execute (if you like the quote)
        const quote = await route?.quote(transferRequests[0]!, validated.params)
        if (!quote?.success) throw quote?.error

        //console.log('Best route quote: ', quote)
        quotesArray.push(quote)
        // Check if the quote has relayFee
        if (quote.relayFee) {
          bestRoute = route
        }
      } catch (error) {
        console.error(`Error :`, error)
      }
    })

    // Wait for all requests to complete
    await Promise.all(requests)

    // After requests, if no bestRoute with relayFee is found, set to the first route
    if (!bestRoute) {
      bestRoute = firstRoute
    }

    //console.log('quotesArr: ', quotesArray)

    bestQuote = quotesArray.filter((arr: any) => arr.relayFee)[0]

    if (!bestQuote) {
      bestQuote = quotesArray[0]
    }

    //console.log('bestRoute: ', bestRoute)
    //console.log('bestQuote: ', bestQuote)

    this.setBestRouteQuote(bestQuote)

    const merchantAddress = new EvmAddress(destinationAddress)

    //evm
    const receiverAddress = {
      chain: destination,
      address: merchantAddress,
    }

    if (!bestRoute) {
      this.setLoading(false)
      this.setBridgeComplete(false)
      toast('No route found for token selected.', {
        description: 'Support for all tokens coming soon.',
        duration: 3000,
        position: 'top-center',
      })
      return
    }

    // If you're sure you want to do this, set this to true
    const imSure = true
    if (bestRoute && imSure) {
      // Now the transfer may be initiated
      // A receipt will be returned, guess what you gotta do with that?

      try {
        const receipt = await bestRoute.initiate(
          transferRequests[0],
          sender,
          bestQuote,
          receiverAddress,
        )

        //console.log('Initiated transfer with receipt: ', receipt)
        this.setInitiateReceipt(receipt)
      } catch (error) {
        console.log(error)
        const hexValue = this.extractHexValue(error)
        if (hexValue?.match(/0x[0-9a-fA-F]{64}/)) {
          this.setTransactionHash(hexValue)
          setTimeout(() => {
            this.setBridgeComplete(true)
            this.setLoading(false)
          }, 5000)
        } else {
          console.log('No txid found.')
          console.log(hexValue)
          this.setLoading(false)
          this.setBridgeComplete(false)
          return
        }
      }

      // Kick off a wait log, if there is an opportunity to complete, this function will do it
      // See the implementation for how this works

      const finalReceipt = await routes.checkAndCompleteTransfer(
        bestRoute,
        this.initiateReceipt,
        receiver,
      )
      if (finalReceipt) {
        this.setFinalReceipt(finalReceipt)
        this.setTransactionHash(this.finalReceipt.originTxs[0].txid)
        this.setLoading(false)
        this.setBridgeComplete(true)
      }
    } else {
      //console.log('Not initiating transfer (set `imSure` to true to do so)')
      this.setLoading(false)
      this.setBridgeComplete(false)
    }
  }

  extractHexValue = (error: any) => {
    const hexRegex = /0x[0-9a-fA-F]{64}/

    // Convert the error to a string safely
    const errorMessage = String(error)

    // Check if error is an object with a JSON-RPC error format
    if (error && typeof error === 'object' && error.code && error.message) {
      // Handle the JSON-RPC error differently
      //console.log('Handling JSON-RPC error:', error.message)

      return 'JSON-RPC error' // Return or handle specific error info
    } else if (errorMessage.match(hexRegex)) {
      // If it's the simple error message, extract the hex value
      const match = errorMessage.match(hexRegex)
      return match ? match[0] : null // Return the matched hex value
    } else {
      console.log('Unhandled error format:', errorMessage)
      return null
    }
  }

  getUserTokensInWallet = async (publicAddress: string, chain: string) => {
    const tokensArray: Token[] = []
    let prefix: string
    if (chain === 'optimism-sepolia') {
      prefix = chain.split('-')[0].toLowerCase()
    } else {
      prefix = chain.split(' ')[0].toLowerCase()
    }

    const url = (prefix: string): string => {
      const networkNames: { [key: string]: string } = {
        base: `https://base-sepolia.blockscout.com/api/v2/addresses/${publicAddress}/token-balances`,
        sepolia: `https://eth-sepolia.blockscout.com/api/v2/addresses/${publicAddress}/token-balances`,
        optimism: `https://optimism-sepolia.blockscout.com/api/v2/addresses/${publicAddress}/token-balances`,
        arbitrum: `https://sepolia-explorer.arbitrum.io/address/${publicAddress}/token-balances`,
        avalanche: `https://glacier-api.avax.network/v1/chains/43113/addresses/${publicAddress}/balances:listErc20?pageSize=50&filterSpamTokens=true`,
        celo: `https://celo-alfajores.blockscout.com/api/v2/addresses/${publicAddress}/token-balances`,
      }
      return networkNames[prefix]
    }

    const nativeUrl = (prefix: string): string => {
      const networkNames: { [key: string]: string } = {
        base: `https://base-sepolia.blockscout.com/api/v2/addresses/${publicAddress}`,
        optimism: `https://optimism-sepolia.blockscout.com/api/v2/addresses/${publicAddress}`,
        arbitrum: `https://arbitrum.blockscout.com/api/v2/addresses/${publicAddress}`,
        avalanche: `https://glacier-api.avax.network/v1/chains/43113/addresses/${publicAddress}/balances:getNative`,
        sepolia: `https://eth-sepolia.blockscout.com/api/v2/addresses/${publicAddress}`,
        celo: `https://celo-alfajores.blockscout.com/api/v2/addresses/${publicAddress}`,
      }
      return networkNames[prefix]
    }

    try {
      const response = await fetch(url(prefix))
      const native = await fetch(nativeUrl(prefix))
      if (!response.ok) {
        throw new Error(`Failed to fetch data for ${publicAddress}`)
      }

      const data = await response.json()
      const nativeCurrency = await native.json()

      if (prefix === 'avalanche') {
        tokensArray.push({
          address: 'native',
          name: nativeCurrency.nativeTokenBalance.name,
          symbol: nativeCurrency.nativeTokenBalance.symbol,
          balance: nativeCurrency.nativeTokenBalance.balance,
          decimals: nativeCurrency.nativeTokenBalance.decimals,
          type: 'ERC-20',
        })
        data.erc20TokenBalances.forEach((d: any) => {
          const token = {
            address: d.address,
            name: d.name,
            symbol: d.symbol,
            balance: d.balance,
            decimals: d.decimals,
            type: d.ercType,
          }

          tokensArray.push(token)
        })
      } else if (prefix === 'celo') {
        tokensArray.push({
          address: 'native',
          name: 'Celo',
          symbol: 'CELO',
          balance: nativeCurrency.coin_balance,
          decimals: '18',
          type: 'ERC-20',
        })
        data.forEach((d: any) => {
          const token = {
            address: d.token.address,
            name: d.token.name,
            symbol: d.token.symbol,
            iconUrl: d.token.icon_url,
            balance: d.value,
            decimals: d.token.decimals,
            type: d.token.type,
          }

          tokensArray.push(token)
        })
      } else {
        tokensArray.push({
          address: 'native',
          name: 'Ethereum',
          symbol: 'ETH',
          balance: nativeCurrency.coin_balance,
          decimals: '18',
          type: 'ERC-20',
        })
        data.forEach((d: any) => {
          const token = {
            address: d.token.address,
            name: d.token.name,
            symbol: d.token.symbol,
            iconUrl: d.token.icon_url,
            balance: d.value,
            decimals: d.token.decimals,
            type: d.token.type,
          }

          tokensArray.push(token)
        })
      }

      this.setUserTokensInWallet(tokensArray)
    } catch (error) {
      console.error(`Error fetching token data for ${publicAddress}:`, error)
    }
  }

  getPrice = async (token: string) => {
    try {
      this.setLoading(true)
      if (token === 'eth' || token === 'weth') {
        const response = await axios.get(
          `https://api.etherscan.io/api?module=stats&action=ethprice&apikey=${this.ETHERSCAN_API_KEY}`,
        )
        this.setEthPrice(response.data?.result?.ethusd)
      } else {
        this.setEthPrice(1.01)
      }
      this.setLoading(false)
    } catch (error) {
      console.error(error)
      this.setLoading(false)
    }
  }

  getUsdPrice = async () => {
    //https://api.coingecko.com/api/v3/simple/price?ids=ethereum,ethereum,usd-coin,wrapped-bitcoin,tether,dai,binance-usd,matic-network,matic-network,ethereum,usd-coin,tether,binancecoin,binancecoin,usd-coin,avalanche-2,avalanche-2,usd-coin,tether,ethereum,fantom,fantom,usd-coin,celo,tether,moonbeam,moonbeam,solana,solana,usd-coin,tether,sui,aptos,ethereum,ethereum,usd-coin,tether,ethereum,ethereum,usd-coin,tether,ethereum,tether,ethereum,ethereum,usd-coin,tether,wrapped-steth,wrapped-steth,wrapped-steth,wrapped-steth,wrapped-steth,klay-token,wrapped-klay,pyth-network,ethereum,ethereum,ethereum,ethereum,okb,okb,mantle,mantle,tbtc,tbtc,tbtc,tbtc,tbtc,tbtc&vs_currencies=usd
    //https://price-api.mayan.finance/v3/tokens?chain=base
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum,ethereum,usd-coin,wrapped-bitcoin,tether,dai,binance-usd,matic-network,matic-network,ethereum,usd-coin,tether,binancecoin,binancecoin,usd-coin,avalanche-2,avalanche-2,usd-coin,tether,ethereum,fantom,fantom,usd-coin,celo,tether,moonbeam,moonbeam,solana,solana,usd-coin,tether,sui,aptos,ethereum,ethereum,usd-coin,tether,ethereum,ethereum,usd-coin,tether,ethereum,tether,ethereum,ethereum,usd-coin,tether,wrapped-steth,wrapped-steth,wrapped-steth,wrapped-steth,wrapped-steth,klay-token,wrapped-klay,pyth-network,ethereum,ethereum,ethereum,ethereum,okb,okb,mantle,mantle,tbtc,tbtc,tbtc,tbtc,tbtc,tbtc&vs_currencies=usd',
      )
      this.setUsdPrice(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  setTokensInWallet = (value: any) => {
    this.tokensInWallet = value
  }

  setMerchantAmount = (value: number) => {
    this.merchantAmount = value
  }

  setMerchantAddress = (value: string) => {
    this.merchantAddress = value
  }

  setUsdPrice = (value: UsdPrice) => {
    this.usdPrice = value
  }

  setUserEvmAccount = (data: JsonRpcSigner) => {
    this.userEvmAccount = data
  }

  setUserEvmAddress = (data: string) => {
    this.userEvmAddress = data
  }

  setUserSolanaAddress = (value: any) => {
    this.userSolanaAddress = value
  }

  setUserSolanaWallet = (value: any) => {
    this.userSolanaWallet = value
  }

  setAvailableSourceTokens = (value: Token[]) => {
    this.availableSourceTokens = value
  }

  setUserTokensInWallet = (value: Token[]) => {
    this.userTokensInWallet = value
  }

  setTransferAmmount = (value: string) => {
    this.transferAmount = value
  }

  setAvailableDestinationTokens = (value: string[]) => {
    this.availableDestinationTokens = value
  }

  setAvailableRoutes = (value: any[]) => {
    this.availableRoutes = value
  }

  setBestRouteQuote = (value: any) => {
    this.bestRouteQuote = value
  }

  setInitiateReceipt = (value: any) => {
    this.initiateReceipt = value
  }

  setFinalReceipt = (value: any) => {
    this.finalReceipt = value
  }

  setLoading = (val: boolean) => {
    this.loading = val
  }

  setBridgeComplete = (val: boolean) => {
    this.bridgeComplete = val
  }

  setTransactionHash = (value: string) => {
    this.transactionHash = value
  }

  setIsAwaitingVAA = (value: boolean) => {
    this.isAwaitingVAA = value
  }

  setIsRedeemCompleted = (value: boolean) => {
    this.isRedeemCompleted = value
  }

  setIsInitiatingTransfer = (value: boolean) => {
    this.isInitiatingTransfer = value
  }

  setSelectedToken = (token: Token) => {
    this.selectedToken = token
  }

  setSelectedChain = (chn: ChainType) => {
    this.selectedChain = chn
  }

  setEthPrice = (price: number) => {
    this.ethPrice = price
  }

  setDefaultPrice = (price: number) => {
    this.defaultPrice = price
  }

  setDefaultMerchantToken = (symbol: string) => {
    this.defaultMerchantToken = symbol
  }

  setDefaultMerchantPrice = (amount: string) => {
    this.defaultMerchantPrice = amount
  }
}
