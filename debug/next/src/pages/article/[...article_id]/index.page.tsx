import type { NextPage } from 'next'
import { useRouter } from 'next/router'

const Page: NextPage = () => {
  const { query } = useRouter()
  return (
    <>
      <h1>article ids page</h1>
      <div>{JSON.stringify(query)}</div>
    </>
  )
}

export default Page
