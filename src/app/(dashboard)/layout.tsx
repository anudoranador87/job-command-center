import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If unauthorized in production/strict, redirect. For local development ease, allow fallback or session
  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar user={session?.user} />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto space-y-6">{children}</div>
      </main>
    </div>
  );
}
