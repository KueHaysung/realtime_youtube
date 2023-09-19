import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await db.set("lastTime", Date.now());
  } catch (e) {
    return new NextResponse("cannot set lasttime" + e, { status: 422 });
  }

  try {
    const appointmentIds = await db.smembers("incoming_appointment");
    await Promise.all(
      appointmentIds.map(async (appointmentId) => {
        const appointment: Appointment[] = await db.smembers(
          `appointment:${appointmentId}:incoming_appointment`
        );
        // const appointmentParsed = JSON.parse(appointment[0]) as Appointment;
        if (appointment[0].startTime > Date.now()) {
          await db.srem("incoming_appointment", appointmentId);
          await db.del(`appointment:${appointmentId}:incoming_appointment`);
        }
      })
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    return new NextResponse("cannot get appointmentIds" + e, { status: 422 });
  }
}
