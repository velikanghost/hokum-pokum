export const contractAddress = 'TKDHSRiVVVQrxQ49SA4pbJB77s8N2CAoKq' //TMSfNZFwoJ3fvE52YB59BsJJxYvowgYutA
export const recipientAddress = 'TEdecYZ9mHKWAq44BM9Hxz2EUqRnhB7CWE'
// export const contractABI = [
//   {
//     outputs: [{ type: 'address' }],
//     name: 'routerAddress',
//     stateMutability: 'View',
//     type: 'Function',
//   },
//   {
//     outputs: [{ type: 'address' }],
//     name: 'swapRouter',
//     stateMutability: 'View',
//     type: 'Function',
//   },
//   {
//     outputs: [{ type: 'address' }],
//     name: 'wtrx',
//     stateMutability: 'View',
//     type: 'Function',
//   },
//   { stateMutability: 'Payable', type: 'Receive' },
//   {
//     outputs: [{ type: 'uint256' }],
//     inputs: [
//       { name: 'recieveToken', type: 'address' },
//       { name: 'amountIn', type: 'uint256' },
//     ],
//     name: 'inputSwap',
//     stateMutability: 'Payable',
//     type: 'Function',
//   },
//   {
//     outputs: [{ type: 'uint256' }],
//     inputs: [
//       { name: 'spendToken', type: 'address' },
//       { name: 'amountInMax', type: 'uint256' },
//       { name: 'amountOut', type: 'uint256' },
//     ],
//     name: 'outputSwap',
//     stateMutability: 'Nonpayable',
//     type: 'Function',
//   },
// ]

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
