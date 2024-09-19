import { createContext } from 'react'
import { ConnectStore } from './ConnectStore'

interface StoreContextInterface {
  connectStore: ConnectStore
}

const connectStore = new ConnectStore()

export const StoreContext = createContext<StoreContextInterface>({
  connectStore,
})
