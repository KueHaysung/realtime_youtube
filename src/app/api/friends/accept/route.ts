import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { log } from "console";
import { getServerSession } from "next-auth";
import { z } from "zod";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id: idToAdd } = z.object({ id: z.string() }).parse(body);
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    //验证所有用户均不为朋友
    const isAleadyFriend = await fetchRedis(
      "sismember",
      `user:${session.user.id}:friends`,
      idToAdd
    );
    if (isAleadyFriend) {
      return new Response("Already friends", { status: 400 });
    }
    const hasFriendRequest = await fetchRedis(
      "sismember",
      `user:${session.user.id}:incoming_friend_requests`,
      idToAdd
    );
    if(!hasFriendRequest){
      return new Response('No firend request',{status:400})
    }
    await db.sadd(`user:${session.user.id}:friends`,idToAdd)
    await db.sadd(`user:${idToAdd}:friends`,session.user.id)
    // await db.srem(`user:${idToAdd}:incoming_friend_reqeusts`,session.user.id)
    await db.srem(`user:${session.user.id}:incoming_friend_requests`,idToAdd)
    return new Response("OK");
  } catch (error) {
    if(error instanceof z.ZodError){
      return new Response('Invalid request payload',{status:422})
    }
  }
  return new Response('Ivalid request',{status:400})
}
