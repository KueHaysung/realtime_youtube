import cron from "node-cron";
import { db } from "@/lib/db";
import App from "next/app";
import { NextResponse } from 'next/server';

export async function GET() {
  db.set("lastTime", Date.now());
  const appointmentIds = await db.smembers("incoming_appointment");
  appointmentIds.map(async (appointmentId) => {
    const appointment: Appointment[] = await db.smembers(
      `appointment:${appointmentId}:incoming_appointment`
    );
    console.log("appointment", typeof appointment);
    console.log("appointment[0]", typeof appointment[0]);
    // const appointmentParsed = JSON.parse(appointment[0]) as Appointment;
    if (appointment[0].startTime > Date.now()) {
      await db.srem("incoming_appointment", appointmentId);
      await db.del(`appointment:${appointmentId}:incoming_appointment`);
    }
  });
  console.log("running a task every minute", Date.now());
  console.log("任务完成");
  return NextResponse.json({ ok: true });
}