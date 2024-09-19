import { makeAutoObservable } from 'mobx'
import { ethers, JsonRpcSigner } from 'ethers'
import {
  wormhole,
  signSendWait,
  Wormhole,
  amount,
  Chain,
} from '@wormhole-foundation/sdk'
import { EvmAddress } from '@wormhole-foundation/sdk-evm'
import evm from '@wormhole-foundation/sdk/evm'
import { MetaMaskSigner } from '@/lib/helpers/signer'
import { Chain as ChainType } from '@/lib/types/chain'
import { Token } from '@/lib/types'
import axios from 'axios'

type Account = {
  address: string
  provider: any
}

// Model the application state.
export class ConnectStore {
  account: Account = {
    address: '',
    provider: undefined,
  }
  address: string = ''
  isAwaitingVAA: boolean = false
  isRedeemCompleted: boolean = false
  isInitiatingTransfer: boolean = false
  loading = false
  selectedToken: Token = {
    symbol: '',
    name: '',
    tokenIcon: '',
    chainIcon: '',
  }
  selectedChain: ChainType = {
    title: '',
    tokens: [],
    explorer: '',
    icon: '',
  }
  ethPrice: number = 0
  INFURA_API_KEY = import.meta.env.VITE_INFURA_API_KEY
  ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY
  ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY

  constructor() {
    makeAutoObservable(this)
  }

  // Check if MetaMask is installed
  isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined'
  }

  // Function to handle wallet connection
  connectWallet = async () => {
    if (this.isMetaMaskInstalled()) {
      try {
        // Request wallet connection
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        const address = accounts[0]
        this.setAddress(address)

        // You could also create a signer here for future use
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        this.setAccount(signer)
        console.log('Connected wallet address:', address)
        console.log('Signer:', signer)
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
      // EXAMPLE_WORMHOLE_INIT

      // Grab a ChainContext object from our configured Wormhole instance
      const ctx = wh.getChain(source)
      const rcv = wh.getChain(destination)

      const sender = new MetaMaskSigner(
        this.account as JsonRpcSigner,
        ctx.chain,
        this.address,
      )

      const receiver = new MetaMaskSigner(
        this.account as JsonRpcSigner,
        rcv.chain,
        this.address,
      )

      // Get a Token Bridge contract client on the source
      const sndTb = await ctx.getTokenBridge()

      // Send the native token of the source chain
      const tokenId = Wormhole.tokenId(ctx.chain, 'native')

      // bigint amount using `amount` module
      const amt = amount.units(
        amount.parse('0.003', ctx.config.nativeTokenDecimals),
      )

      const senderAddress = new EvmAddress(this.address)

      const receiverAddress = {
        chain: destination,
        address: senderAddress,
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
      const [whm] = await ctx.parseTransaction(txids[txids.length - 1]!.txid)
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
        this.account as JsonRpcSigner,
        destinationChain,
        this.address,
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

  getPrice = async (token: string) => {
    try {
      this.setLoading(true)
      if (token === 'eth') {
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

  setAccount = (data: JsonRpcSigner) => {
    this.account = data
  }

  setAddress = (data: string) => {
    this.address = data
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
}
