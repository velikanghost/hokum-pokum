import { JsonRpcSigner, TransactionRequest } from 'ethers' // Import the correct types from ethers v6
import {
  SignAndSendSigner,
  UnsignedTransaction,
  TxHash,
  Chain,
  Network,
} from '@wormhole-foundation/sdk'

export type MetaMaskSignerOptions = {
  gasLimit?: bigint
  gasPrice?: bigint
  maxFeePerGas?: bigint
  maxPriorityFeePerGas?: bigint
}

export class MetaMaskSigner implements SignAndSendSigner<Network, Chain> {
  provider: JsonRpcSigner // Corrected the provider type for ethers v6
  chainName: Chain
  userAddress: string
  opts?: MetaMaskSignerOptions

  constructor(
    provider: JsonRpcSigner,
    chainName: Chain,
    userAddress: string,
    opts?: MetaMaskSignerOptions,
  ) {
    this.provider = provider
    this.chainName = chainName
    this.userAddress = userAddress // Address is now directly passed in
    this.opts = opts || {} // Initialize the options with default or user-provided values
  }

  chain(): Chain {
    return this.chainName
  }

  address(): string {
    return this.userAddress
  }

  // signAndSend method with custom gas settings
  async signAndSend(tx: UnsignedTransaction[]): Promise<TxHash[]> {
    const txHashes: TxHash[] = []

    // Default gas values
    let gasLimit = this.opts?.gasLimit || 1_000_000n
    let maxFeePerGas = this.opts?.maxFeePerGas || 8_500_000_000n // 8.5 gwei
    let maxPriorityFeePerGas = this.opts?.maxPriorityFeePerGas || 7_500_000_000n // 7.5 gwei

    for (const transaction of tx) {
      const transactionRequest: TransactionRequest = {
        ...transaction.transaction,
        from: this.userAddress, // Address is set from the property
        gasLimit,
        maxFeePerGas,
        maxPriorityFeePerGas,
      }

      // Send the transaction using the provided signer
      const txResponse = await this.provider.sendTransaction(transactionRequest)
      txHashes.push(txResponse.hash) // Extract the transaction hash
    }

    return txHashes
  }
}
