import { FC } from "react";
import Button from "../../../components/ui/Button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
interface pageProps {}
const page: FC<pageProps> = async ({}) => {
  const session = await getServerSession(authOptions);
  return (
    <>
      <pre>{JSON.stringify(session, null, 4)}</pre>
      {/* <div>你好</div>
  <Button size='lg'>100</Button> */}
    </>
  );
};
export default page;
