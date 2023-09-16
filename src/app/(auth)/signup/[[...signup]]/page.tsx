import { FC } from "react";
import { SignUp } from "@clerk/nextjs";
interface pageProps {}
const Page: FC<pageProps> = ({}) => {
  return (
    <>
      <div className=" relative">
        <div className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[50%]">
          <SignUp />
        </div>
      </div>
    </>
  );
};
export default Page;
