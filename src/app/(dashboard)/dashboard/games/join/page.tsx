import { fetchRedis } from "@/helpers/redis";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import AppointmentRequests from "@/components/AppointmentRequests";

const Page = async () => {
  const session = await getServerSession(authOptions);
  if (!session) notFound();
  const incomingAppointmentIds = (await fetchRedis(
    "smembers",
    "incoming_appointment"
  )) as string[];
  const inComingAppointmentRequests = await Promise.all(
    incomingAppointmentIds.map(async (appointmentId) => {
      const sender = (await fetchRedis(
        "smembers",
        `appointment:${appointmentId}:incoming_appointment`
      )) as string;
      const senderParsed = JSON.parse(sender) as Appointment;
      return senderParsed;
    })
  );
  return (
    <main className=" pt-8">
      <h1 className=" font-bold text-5xl mb-8">可参加的预定列表</h1>
      <div className="flex flex-col gap-4">
        <AppointmentRequests
          incomingAppointment={inComingAppointmentRequests}
          sessionId={session.user.id}
        />
      </div>
    </main>
  );
};
export default Page;
