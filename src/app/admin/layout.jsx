import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/user/login?callbackUrl=%2Fadmin&error=Unauthorized");
  }

  return <AdminLayoutClient session={session}>{children}</AdminLayoutClient>;
}
