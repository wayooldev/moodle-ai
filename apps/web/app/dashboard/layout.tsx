import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardClientLayout } from "@/components/dashboard/dashboard-client-layout";
import { hasCampusCredentials } from "@/lib/campus";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/");
  }
  const connected = await hasCampusCredentials(userId);
  if (!connected) {
    redirect("/onboarding");
  }
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
