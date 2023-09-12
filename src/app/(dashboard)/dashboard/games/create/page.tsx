
import { FC, useState } from "react";
import CreateGame from "./CreateGame";
interface pageProps {}

const page: FC<pageProps> = async ({}) => {
  await new Promise((resolve) => setTimeout(resolve, 5000));

  return (
    <main className="pt-8">
      <h1 className="font-bold text-5xl mb-8">创建桌游预定</h1>
      <CreateGame />
    </main>
  );
};
export default page;
