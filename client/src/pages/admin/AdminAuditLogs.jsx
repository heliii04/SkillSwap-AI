import { useState } from "react";
import { FiDatabase } from "react-icons/fi";

export default function AdminAuditLogs() {
    const [now] = useState(() => new Date());

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <FiDatabase /> Platform Audit Logs
                </h2>
                <div className="space-y-3.5 text-sm">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 text-white/40">
                        <span>Log Description</span>
                        <span>Timestamp</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-300">
                        <span>Admin Logged In: Static credentials verification successful.</span>
                        <span className="text-xs text-white/35">{now.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-300">
                        <span>User Role Elevate: User Heli Vyas promoted to admin.</span>
                        <span className="text-xs text-white/35">{new Date(now.getTime() - 3600000).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-gray-300">
                        <span>Support ticket status updated: Ticket #contact-inquiry marked in progress.</span>
                        <span className="text-xs text-white/35">{new Date(now.getTime() - 7200000).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
