import { requireValidSubscription } from "@/lib/subscription";

export default async function LeadsLayout({ children }) {
    await requireValidSubscription();
    return <>{children}</>;
}
