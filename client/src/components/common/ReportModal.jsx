import { useState } from "react";
import { FiAlertTriangle, FiX, FiLoader } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";
import useLockBodyScroll from "../../hooks/useLockBodyScroll";

export default function ReportModal({
    isOpen,
    onClose,
    targetType = "user",
    targetId,
    reportedUser,
    targetName = "Content"
}) {
    useLockBodyScroll(isOpen);
    const [reason, setReason] = useState("harassment");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!description.trim()) {
            toast.error("Please provide a description of the issue.");
            return;
        }

        setSubmitting(true);
        try {
            await axiosClient.post("/reports", {
                targetType,
                targetId,
                reportedUser,
                reason,
                description: description.trim()
            });

            toast.success("Report submitted successfully. Our safety team will review it.");
            onClose();
            setDescription("");
        } catch (err) {
            console.error("Report submission error:", err);
            toast.error(err.response?.data?.message || "Failed to submit report.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0e0f17] p-6 shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-xl p-2 text-white/40 transition hover:bg-white/10 hover:text-white"
                >
                    <FiX className="text-xl" />
                </button>

                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
                        <FiAlertTriangle className="text-xl" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Report {targetName}</h3>
                        <p className="text-xs text-white/45">Help us keep SkillSwap AI safe and respectful</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
                            Reason for Report
                        </label>
                        <select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full rounded-xl border border-white/10 bg-[#161824] px-4 py-3 text-sm text-white focus:border-red-500 focus:outline-none"
                        >
                            <option value="harassment">Harassment / Bullying</option>
                            <option value="spam">Spam or Misleading Content</option>
                            <option value="inappropriate_content">Inappropriate Content</option>
                            <option value="fake_profile">Fake Profile / Impersonation</option>
                            <option value="scam">Scam or Fraud</option>
                            <option value="other">Other Violation</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
                            Details & Description
                        </label>
                        <textarea
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Please describe what happened and why you are reporting this..."
                            className="w-full rounded-xl border border-white/10 bg-[#161824] p-4 text-sm text-white placeholder-white/20 focus:border-red-500 focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-white/60 transition hover:bg-white/5 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
                        >
                            {submitting && <FiLoader className="animate-spin" />}
                            Submit Report
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
