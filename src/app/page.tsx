import { UserButton } from "@clerk/nextjs";

const Page = ({}) => {
  return <div>
      <UserButton afterSignOutUrl="/login" />
  </div>;
};

export default Page;
