import { makeAutoObservable } from 'mobx'
import { ethers, JsonRpcSigner } from 'ethers'
import { wormhole, signSendWait, Chain } from '@wormhole-foundation/sdk'
import evm from '@wormhole-foundation/sdk/evm'
import solana from '@wormhole-foundation/sdk/solana'
import { MetaMaskSigner } from '@/lib/helpers/signer'
import axios from 'axios'
import { toast } from 'sonner'
import { MerchantTransactions } from '@/lib/types/all'

type Account = {
  address: string
  provider: any
}

export class MerchantStore {
  merchantEvmAccount: Account = {
    address: '',
    provider: undefined,
  }
  merchantEvmAddress: string = ''
  allMerchantOperations: MerchantTransactions[] = []
  merchantPendingOperations: MerchantTransactions[] = []
  isRedeemCompleted: boolean = false
  loading = false
  bridgeComplete: boolean = false
  INFURA_API_KEY = import.meta.env.VITE_INFURA_API_KEY
  ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY
  ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY

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
    Holesky: {
      rpc: `https://holesky.infura.io/v3/${this.INFURA_API_KEY}`,
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
        this.setMerchantEvmAddress(address)
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        this.setMerchantEvmAccount(signer)
      } catch (error: any) {
        console.error('Error connecting wallet:', error)
      }
    } else {
      console.log(
        'MetaMask is not installed. Please install it to use this dApp.',
      )
    }
  }

  getChainNameById = (chainId: string): string | undefined => {
    const networkChainNames: { [key: string]: any } = {
      10002: 'Sepolia',
      10004: 'BaseSepolia',
      10005: 'OptimismSepolia',
      10003: 'ArbitrumSepolia',
      6: 'Avalanche',
      14: 'Celo',
    }
    return networkChainNames[chainId] || undefined
  }

  fetchAllOperations = async (merchantAddress: string) => {
    try {
      if (merchantAddress) {
        const response = await axios.get(
          `https://api.testnet.wormholescan.io/api/v1/operations?&sortOrder=DESC&address=${merchantAddress}`,
        )

        if (response.status !== 200) {
          toast(
            'An error occured while getting your history, please wait a moment and try again!',
          )
          return
        }

        console.log(response.data.operations)

        let arr: any = []
        await response.data?.operations.forEach((op: any) => {
          const obj = {
            hash: op.sourceChain?.transaction?.txHash,
            source: op.sourceChain?.chainId,
            destination: op.content?.payload?.toChain,
            destinationFormatted: this.getChainNameById(
              op.content?.payload?.toChain,
            ),
            sourceFormatted: this.getChainNameById(op.sourceChain?.chainId),
            protocol: op.content?.standarizedProperties?.appIds[0],
            status: op.targetChain?.status || 'pending',
            amount: op.content?.payload?.amount,
            tokenAddress: op.content?.standarizedProperties?.tokenAddress,
            vaa: op?.vaa,
          }

          arr.push(obj)
        })

        const pendingOperations = arr.filter(
          (op: any) => op.status !== 'completed',
        )

        this.setMerchantPendingOperations(pendingOperations)

        this.setAllMerchantOperations(arr)
      }
    } catch (error) {
      console.log(error)
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

  redeemAndFinalize = async (destinationChain: Chain, recoverTxid: string) => {
    this.setLoading(true)

    // Get the current chain ID
    const currentChainId = await window.ethereum.request({
      method: 'eth_chainId',
    })

    const sourceChainId = this.getChainIdByNetworkName(destinationChain)

    // Check if we're not on Sepolia
    if (currentChainId !== sourceChainId) {
      console.log(`Not on ${destinationChain} , switching...`)

      // Attempt to switch to Sepolia
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: sourceChainId }],
      })
      console.log(`Successfully switched to ${destinationChain}`)
    } else {
      console.log('Already on required chain')
    }

    try {
      // EXAMPLE_WORMHOLE_INIT
      const wh = await wormhole('Testnet', [evm, solana], {
        chains: this.chains,
      })

      const destination = wh.getChain(destinationChain)

      //console.log('dest ', destination)

      const destinationSigner = new MetaMaskSigner(
        this.merchantEvmAccount as JsonRpcSigner,
        destinationChain,
        this.merchantEvmAddress,
      )

      //console.log('destSig ', destinationSigner)

      //Get the VAA from the wormhole message id
      const vaa = await wh.getVaa(
        recoverTxid,
        // Protocol:Payload name to use for decoding the VAA payload
        'TokenBridge:Transfer',
        // Timeout in milliseconds, depending on the chain and network, the VAA may take some time to be available
        60_000,
      )

      // Now get the token bridge on the redeem side
      const rcvTb = await destination.getTokenBridge()

      //console.log('rcv ', rcvTb)

      // Create a transaction stream for redeeming
      const redeem = rcvTb.redeem(
        destinationSigner.address() as any,
        vaa as any,
      )

      //console.log('redeem ', redeem)

      // Sign and send the transaction
      await signSendWait(destination, redeem, destinationSigner)
      //console.log('redeemSent: ', rcvTxids)
      this.setLoading(false)

      // Now check if the transfer is completed according to
      // the destination token bridge
      const finished = await rcvTb.isTransferCompleted(vaa as any)
      //console.log('Transfer completed: ', finished)
      this.setIsRedeemCompleted(finished)
    } catch (error) {
      console.error(error)
      this.setLoading(false)
    }
  }

  setLoading = (val: boolean) => {
    this.loading = val
  }

  setMerchantEvmAccount = (data: JsonRpcSigner) => {
    this.merchantEvmAccount = data
  }

  setMerchantEvmAddress = (data: string) => {
    this.merchantEvmAddress = data
  }

  setAllMerchantOperations = (data: any) => {
    this.allMerchantOperations = data
  }

  setMerchantPendingOperations = (data: any) => {
    this.merchantPendingOperations = data
  }

  setIsRedeemCompleted = (value: boolean) => {
    this.isRedeemCompleted = value
  }
}
