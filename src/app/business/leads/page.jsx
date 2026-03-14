import LeadsClient from "@/components/business/LeadsClient";

export const metadata = {
    title: "Talep Yönetimi | Civardaki İşletme Paneli",
    description: "Müşteri taleplerini görüntüleyin ve yönetin.",
    robots: { index: false, follow: false }
};

export default function LeadsPage() {
    return <LeadsClient />;
}
