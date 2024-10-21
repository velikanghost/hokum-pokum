import { makeAutoObservable } from 'mobx'
import { ethers, JsonRpcSigner } from 'ethers'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import {
  wormhole,
  signSendWait,
  Wormhole,
  amount,
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
import { SolanaAddress } from '@wormhole-foundation/sdk-solana'
import evm from '@wormhole-foundation/sdk/evm'
import solana from '@wormhole-foundation/sdk/solana'
import { MetaMaskSigner, SolanaWalletSigner } from '@/lib/helpers/signer'
import { Chain as ChainType } from '@/lib/types/chain'
import { Token } from '@/lib/types'
import axios from 'axios'
import { Connection } from '@solana/web3.js'
import { Buffer } from 'buffer'

// Ensure Buffer is available globally
if (!window.Buffer) {
  window.Buffer = Buffer
}

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
  availableSourceTokens: Token[] = []
  userTokensInWallet: Token[] = []
  ethPrice: number = 0
  defaultPrice: number = 0
  defaultMerchantToken: string = ''
  defaultMerchantPrice: string = ''
  INFURA_API_KEY = import.meta.env.VITE_INFURA_API_KEY
  ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY
  ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY
  solanaConnection = new Connection('https://api.devnet.solana.com')

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
        console.log('Connected wallet address:', address)
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

  // Function to get chainId by network name
  getChainIdByNetworkName = (networkName: string): string | undefined => {
    // Define a mapping of network names to chain IDs
    const networkChainIds: { [key: string]: string } = {
      Sepolia: '0xaa36a7',
      BaseSepolia: '0x14a34',
      OptimismSepolia: '0xaa37dc',
      ArbitrumSepolia: '0x66eee',
      Holesky: '0x4268',
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

  bridgeToken = async (source: Chain, destination: Chain) => {
    // // Get the current chain ID
    // const currentChainId = await window.ethereum.request({
    //   method: 'eth_chainId',
    // })

    // const sourceChainId = this.getChainIdByNetworkName(source)

    // // Check if we're not on Sepolia
    // if (currentChainId !== sourceChainId) {
    //   console.log(`Not on ${source} , switching...`)

    //   // Attempt to switch to Sepolia
    //   await window.ethereum.request({
    //     method: 'wallet_switchEthereumChain',
    //     params: [{ chainId: sourceChainId }],
    //   })
    //   console.log(`Successfully switched to ${source}`)
    // } else {
    //   console.log('Already on Sepolia')
    // }

    this.setIsInitiatingTransfer(true)
    try {
      // EXAMPLE_WORMHOLE_INIT
      const wh = await wormhole('Testnet', [evm, solana], {
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
          Solana: {
            rpc: `https://api.devnet.solana.com`,
          },
        },
      })
      // EXAMPLE_WORMHOLE_INIT

      // Grab a ChainContext object from our configured Wormhole instance
      const ctx = wh.getChain(source)
      const rcv = wh.getChain(destination)

      // const sender = new MetaMaskSigner(
      //   this.account as JsonRpcSigner,
      //   ctx.chain,
      //   this.address,
      // )

      const sender = new SolanaWalletSigner(
        this.solanaConnection,
        ctx.chain,
        this.userSolanaWallet,
        this.userSolanaAddress,
      )

      const receiver = new MetaMaskSigner(
        this.userEvmAccount as JsonRpcSigner,
        rcv.chain,
        this.userEvmAddress,
      )

      // Get a Token Bridge contract client on the source
      const sndTb = await ctx.getTokenBridge()

      // Send the native token of the source chain
      const tokenId = Wormhole.tokenId(ctx.chain, 'native')

      // bigint amount using `amount` module
      const amt = amount.units(
        amount.parse('0.01', ctx.config.nativeTokenDecimals),
      )

      const receiverAdd = new EvmAddress(
        '0x2Cab74bdB5c0Eb9E63a03bc9D448A92A201d7C88',
      )

      const senderAddress = new SolanaAddress(this.userSolanaAddress)

      const receiverAddress = {
        chain: destination,
        address: receiverAdd,
      }
      // Create a transaction stream for transfers
      const transfer = sndTb.transfer(
        senderAddress,
        receiverAddress as any,
        tokenId.address,
        amt,
      )

      // Sign and send the transaction
      const txids = await signSendWait(ctx, transfer, sender)

      console.log('sourceSent: ', txids)

      // Get the wormhole message id from the transaction
      //const [whm] = await ctx.parseTransaction(txids[txids.length - 1]!.txid)
      const [whm] = await ctx.parseTransaction(txids[0]!.txid)
      console.log('Wormhole Messages: ', whm)
      this.setIsInitiatingTransfer(false)

      this.setIsAwaitingVAA(true)
      setTimeout(async () => {
        // EXAMPLE_WORMHOLE_VAA
        // Get the VAA from the wormhole message id
        // if (!whm) {
        //   console.log('wormhole message not found')
        //   this.setIsAwaitingVAA(false)
        //   return
        // }
        const vaa = await wh.getVaa(
          // Wormhole Message ID
          whm! || txids[0].txid,
          // Protocol:Payload name to use for decoding the VAA payload
          'TokenBridge:Transfer',
          // Timeout in milliseconds, depending on the chain and network, the VAA may take some time to be available
          60_000,
        )
        this.setIsAwaitingVAA(false)

        // EXAMPLE_WORMHOLE_VAA
        this.setLoading(true)
        // Now get the token bridge on the redeem side
        const rcvTb = await rcv.getTokenBridge()

        // Create a transaction stream for redeeming
        const redeem = rcvTb.redeem(receiver.userAddress as any, vaa!)
        console.log('redeeming: ', redeem)

        // Sign and send the transaction
        const rcvTxids = await signSendWait(rcv, redeem, receiver)
        console.log('redeemSent: ', rcvTxids)

        this.setLoading(false)

        // Now check if the transfer is completed according to
        // the destination token bridge
        const finished = await rcvTb.isTransferCompleted(vaa!)
        console.log('Transfer completed: ', finished)
        this.setIsRedeemCompleted(finished)
      }, 1200000)
    } catch (error) {
      console.error(error)
      this.setIsInitiatingTransfer(false)
      this.setIsAwaitingVAA(false)
      this.setLoading(false)
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

  bridgeViaRouter = async (
    source: Chain,
    destination: Chain,
    selectedToken: string,
    amount: string,
  ) => {
    const wh = await wormhole('Testnet', [evm, solana], {
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
        Solana: {
          rpc: `https://api.devnet.solana.com`,
        },
        Bsc: {
          rpc: `https://bsc-testnet.infura.io/v3/${this.INFURA_API_KEY}`,
        },
        Celo: {
          rpc: `https://celo-alfajores.infura.io/v3/${this.INFURA_API_KEY}`,
        },
        Avalanche: {
          rpc: `https://avalanche-fuji.infura.io/v3/${this.INFURA_API_KEY}`,
        },
      },
    })

    // Grab a ChainContext object from our configured Wormhole instance
    const ctx = wh.getChain(source)
    const rcv = wh.getChain(destination)

    //evm
    const sender = new MetaMaskSigner(
      this.userEvmAccount as JsonRpcSigner,
      ctx.chain,
      this.userEvmAddress,
    )

    //solana
    // const sender = new SolanaWalletSigner(
    //   this.solanaConnection,
    //   ctx.chain,
    //   this.userSolanaWallet,
    //   this.userSolanaAddress,
    // )

    const receiver = new MetaMaskSigner(
      this.userEvmAccount as JsonRpcSigner,
      rcv.chain,
      this.userEvmAddress,
    )

    // Create new resolver, passing the set of routes to consider
    const resolver = wh.resolver([
      routes.TokenBridgeRoute,
      routes.AutomaticTokenBridgeRoute,
      routes.CCTPRoute,
      routes.AutomaticCCTPRoute,
      routes.AutomaticPorticoRoute,
      MayanRouteMCTP,
      MayanRouteSWIFT,
      MayanRouteWH,
    ])

    // What tokens are available on the source chain?
    const srcTokens = await resolver.supportedSourceTokens(ctx)

    console.log('Allowed source tokens array: ', srcTokens)

    console.log(
      'Allowed source tokens: ',
      srcTokens.map((t) => canonicalAddress(t)),
    )

    const sendToken = Wormhole.tokenId(ctx.chain, selectedToken)

    //avax usdc
    // const sendToken = Wormhole.tokenId(
    //   ctx.chain,
    //   '0x5425890298aed601595a70AB815c96711a31Bc65',
    // )

    // Given the send token, what can we possibly get on the destination chain?
    const destTokens = await resolver.supportedDestinationTokens(
      sendToken,
      ctx,
      rcv,
    )
    //console.log('Receivable tokens array: ', srcTokens)
    console.log(
      'For the given source token and routes configured, the following tokens may be receivable: ',
      destTokens.map((t) => canonicalAddress(t)),
    )
    // Grab the first one for the example
    const destinationToken = destTokens[0]!

    // Creating a transfer request fetches token details
    // Since all routes will need to know about the tokens
    const tr = await routes.RouteTransferRequest.create(wh, {
      source: sendToken,
      destination: destinationToken,
    })

    // Resolve the transfer request to a set of routes that can perform it
    const foundRoutes = await resolver.findRoutes(tr)
    console.log(
      'For the transfer parameters, we found these routes: ',
      foundRoutes,
    )

    const bestRoute = foundRoutes[0]!
    console.log('Selected: ', bestRoute)

    console.log(
      'This route offers the following default options',
      bestRoute.getDefaultOptions(),
    )

    // Specify the amount as a decimal string
    // const amt = '2'
    // Create the transfer params for this request
    const transferParams = { amount: amount, options: { nativeGas: 0 } }

    // Validate the transfer params passed, this returns a new type of ValidatedTransferParams
    // which (believe it or not) is a validated version of the input params
    // This new var must be passed to the next step, quote
    const validated = await bestRoute.validate(tr, transferParams)
    if (!validated.valid) throw validated.error
    console.log('Validated parameters: ', validated.params)

    // Get a quote for the transfer, this too returns a new type that must
    // be passed to the next step, execute (if you like the quote)
    const quote = await bestRoute.quote(tr, validated.params)
    if (!quote.success) throw quote.error
    console.log('Best route quote: ', quote)

    const merchantAddress = new EvmAddress(
      '0x2Cab74bdB5c0Eb9E63a03bc9D448A92A201d7C88',
    )

    //evm
    const receiverAddress = {
      chain: destination,
      address: merchantAddress,
    }

    // If you're sure you want to do this, set this to true
    const imSure = false
    if (imSure) {
      // Now the transfer may be initiated
      // A receipt will be returned, guess what you gotta do with that?
      console.log('intiator val: ', { tr, sender, quote, receiverAddress })
      const receipt = await bestRoute.initiate(
        tr,
        sender,
        quote,
        receiverAddress,
      )
      console.log('Initiated transfer with receipt: ', receipt)

      // Kick off a wait log, if there is an opportunity to complete, this function will do it
      // See the implementation for how this works
      await routes.checkAndCompleteTransfer(bestRoute, receipt, receiver)
    } else {
      console.log('Not initiating transfer (set `imSure` to true to do so)')
    }
  }

  getAvailableSourceTokens = async (selectedChain: ChainType) => {
    const source = selectedChain.title.replace(/\s+/g, '')
    const wh = await wormhole('Testnet', [evm, solana], {
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
        Solana: {
          rpc: `https://api.devnet.solana.com`,
        },
        Bsc: {
          rpc: `https://bsc-testnet.infura.io/v3/${this.INFURA_API_KEY}`,
        },
        Celo: {
          rpc: `https://celo-alfajores.infura.io/v3/${this.INFURA_API_KEY}`,
        },
        Avalanche: {
          rpc: `https://avalanche-fuji.infura.io/v3/${this.INFURA_API_KEY}`,
        },
      },
    })

    const ctx = wh.getChain(source as Chain)

    // Create new resolver, passing the set of routes to consider
    const resolver = wh.resolver([
      routes.TokenBridgeRoute,
      routes.AutomaticTokenBridgeRoute,
      routes.CCTPRoute,
      routes.AutomaticCCTPRoute,
      routes.AutomaticPorticoRoute,
      MayanRouteMCTP,
      MayanRouteSWIFT,
      MayanRouteWH,
    ])

    // What tokens are available on the source chain?
    const srcTokens = await resolver.supportedSourceTokens(ctx)
    const arr = srcTokens.map((t) => canonicalAddress(t))

    console.log(
      'Allowed source tokens: ',
      srcTokens.map((t) => canonicalAddress(t)),
    )

    // Create an array to store the results
    const tokensArray: any = []

    // Iterate over the arr and make an API request for each token address
    const requests = arr.map(async (tokenAddress) => {
      try {
        const response = await fetch(
          `https://eth-sepolia.blockscout.com/api/v2/tokens/${tokenAddress}`,
        )
        if (!response.ok) {
          throw new Error(`Failed to fetch data for ${tokenAddress}`)
        }
        const data = await response.json()

        // Extract the needed values: address, name, and symbol
        const { address, name, symbol } = data

        // Push the extracted data into the tokensArray
        tokensArray.push({ address, name, symbol })
      } catch (error) {
        console.error(`Error fetching token data for ${tokenAddress}:`, error)
      }
    })

    // Wait for all requests to complete
    await Promise.all(requests)

    // Log or return the tokensArray
    //console.log('Tokens:', tokensArray)

    this.setAvailableSourceTokens(tokensArray)
  }

  getUserTokensInWallet = async (publicAddress: string, chain: string) => {
    const tokensArray: Token[] = []
    const prefix = chain.split(' ')[0].toLowerCase()
    console.log({ chain, prefix })
    console.log({ publicAddress })

    const url = (prefix: string): string => {
      const networkNames: { [key: string]: string } = {
        base: `https://base-sepolia.blockscout.com/api/v2/addresses/${publicAddress}/token-balances`,
        sepolia: `https://eth-sepolia.blockscout.com/api/v2/addresses/${publicAddress}/token-balances`,
        optimism: `https://optimism-sepolia.blockscout.com/api/v2/addresses/${publicAddress}/token-balances`,
        arbitrum: `https://sepolia-explorer.arbitrum.io/address/${publicAddress}/token-balances`,
      }
      return networkNames[prefix]
    }

    try {
      const response = await fetch(url(prefix))
      if (!response.ok) {
        throw new Error(`Failed to fetch data for ${publicAddress}`)
      }

      const data = await response.json()

      data.forEach((d: any) => {
        const token = {
          address: d.token.address,
          name: d.token.name,
          symbol: d.token.symbol,
          iconUrl: d.token.icon_url,
          balance: d.value,
          type: d.token.type,
        }

        tokensArray.push(token)
      })

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
        this.setEthPrice(0.99888)
      }
      this.setLoading(false)
    } catch (error) {
      console.error(error)
      this.setLoading(false)
    }
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

  setLoading = (val: boolean) => {
    this.loading = val
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
