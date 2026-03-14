import { requireValidSubscription } from "@/lib/subscription";

export default async function ProductsLayout({ children }) {
    await requireValidSubscription();
    return <>{children}</>;
}
