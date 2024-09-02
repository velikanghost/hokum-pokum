'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { Button } from '@/components/ui/button'
import { PiClosedCaptioningLight } from 'react-icons/pi'

const erc20ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    inputs: [],
    name: 'faucet',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

const Page = () => {
  const [loadingMessage, setLoadingMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY!
  const infuraKey = process.env.NEXT_PUBLIC_INFURA_KEY!

  // Initialize providers with the correct chain ID
  const l1Provider = new ethers.providers.JsonRpcProvider(
    `https://sepolia.infura.io/v3/${infuraKey}`,
    { chainId: 11155111, name: 'sepolia' },
  )

  const l2Provider = new ethers.providers.JsonRpcProvider(
    `https://sepolia.optimism.io`,
    { chainId: 11155420, name: 'optimism-sepolia' },
  )

  const requestTokens = async () => {
    const l1Wallet = new ethers.Wallet(privateKey, l1Provider)
    const l1Token = '0x5589BB8228C07c4e15558875fAf2B859f678d129'
    const l1ERC20 = new ethers.Contract(l1Token, erc20ABI, l1Wallet)
    const tx = await l1ERC20.faucet()
    await tx.wait()
    console.log((await l1ERC20.balanceOf(l1Wallet.address)).toString())
  }

  const bridgeTokens = async () => {
    console.log('here')
    PiClosedCaptioningLight
  }

  return (
    <main className="m-3">
      <div>{'hello There'}</div>
      <Button className="mb-4" variant="nav" onClick={requestTokens}>
        {loadingMessage ? 'Processing...' : 'Request Token on L1'}
      </Button>
      <br />
      <Button variant="nav" onClick={bridgeTokens} disabled={!!loadingMessage}>
        {loadingMessage ? 'Processing...' : 'Start Bridge'}
      </Button>
      {loadingMessage && <div>Loading: {loadingMessage}</div>}
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
      {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
    </main>
  )
}

export default Page
