import { useSearchParams } from "react-router-dom";
import AdminOverview from "./AdminOverview";
import AdminUsers from "./AdminUsers";
import AdminSkills from "./AdminSkills";
import AdminSwaps from "./AdminSwaps";
import AdminSupport from "./AdminSupport";
import AdminReports from "./AdminReports";
import AdminReportedMessages from "./AdminReportedMessages";
import AdminAnalytics from "./AdminAnalytics";
import AdminAuditLogs from "./AdminAuditLogs";

export default function AdminDashboard() {
    const [searchParams] = useSearchParams();
    const currentSection = searchParams.get("section") || "dashboard";

    const renderSection = () => {
        switch (currentSection) {
            case "users":
            case "suspended-users":
                return <AdminUsers />;
            case "skills":
                return <AdminSkills />;
            case "swaps":
                return <AdminSwaps />;
            case "support":
                return <AdminSupport />;
            case "reports":
                return <AdminReports />;
            case "reported-messages":
                return <AdminReportedMessages />;
            case "analytics":
                return <AdminAnalytics />;
            case "audit-logs":
                return <AdminAuditLogs />;
            case "dashboard":
            default:
                return <AdminOverview />;
        }
    };

    return (
        <main className="px-4 pb-12 pt-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1500px] space-y-8">
                {renderSection()}
            </div>
        </main>
    );
}
