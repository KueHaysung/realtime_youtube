import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { error } from "console";
import { getServerSession } from "next-auth";
import { z } from "zod";

export async function POST(req:Request){
  const {id:id}=await req.json()
  const session=await getServerSession(authOptions)
  if (!session){
    return new Response("Unathorized",{status:401})
  }
  const appointment = (await fetchRedis(
    "smembers",
    `appointment:${id}:incoming_appointment`
  )) as string;
  const appointmentParsed = JSON.parse(appointment) as Appointment;
  const isAlreadyJoin=appointmentParsed.memberId.includes(session.user.id)
  if(isAlreadyJoin){
    return new Response('Already Join',{status:400})
  }
  appointmentParsed.memberId.push(session.user.id)
  console.log("newapp:",appointmentParsed)
  try{
 
    await db.spop(`appointment:${id}:incoming_appointment`)
    await db.sadd(`appointment:${id}:incoming_appointment`,appointmentParsed)
    return new Response("OK")
  } catch (error) {
    if(error instanceof z.ZodError){
      return new Response('Invalid request payload',{status:422})
    }
  }
  return new Response('Ivalid request',{status:400})
}