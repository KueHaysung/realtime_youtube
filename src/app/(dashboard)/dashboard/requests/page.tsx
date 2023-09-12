
import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { Redis } from '@upstash/redis'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import {FC} from 'react'
import FriendRequests from '@/components/FriendRequests'
interface pageProps{}
const page=async()=>{
  const session=await getServerSession(authOptions)
  if(!session)notFound()
  const incomingSenderIds=(await fetchRedis('smembers',`user:${session.user.id}:incoming_friend_requests`))as string[]
  const inComingFriendRequests=await Promise.all(
    incomingSenderIds.map(async(senderId)=>{
      const sender=await fetchRedis('get',`user:${senderId}`)as string
      const senderParsed= JSON.parse(sender) as User
      return{
        senderId,
        senderEmail:senderParsed.email,
      }
    })
  )
  return <main className=' pt-8'>
    <h1 className=' font-bold text-5xl mb-8'>Add aa friend</h1>
    <div className='flex flex-col gap-4'>
      <FriendRequests incomingFriendRequests={inComingFriendRequests} sessionId={session.user.id}/>
    </div>
  </main>
}
export default page