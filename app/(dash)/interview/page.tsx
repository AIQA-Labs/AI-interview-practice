import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import BackToDashboardButton from "@/components/BackToDashboard";

const Page = async () => {
  const user = await getCurrentUser();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between px-4 py-6 border-b">
        <h3 className="text-lg font-semibold justify-between">
          Interview generation
        </h3>
        <BackToDashboardButton />
      </div>

      <Agent
        userName={user?.name ?? ""}
        userId={user?.id}
        userAvatar={user?.photoURL}
        type="generate"
      />
    </div>
  );
};

export default Page;
