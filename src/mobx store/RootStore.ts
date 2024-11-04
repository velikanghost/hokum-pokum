import { createContext } from 'react'
import { ConnectStore } from './ConnectStore'
import { MerchantStore } from './MerchantStore'

interface StoreContextInterface {
  connectStore: ConnectStore
  merchantStore: MerchantStore
}

const connectStore = new ConnectStore()
const merchantStore = new MerchantStore()

export const StoreContext = createContext<StoreContextInterface>({
  connectStore,
  merchantStore,
})
