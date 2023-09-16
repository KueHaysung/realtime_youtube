import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { z } from "zod";
import getUser from "@/lib/getUser";
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      startTime: startTime,
      endTime: endTime,
      gameType: gameType,
      countFloor: countFloor,
      countCeiling: countCeiling,
      location: location,
      describe: describe,
    }: {
      startTime: string;
      endTime: string;
      gameType: string[];
      countFloor: number;
      countCeiling: number;
      location: string;
      describe: string;
    } = body;
    console.log("startTime2:", startTime);
    const user = await getUser();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }
    const appointment: Appointment = {
      id: nanoid(),
      memberId: [user.id],
      startTime: new Date(startTime).getTime(),
      endTime: new Date(endTime).getTime(),
      selectedGames: gameType,
      countCeiling: countCeiling,
      countFloor: countFloor,
      description: describe,
      location: location,
    };
    console.log("appointment:", appointment);
    // await pusherServer.trigger(
    //   toPusherKey(`appointment:${appointment.id}:incoming_appointment`),
    //   "incoming_appointment",
    //   {
    //     appointment: appointment,
    //   }
    // );

    await db.sadd(
      `appointment:${appointment.id}:incoming_appointment`,
      appointment
    );
    await db.sadd(`incoming_appointment`, appointment.id);
    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request payload" + error, { status: 422 });
    }
  } finally {
  }
}
