import { useState, useEffect } from "react";
import { HiOutlineStar } from "react-icons/hi2";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";

export default function RatingStarStrip({ targetUser, swapRequestId = null, initialMyRating = 0, className = "" }) {
    const targetUserId = targetUser?.id || targetUser?._id || (typeof targetUser === "string" ? targetUser : null);
    const targetName = targetUser?.name || "Mentor";

    const [myRating, setMyRating] = useState(initialMyRating || targetUser?.myRating || 0);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!targetUserId) return;
        let isMounted = true;

        axiosClient.get(`/reviews/my/${targetUserId}`)
            .then((res) => {
                if (isMounted && res.data?.data?.myRating !== undefined) {
                    setMyRating(res.data.data.myRating);
                }
            })
            .catch(() => { });

        return () => {
            isMounted = false;
        };
    }, [targetUserId]);

    useEffect(() => {
        if (!targetUserId) return;

        const handleRatingUpdate = (e) => {
            const { userId: updatedId, myRating: updatedMyRating } = e.detail || {};
            if (updatedId && targetUserId && updatedId.toString() === targetUserId.toString() && updatedMyRating !== undefined) {
                setMyRating(updatedMyRating);
            }
        };

        window.addEventListener("user_rating_updated", handleRatingUpdate);
        return () => {
            window.removeEventListener("user_rating_updated", handleRatingUpdate);
        };
    }, [targetUserId]);

    const handleRatingClick = async (selectedRating) => {
        if (!targetUserId) return;

        try {
            setMyRating(selectedRating);
            setSubmitting(true);

            const res = await axiosClient.post("/reviews", {
                targetUserId: targetUserId,
                rating: selectedRating,
                swapRequestId: swapRequestId,
            });

            const stats = res.data?.data?.targetUserStats;
            const myRatingVal = res.data?.data?.myRating || selectedRating;

            window.dispatchEvent(
                new CustomEvent("user_rating_updated", {
                    detail: {
                        userId: targetUserId,
                        rating: stats?.rating,
                        reviews: stats?.reviews,
                        myRating: myRatingVal,
                    },
                })
            );

            toast.success(`Rated ${selectedRating} stars for ${targetName}!`);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to submit star rating.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!targetUserId) return null;

    return (
        <div className={`rounded-[16px] border border-orange-500/20 bg-orange-500/[0.03] px-4 py-3 flex items-center justify-between flex-wrap gap-2 ${className}`}>
            <span className="text-xs font-medium text-white/80">
                Rate {targetName}'s mentorship:
            </span>
            <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        disabled={submitting}
                        onClick={() => handleRatingClick(star)}
                        className="text-lg transition hover:scale-125 disabled:opacity-50"
                        title={`Rate ${star} star${star > 1 ? "s" : ""}`}
                    >
                        <HiOutlineStar
                            className={
                                star <= myRating
                                    ? "text-orange-400 fill-orange-400"
                                    : "text-white/30"
                            }
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
