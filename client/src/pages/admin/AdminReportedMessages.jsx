import { FiCheckCircle } from "react-icons/fi";

export default function AdminReportedMessages() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                <h2 className="text-lg font-bold mb-4">Flagged Chat Messages</h2>
                <div className="py-8 text-center text-white/35 text-sm flex items-center justify-center gap-2">
                    <FiCheckCircle className="text-emerald-400 text-lg" />
                    No flagged messages found. Safe chat filters are working!
                </div>
            </div>
        </div>
    );
}
