import { db } from "@/lib/db";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    db.set("lastTime", Date.now());
  } catch (e) {
    return new Response("cannot set lasttime" + e, { status: 422 });
  }
  try {
    const appointmentIds = await db.smembers("incoming_appointment");
    appointmentIds.map(async (appointmentId) => {
      const appointment: Appointment[] = await db.smembers(
        `appointment:${appointmentId}:incoming_appointment`
      );
      // const appointmentParsed = JSON.parse(appointment[0]) as Appointment;
      if (appointment[0].startTime > Date.now()) {
        await db.srem("incoming_appointment", appointmentId);
        await db.del(`appointment:${appointmentId}:incoming_appointment`);
      }
      return NextResponse.json({ ok: true });
    });
  } catch (e) {
    return new Response("cannot get appointmentIds" + e, { status: 422 });
  }
  
}
