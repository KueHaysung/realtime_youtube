import type { User as CUser } from "@clerk/nextjs/api";
import { currentUser } from "@clerk/nextjs";
import { db } from "./db";
export default async function getUser() {
  const user: CUser | null = await currentUser();
  if (!user) {
    return null;
  }

  const myUser: User = {
    name: user.username ? user.username : "user_" + user.id,
    email: user.emailAddresses[0].emailAddress,
    image: user.imageUrl,
    id: user.id,
  };
  const dbUserResult = await db.get("user:" + user.id) as string|null;
  if (!dbUserResult) {
    await db.set("user:" + user.id, JSON.stringify(myUser));
  }
  const email=await db.get("user:email:"+myUser.email) as string|null;
  if (!email) {
    await db.set("user:email:"+myUser.email, myUser.id);
  }
  return myUser;
}
