import { FC } from "react";
import { SignIn } from "@clerk/nextjs";
interface pageProps {}
const Page: FC<pageProps> = ({}) => {
  return (
    <>
      <div className=" relative">
        <div className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[50%]">
          <SignIn />
        </div>
      </div>
    </>
  );
};
export default Page;
