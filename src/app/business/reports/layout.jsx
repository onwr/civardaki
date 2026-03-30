import { redirect } from "next/navigation";

/**
 * Raporlar modülü şimdilik kapalı; doğrudan URL ile girilmesin diye yönlendirme.
 * Açılınca bu layout'taki redirect kaldırılabilir.
 */
export default function ReportsSectionLayout() {
  redirect("/business/dashboard");
}
