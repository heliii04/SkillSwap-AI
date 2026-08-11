import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Navigate,
    useLocation,
    useNavigate,
} from "react-router-dom";

import {
    FiCheckCircle,
    FiMail,
} from "react-icons/fi";

import { useAuth } from "../../hooks/useAuth";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function VerifyOtp() {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        verifyEmail,
        resendOtp,
    } = useAuth();

    const email = location.state?.email;

    const [otp, setOtp] = useState(
        Array(OTP_LENGTH).fill("")
    );

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] =
        useState("");

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [isResending, setIsResending] =
        useState(false);

    const [countdown, setCountdown] =
        useState(RESEND_SECONDS);

    const inputRefs = useRef([]);

    useEffect(() => {
        if (countdown <= 0) {
            return undefined;
        }

        const timer = window.setInterval(() => {
            setCountdown((current) =>
                Math.max(current - 1, 0)
            );
        }, 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, [countdown]);

    if (!email) {
        return (
            <Navigate
                to="/register"
                replace
            />
        );
    }

    function handleOtpChange(index, value) {
        const digit = value
            .replace(/\D/g, "")
            .slice(-1);

        const updatedOtp = [...otp];
        updatedOtp[index] = digit;

        setOtp(updatedOtp);
        setError("");

        if (
            digit &&
            index < OTP_LENGTH - 1
        ) {
            inputRefs.current[index + 1]?.focus();
        }
    }

    function handleKeyDown(index, event) {
        if (
            event.key === "Backspace" &&
            !otp[index] &&
            index > 0
        ) {
            inputRefs.current[index - 1]?.focus();
        }
    }

    function handlePaste(event) {
        event.preventDefault();

        const pastedOtp = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, OTP_LENGTH);

        if (!pastedOtp) {
            return;
        }

        const updatedOtp =
            Array(OTP_LENGTH).fill("");

        pastedOtp.split("").forEach(
            (digit, index) => {
                updatedOtp[index] = digit;
            }
        );

        setOtp(updatedOtp);

        const focusIndex = Math.min(
            pastedOtp.length,
            OTP_LENGTH - 1
        );

        inputRefs.current[focusIndex]?.focus();
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const verificationCode = otp.join("");

        if (
            verificationCode.length !== OTP_LENGTH
        ) {
            setError(
                "Enter the complete 6-digit OTP."
            );
            return;
        }

        setIsSubmitting(true);
        setError("");
        setSuccessMessage("");

        try {
            await verifyEmail({
                email,
                otp: verificationCode,
            });

            navigate("/dashboard", {
                replace: true,
            });
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleResendOtp() {
        if (
            countdown > 0 ||
            isResending
        ) {
            return;
        }

        setIsResending(true);
        setError("");
        setSuccessMessage("");

        try {
            const result =
                await resendOtp(email);

            setSuccessMessage(
                result.message ||
                "A new OTP has been sent."
            );

            setCountdown(RESEND_SECONDS);
            setOtp(
                Array(OTP_LENGTH).fill("")
            );

            inputRefs.current[0]?.focus();
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsResending(false);
        }
    }

    return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070707] px-4 py-16 text-white">
            <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[160px]" />

            <div className="relative w-full max-w-lg rounded-[32px] border border-white/10 bg-[#0d0d0d]/95 p-6 text-center shadow-2xl shadow-orange-950/20 sm:p-9">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-2xl text-orange-400">
                    <FiMail />
                </div>

                <h1 className="mt-6 text-3xl font-bold">
                    Verify your email
                </h1>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
                    We sent a six-digit verification
                    code to
                </p>

                <p className="mt-1 break-all text-sm font-medium text-orange-400">
                    {email}
                </p>

                {error && (
                    <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-left text-sm text-red-300">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-left text-sm text-emerald-300">
                        <FiCheckCircle className="mt-0.5 shrink-0" />
                        {successMessage}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="mt-8"
                >
                    <div
                        className="flex justify-center gap-2 sm:gap-3"
                        onPaste={handlePaste}
                    >
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(element) => {
                                    inputRefs.current[
                                        index
                                    ] = element;
                                }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(event) =>
                                    handleOtpChange(
                                        index,
                                        event.target
                                            .value
                                    )
                                }
                                onKeyDown={(event) =>
                                    handleKeyDown(
                                        index,
                                        event
                                    )
                                }
                                aria-label={`OTP digit ${index + 1
                                    }`}
                                className="h-13 w-11 rounded-xl border border-white/10 bg-white/[0.04] text-center text-xl font-bold outline-none transition focus:border-orange-500 focus:bg-orange-500/[0.05] sm:h-14 sm:w-14"
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-8 w-full rounded-xl bg-orange-500 px-5 py-3.5 text-sm  text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60 font-bold"
                    >
                        {isSubmitting
                            ? "Verifying..."
                            : "Verify Email"}
                    </button>
                </form>

                <div className="mt-7 text-sm text-gray-500">
                    Didn&apos;t receive the code?
                </div>

                <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={
                        countdown > 0 ||
                        isResending
                    }
                    className="mt-2 font-medium text-orange-400 transition hover:text-orange-300 disabled:cursor-not-allowed disabled:text-gray-600"
                >
                    {isResending
                        ? "Sending..."
                        : countdown > 0
                            ? `Resend in ${countdown}s`
                            : "Resend OTP"}
                </button>
            </div>
        </main>
    );
}