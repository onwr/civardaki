import AnalyticsClient from "@/components/admin/AnalyticsClient";

export const metadata = {
    title: "Analitik ve Raporlama | Civardaki Admin",
    description: "Platform genelindeki lead ve işletme performansını takip edin.",
    robots: { index: false, follow: false }
};

export default function AnalyticsPage() {
    return <AnalyticsClient />;
}
