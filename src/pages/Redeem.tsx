import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { StoreContext } from '@/mobx store/RootStore'
import { observer } from 'mobx-react-lite'
import { useContext, useEffect, useState } from 'react'
import Navbar from './components/Layouts/Navbar'

const Redeem = () => {
  const { connectStore } = useContext(StoreContext)
  const [recoverTxid, setRecoverTxid] = useState<string>('')

  const getAccount = async () => {
    await connectStore.connectWallet()
  }

  useEffect(() => {
    getAccount()
  }, [])

  const redeemAndFinalize = async () => {
    await connectStore.redeemAndFinalize(recoverTxid, 'ArbitrumSepolia')
  }
  return (
    <>
      <Navbar />
      <div className="container flex flex-col justify-center items-center mx-auto max-w-[600px] mt-[20%]">
        <h4>Redeem</h4>
        <Input
          type="text"
          placeholder="Tx Hash"
          value={recoverTxid}
          onChange={(e) => setRecoverTxid(e.target.value)}
          className="mt-10"
        />
        '
        <Button
          onClick={redeemAndFinalize}
          variant="default"
          className="btn-primary"
        >
          Redeem
        </Button>
        {connectStore.isAwaitingVAA ? (
          <p className="text-black">Initializing...</p>
        ) : null}
        {connectStore.loading ? (
          <p className="text-black">Redeeming...</p>
        ) : null}
        {connectStore.isRedeemCompleted ? (
          <p className="text-black">Token bridge complete!</p>
        ) : null}
      </div>
    </>
  )
}

export default observer(Redeem)
