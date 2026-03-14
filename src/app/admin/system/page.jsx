import SystemClient from "./SystemClient";

export const metadata = {
    title: "Sistem İzleme | Civardaki Admin",
    description: "Sistem durumunu ve hataları izleme paneli.",
};

export default function SystemPage() {
    return (
        <div className="p-8">
            <SystemClient />
        </div>
    );
}
