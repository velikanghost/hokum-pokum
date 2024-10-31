export type Tab = 'DEFAULT' | 'SELECT_TOKEN' | 'SET_MERCHANT'

export type UsdPrice = {
  usd: number
}

export type Tokens = {
  token_address: string
  name: string
  symbol: string
  logo: null | string
  thumbnail: null | string
  decimals: number
  balance: string
  possible_spam: boolean
  verified_contract: boolean
  balance_formatted: string
  native_token: boolean
  total_supply: null | string
  total_supply_formatted: null | string
}
