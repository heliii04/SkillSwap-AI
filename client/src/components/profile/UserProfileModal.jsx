import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
    HiOutlineCheckBadge,
    HiOutlineMapPin,
    HiOutlineXMark,
    HiOutlineUserGroup,
    HiOutlineStar,
    HiOutlineBookOpen,
    HiOutlineAcademicCap,
    HiOutlineSparkles,
    HiOutlineArrowRight
} from "react-icons/hi2";
import axiosClient from "../../api/axiosClient";
import useLockBodyScroll from "../../hooks/useLockBodyScroll";

const getMatchBadgeStyle = (score) => {
    if (score >= 80) return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    if (score >= 60) return "border-[#ff5a00]/30 bg-[#ff5a00]/10 text-[#ff5a00]";
    return "border-white/20 bg-white/5 text-white/60";
};

export default function UserProfileModal({ userId, matchScore, onClose }) {
    const navigate = useNavigate();
    useLockBodyScroll();
    const [user, setUser] = useState(null);
    const [teachSkills, setTeachSkills] = useState([]);
    const [learnSkills, setLearnSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [chatId, setChatId] = useState(null);

    // Swap request states
    const [isRequestingSwap, setIsRequestingSwap] = useState(false);
    const [myTeachSkills, setMyTeachSkills] = useState([]);
    const [swapFormData, setSwapFormData] = useState({
        senderSkillId: "",
        receiverSkillId: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenSwapForm = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get("/skills/teach");
            const mySkills = res.data?.data?.skills || [];
            
            if (mySkills.length === 0) {
                toast.warning("You must add at least one 'Teach Skill' in your profile before sending a match request.", { toastId: "no-skills" });
                onClose();
                navigate("/my-profile");
                return;
            }
            
            setMyTeachSkills(mySkills);
            setSwapFormData({
                senderSkillId: mySkills[0]?._id || mySkills[0]?.id || "",
                receiverSkillId: teachSkills.length > 0 ? (teachSkills[0]._id || teachSkills[0].id) : "",
                message: ""
            });
            setIsRequestingSwap(true);
        } catch (error) {
            toast.error("Failed to fetch your skills.");
        } finally {
            setLoading(false);
        }
    };

    const handleSendSwapRequest = async () => {
        if (!swapFormData.senderSkillId || !swapFormData.receiverSkillId) {
            toast.error("Please select skills to swap.");
            return;
        }
        
        try {
            setIsSubmitting(true);
            await axiosClient.post("/swap-requests", {
                receiverId: userId,
                senderSkillId: swapFormData.senderSkillId,
                receiverSkillId: swapFormData.receiverSkillId,
                message: swapFormData.message
            });
            toast.success("Match request sent successfully!");
            onClose();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to send match request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (!userId) return;

        let isMounted = true;
        setLoading(true);

        axiosClient
            .get(`/profile/user/${userId}`)
            .then((res) => {
                if (isMounted) {
                    setUser(res.data?.data?.user);
                    setTeachSkills(res.data?.data?.teachSkills || []);
                    setLearnSkills(res.data?.data?.learnSkills || []);
                    setIsConnected(res.data?.data?.isConnected || false);
                    setChatId(res.data?.data?.chatId || null);
                }
            })
            .catch((err) => {
                toast.error(
                    err?.response?.data?.message || "User profile could not be loaded.",
                    { toastId: "profile-error" }
                );
                onClose();
            })
            .finally(() => {
                if (isMounted) {
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [userId, onClose]);

    if (!userId) return null;

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
            <button
                type="button"
                aria-label="Close profile details"
                onClick={onClose}
                className="absolute inset-0 h-full w-full cursor-default font-bold"
            />

            <div className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-[24px] border border-white/10 bg-[#121319] shadow-2xl flex flex-col">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#121319]/95 px-5 py-5 backdrop-blur-xl sm:px-7">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#ff5a00]">
                            MENTOR PROFILE
                        </p>
                        <h2 className="mt-1 text-[22px] font-semibold text-white tracking-wide">
                            Skill partner details
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-white/10 p-2 text-white/50 transition hover:bg-white/5 hover:text-white font-bold"
                    >
                        <HiOutlineXMark className="text-xl" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto p-5 sm:p-7 flex-1 space-y-7 custom-scrollbar">
                    {loading ? (
                        <div className="flex h-48 items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ff5a00] border-t-transparent" />
                        </div>
                    ) : isRequestingSwap ? (
                        <div className="space-y-5">
                            <h3 className="text-lg font-semibold text-white">Request a Skill Swap</h3>
                            <p className="text-sm text-white/60">Choose the skill you want to offer and the skill you want to learn from {user?.name}.</p>
                            
                            <div>
                                <label className="mb-2 block text-sm font-medium text-white/80">I will teach:</label>
                                <select 
                                    value={swapFormData.senderSkillId}
                                    onChange={(e) => setSwapFormData({...swapFormData, senderSkillId: e.target.value})}
                                    className="w-full rounded-xl border border-white/10 bg-[#090a0f] px-4 py-3 text-sm text-white outline-none focus:border-orange-500/60"
                                >
                                    {myTeachSkills.map(skill => (
                                        <option key={skill._id || skill.id} value={skill._id || skill.id}>{skill.title}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label className="mb-2 block text-sm font-medium text-white/80">I want to learn:</label>
                                <select 
                                    value={swapFormData.receiverSkillId}
                                    onChange={(e) => setSwapFormData({...swapFormData, receiverSkillId: e.target.value})}
                                    className="w-full rounded-xl border border-white/10 bg-[#090a0f] px-4 py-3 text-sm text-white outline-none focus:border-orange-500/60"
                                >
                                    {teachSkills.length > 0 ? (
                                        teachSkills.map(skill => (
                                            <option key={skill._id || skill.id} value={skill._id || skill.id}>{skill.title}</option>
                                        ))
                                    ) : (
                                        <option value="">No skills available</option>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-white/80">Message (Optional):</label>
                                <textarea 
                                    rows="3"
                                    value={swapFormData.message}
                                    onChange={(e) => setSwapFormData({...swapFormData, message: e.target.value})}
                                    placeholder="Say hi and explain why you're a good match..."
                                    className="w-full rounded-xl border border-white/10 bg-[#090a0f] px-4 py-3 text-sm text-white outline-none focus:border-orange-500/60 resize-none"
                                />
                            </div>
                        </div>
                    ) : !user ? (
                        <div className="flex h-48 items-center justify-center">
                            <p className="text-white/50">Profile not found.</p>
                        </div>
                    ) : (
                        <>
                            {/* Avatar Section */}
                            <div className="flex flex-col sm:flex-row items-start justify-between gap-5">
                                <div className="flex gap-4">
                                    <div className="shrink-0">
                                        {user.avatar && !imageError ? (
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                loading="lazy"
                                                decoding="async"
                                                className="h-20 w-20 rounded-[20px] object-cover sm:h-[84px] sm:w-[84px]"
                                                onError={() => setImageError(true)}
                                            />
                                        ) : (
                                            <div className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-[#ff5a00] text-2xl font-bold text-black sm:h-[84px] sm:w-[84px]">
                                                {user.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "U"}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-1">
                                        <h3 className="text-[22px] font-semibold text-white flex items-center gap-2 tracking-wide">
                                            {user.name}
                                            {user.isEmailVerified && (
                                                <HiOutlineCheckBadge className="text-emerald-500 text-[18px]" title="Verified Member" />
                                            )}
                                        </h3>
                                        
                                        <p className="text-[15px] text-white/60 font-light mt-0.5">
                                            {user.headline || "SkillSwap member"}
                                        </p>

                                        <div className="mt-3 flex items-center gap-4 text-xs text-white/40">
                                            {user.location?.city && (
                                                <div className="flex items-center gap-1.5">
                                                    <HiOutlineMapPin className="text-[#ff5a00] text-sm" />
                                                    {user.location.city}
                                                    {user.location.country ? `, ${user.location.country}` : ""}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1.5">
                                                <HiOutlineUserGroup className="text-[#ff5a00] text-sm" />
                                                {user.preferredMode || "Online"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {matchScore && (
                                    <div className="shrink-0 mt-2 sm:mt-0">
                                        <span className={`rounded-full border px-4 py-1.5 text-[11px] font-medium ${getMatchBadgeStyle(matchScore)}`}>
                                            {matchScore}% match
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Bio Section */}
                            {user.bio && (
                                <div className="rounded-[16px] border border-white/5 bg-[#171821] p-5">
                                    <p className="whitespace-pre-wrap text-[15px] font-light leading-relaxed text-white/70">
                                        {user.bio}
                                    </p>
                                </div>
                            )}

                            {/* Stats Section */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="rounded-[16px] border border-white/5 bg-[#171821] p-5">
                                    <HiOutlineStar className="text-[#ff5a00] text-xl mb-3" />
                                    <p className="text-2xl font-semibold text-white">{user.rating || 0}</p>
                                    <p className="text-[11px] text-white/40 mt-1">Rating</p>
                                </div>
                                <div className="rounded-[16px] border border-white/5 bg-[#171821] p-5">
                                    <HiOutlineBookOpen className="text-[#ff5a00] text-xl mb-3" />
                                    <p className="text-2xl font-semibold text-white">{user.reviews || 0}</p>
                                    <p className="text-[11px] text-white/40 mt-1">Reviews</p>
                                </div>
                                <div className="rounded-[16px] border border-white/5 bg-[#171821] p-5">
                                    <HiOutlineAcademicCap className="text-[#ff5a00] text-xl mb-3" />
                                    <p className="text-2xl font-semibold text-white">{user.sessions || 0}</p>
                                    <p className="text-[11px] text-white/40 mt-1">Sessions</p>
                                </div>
                            </div>

                            {/* Skills Section */}
                            <div className="grid sm:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-[15px] font-semibold text-white mb-4">
                                        Skills they teach
                                    </h4>
                                    <div className="flex flex-wrap gap-2.5">
                                        {teachSkills.length > 0 ? (
                                            teachSkills.map((skill) => (
                                                <span key={skill._id} className="rounded-lg border border-[#ff5a00]/30 bg-[#ff5a00]/5 px-4 py-2 text-[13px] text-[#ff5a00]">
                                                    {skill.title}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-[13px] text-white/30">None listed.</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-[15px] font-semibold text-white mb-4">
                                        Skills they want
                                    </h4>
                                    <div className="flex flex-wrap gap-2.5">
                                        {learnSkills.length > 0 ? (
                                            learnSkills.map((skill) => (
                                                <span key={skill._id} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-[13px] text-white/60">
                                                    {skill.title}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-[13px] text-white/30">None listed.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Match Banner */}
                            <div className="rounded-[16px] border border-[#ff5a00]/20 bg-gradient-to-r from-[#211612] to-[#171821] p-5 flex items-start gap-4">
                                <HiOutlineSparkles className="text-[#ff5a00] text-2xl shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-[17px] font-semibold text-white">
                                        Strong skill match
                                    </h4>
                                    <p className="text-[14px] text-white/50 mt-1.5 font-light">
                                        This user has relevant teaching skills and may be suitable for a mutual skill exchange.
                                    </p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                
                {/* Footer */}
                <div className="border-t border-white/5 bg-[#121319]/95 px-5 py-5 sm:px-7 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            if (isRequestingSwap) setIsRequestingSwap(false);
                            else onClose();
                        }}
                        className="rounded-xl border border-white/5 bg-[#171821] px-6 py-3 text-[14px] text-white/60 hover:bg-white/5 hover:text-white transition font-bold"
                    >
                        {isRequestingSwap ? "Back" : "Close"}
                    </button>
                    {isRequestingSwap ? (
                        <button
                            type="button"
                            onClick={handleSendSwapRequest}
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#ff5a00] px-6 py-3 text-[14px] font-bold text-black hover:bg-[#ff5a00]/90 transition disabled:opacity-50"
                        >
                            {isSubmitting ? "Sending..." : "Send Request"}
                        </button>
                    ) : user && isConnected ? (
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                navigate(`/messages?chatId=${chatId}`);
                            }}
                            className="font-bold inline-flex items-center gap-2 rounded-xl bg-[#ff5a00] px-6 py-3 text-[14px] text-black hover:bg-[#ff5a00]/90 transition"
                        >
                            Open Chat
                            <HiOutlineArrowRight className="text-[16px] animate-arrow-move" />
                        </button>
                    ) : user && (
                        <button
                            type="button"
                            onClick={handleOpenSwapForm}
                            className="font-bold inline-flex items-center gap-2 rounded-xl bg-[#ff5a00] px-6 py-3 text-[14px] text-black hover:bg-[#ff5a00]/90 transition"
                        >
                            Send match request
                            <HiOutlineArrowRight className="text-[16px] animate-arrow-move" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
