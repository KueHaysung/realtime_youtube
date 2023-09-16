import { fetchRedis } from "@/helpers/redis";
import { notFound } from "next/navigation";
import AppointmentRequests from "@/components/AppointmentRequests";
import getUser from "@/lib/getUser";
import { db } from "@/lib/db";
async function getJoinners(
  incomingAppointment: Appointment[],
  sessionId: string
) {
  //获取USer[]
  const myUserIds: string[] = [];

  incomingAppointment.map((request) =>
    request.memberId.map((memberid) => myUserIds.push(memberid))
  );
  myUserIds.push(sessionId);

  //剔除重复的id
  const myUserIdsSet = new Set(myUserIds);
  //定义myUsersp
  const myUsers: User[] = [];
  await myUserIdsSet.forEach(async (userId) => {
    myUsers.push((await db.get(`user:${userId}`)) as User);
  });
  console.log("getJoinners:", myUsers);
  return myUsers;
}
const Page = async () => {
  const user = await getUser();
  if (!user) notFound();

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
     const jn= getJoinners( inComingAppointmentRequests, user.id)
  return (
    <main className=" pt-8">
      <h1 className=" font-bold text-5xl mb-8">可参加的预定列表</h1>
      <div className="flex flex-col gap-4">
        <AppointmentRequests
          incomingAppointment={inComingAppointmentRequests}
          sessionId={user.id}
          initJoinners={await jn}
        />
      </div>
    </main>
  );
};
export default Page;
