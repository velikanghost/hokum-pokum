'use client'

import injectedConnector from '@/connector/Connector'
import { useWeb3React } from '@web3-react/core'
import { ethers } from 'ethers'
import { Button } from 'primereact/button'
import { useState } from 'react'
import DropdownSelect from './ui/Dropdown'

const Bridge = () => {
  const { chainId, account, active, library, activate } = useWeb3React()
  const [amountToBridge, setAmountToBridge] = useState<string>('')

  const BlastBridgeAddress = '0xc644cc19d2A9388b71dd1dEde07cFFC73237Dca8'
  const blastProvider = new ethers.JsonRpcProvider('https://sepolia.blast.io')

  const handleConnectWallet = async () => {
    await activate(injectedConnector)
  }

  const handleSendToBlast = async (e: any) => {
    e.preventDefault()
    if (amountToBridge === '') return alert('Amount can not be empty!')

    if (!active) {
      await activate(injectedConnector)
    }

    if (active && chainId !== 11155111) {
      await library.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }],
      })
    }

    const signer = library.getSigner()

    const tx = {
      to: BlastBridgeAddress,
      value: ethers.parseEther(amountToBridge),
    }

    const transaction = await signer.sendTransaction(tx)
    await transaction.wait()
    alert('Bridging Complete!')
  }

  return (
    <div className="border border-[#696911] w-[300px] md:w-[580px] py-10 px-4 h-[100%] rounded-lg">
      <div className="grid place-items-center">
        <div className="w-full grid place-items-center">
          <p className="text-primaryYellow flex items-center justify-center mb-4">
            DEPOSIT FROM{' '}
            <DropdownSelect classname="md:w-14rem text-center ml-2" />
          </p>
          <input
            type="text"
            className="border border-yellow-600 rounded-xl mb-6 px-2 py-2 w-full"
            placeholder="Enter amount"
            value={amountToBridge}
            onChange={(e) => setAmountToBridge(e.target.value)}
          />{' '}
        </div>
        {active ? (
          <Button
            onClick={handleSendToBlast}
            className="bg-[#292909] text-[#FCFC05] py-2 px-4"
            label="Send to Blast"
          />
        ) : (
          <Button
            onClick={handleConnectWallet}
            className="bg-[#292909] text-[#FCFC05] py-2 px-4"
            label="Connect Wallet"
          />
        )}
      </div>
    </div>
  )
}

export default Bridge

import { InjectedConnector } from '@web3-react/injected-connector'

const injectedConnector = new InjectedConnector({
  supportedChainIds: [1, 5, 324, 11155111, 168587773],
})

export default injectedConnector
