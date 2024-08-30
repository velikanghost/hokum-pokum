export const contractAddress = 'TKDHSRiVVVQrxQ49SA4pbJB77s8N2CAoKq'
export const recipientAddress = 'TEdecYZ9mHKWAq44BM9Hxz2EUqRnhB7CWE'
export const contractABI = [
  {
    outputs: [{ type: 'uint256' }],
    inputs: [
      { name: 'recieveToken', type: 'address' },
      { name: 'amountIn', type: 'uint256' },
      { name: 'recipient', type: 'address' },
    ],
    name: 'inputSwap',
    stateMutability: 'payable',
    type: 'function',
  },
  {
    outputs: [{ type: 'uint256' }],
    inputs: [
      { name: 'spendToken', type: 'address' },
      { name: 'amountInMax', type: 'uint256' },
      { name: 'amountOut', type: 'uint256' },
    ],
    name: 'outputSwap',
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    outputs: [{ type: 'address' }],
    name: 'routerAddress',
    stateMutability: 'view',
    type: 'function',
  },
  {
    outputs: [{ type: 'address' }],
    name: 'swapRouter',
    stateMutability: 'view',
    type: 'function',
  },
  {
    outputs: [{ type: 'address' }],
    name: 'wtrx',
    stateMutability: 'view',
    type: 'function',
  },
  { stateMutability: 'Payable', type: 'Receive' },
]
