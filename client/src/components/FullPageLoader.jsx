export default function FullPageLoader() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#070707]">
            <div className="text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-orange-500" />

                <p className="mt-4 text-sm text-gray-400">
                    Loading SkillSwap AI...
                </p>
            </div>
        </div>
    );
}