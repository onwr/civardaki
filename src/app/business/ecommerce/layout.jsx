import { redirect } from "next/navigation";

/**
 * E-Ticaret modülü şimdilik kapalı; doğrudan URL ile girilmesin diye yönlendirme.
 * Açılınca bu layout'taki redirect kaldırılabilir.
 */
export default function EcommerceSectionLayout() {
  redirect("/business/dashboard");
}
