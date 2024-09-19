import { useEffect, useState } from 'react'

export const useConversion = () => {
  const [tokenSymbol, setTokenSymbol] = useState<string>()
  const [tokenPrice, setTokenPrice] = useState<number>(0)

  useEffect(() => {
    if (tokenSymbol)
      getData(tokenSymbol).then((res) => {
        if (res.price_in_trx) setTokenPrice(Number(res.price_in_trx))
      })
  }, [tokenSymbol])
  return { setTokenSymbol, tokenPrice }
}

export async function getData(tokenSymbol: string) {
  try {
    const response = await fetch(
      `https://apilist.tronscanapi.com/api/token/price?token=${tokenSymbol.toLowerCase()}`,
      {
        method: 'GET',
      },
    )
    //console.log('Res price === ', response)

    return response.json() // parses JSON response into native JavaScript objects
  } catch (error) {
    return { statusCode: 502, message: 'Error connecting' }
  }
}
