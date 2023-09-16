import { fetchRedis } from '@/helpers/redis'
import { db } from '@/lib/db'
import getUser from '@/lib/getUser'
import { pusherServer } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import { Message, messageValidator } from '@/lib/validations/message'
import { nanoid } from 'nanoid'

export async function POST(req: Request) {
  try {
    const { text, chatId,time }: { text: string; chatId: string,time:number } = await req.json()
    const user=await getUser()
    if (!user) return new Response('Unauthorized', { status: 401 })

    const [userId1, userId2] = chatId.split('--')

    if (user.id !== userId1 && user.id !== userId2) {
      return new Response('Unauthorized', { status: 401 })
    }

    const friendId = user.id === userId1 ? userId2 : userId1

    const friendList = (await fetchRedis(
      'smembers',
      `user:${user.id}:friends`
    )) as string[]
    const isFriend = friendList.includes(friendId)

    if (!isFriend) {
      return new Response('Unauthorized', { status: 401 })
    }

    const rawSender = (await fetchRedis(
      'get',
      `user:${user.id}`
    )) as string
    const sender = JSON.parse(rawSender) as User

    const timestamp = Date.now()

    const messageData: Message = {
      id: nanoid(),
      senderId: user.id,
      text,
      timestamp,
    }
    const message = messageValidator.parse(messageData)
    const message1=(await fetchRedis('zrange',`chat:${chatId}:messages`,0,-1))as string[]
    const message1Parsed= message1.map((m)=>JSON.parse(m) as Message)
    const message2=message1Parsed.filter((m)=>m.timestamp==time)
    // notify all connected chat room clients
    await pusherServer.trigger(toPusherKey(`chat:${chatId}`), 'delete-message', message2)

    await pusherServer.trigger(toPusherKey(`user:${friendId}:chats`), 'new_message', {
      ...message,
      senderImg: sender.image,
      senderName: sender.name
    })

    // all valid, send the message
    await db.zremrangebyscore(`chat:${chatId}:messages`, time-1,time+1)

    return new Response('OK')
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 })
    }

    return new Response('Internal Server Error', { status: 500 })
  }
}