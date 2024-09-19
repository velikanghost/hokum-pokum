import { Token } from './token'

export interface Chain {
  title: string
  tokens: Token[]
  explorer: string
  icon: string
}
