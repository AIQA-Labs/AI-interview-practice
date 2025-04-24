import React, { ReactNode } from "react";
import { isAuthenticated } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import HomeLoginbtn from "@/components/HomeLoginbtn";
const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (isUserAuthenticated) redirect("/dashboard");
  return (
    <div className="root-layout">
      <nav className="flex items-center justify-between   shadow">
        <div className="flex items-center gap-2">
          <Image src="/logo_2.png" alt="MockMate Logo" width={50} height={52} />
          <h2 className="text-primary-100">AIQA</h2>
        </div>

        <Link href="/sign-in">
          <HomeLoginbtn />
        </Link>
      </nav>
      {children}
    </div>
  );
};

export default Layout;
