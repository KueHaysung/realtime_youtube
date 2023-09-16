import { db } from "@/lib/db";
import getUser from "@/lib/getUser";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await getUser();

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { id: idToDeny } = z.object({ id: z.string() }).parse(body);

    await db.srem(`user:${user.id}:incoming_friend_requests`, idToDeny);

    return new Response("OK");
  } catch (error) {
    console.log(error);

    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload", { status: 422 });
    }

    return new Response("Invalid request", { status: 400 });
  }
}
