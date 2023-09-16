import { fetchRedis } from "@/helpers/redis";
import { notFound } from "next/navigation";
import FriendRequests from "@/components/FriendRequests";
import getUser from "@/lib/getUser";
interface pageProps {}
const page = async () => {
  const user = await getUser();
  if (!user) notFound();

  const incomingSenderIds = (await fetchRedis(
    "smembers",
    `user:${user.id}:incoming_friend_requests`
  )) as string[];
  const inComingFriendRequests = await Promise.all(
    incomingSenderIds.map(async (senderId) => {
      const sender = (await fetchRedis("get", `user:${senderId}`)) as string;
      const senderParsed = JSON.parse(sender) as User;
      return {
        senderId,
        senderEmail: senderParsed.email,
      };
    })
  );
  return (
    <main className=" pt-8">
      <h1 className=" font-bold text-5xl mb-8">Add aa friend</h1>
      <div className="flex flex-col gap-4">
        <FriendRequests
          incomingFriendRequests={inComingFriendRequests}
          sessionId={user.id}
        />
      </div>
    </main>
  );
};
export default page;
