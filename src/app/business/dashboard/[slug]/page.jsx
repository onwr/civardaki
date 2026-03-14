import DashboardClient from "./DashboardClient";
import { requireValidSubscription } from "@/lib/subscription";

export const metadata = {
  title: "İşletme Yönetim Paneli | Civardaki",
  robots: { index: false, follow: false }
};

export default async function DashboardPage({ params }) {
  // SPRINT 10B: Validate Subscription (Trial / Active)
  // Re-routes to /business/billing if expired or missing
  await requireValidSubscription();

  return <DashboardClient slug={params.slug} />;
}
