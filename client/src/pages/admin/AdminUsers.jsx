import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FiLoader, FiToggleLeft, FiToggleRight } from "react-icons/fi";
import axiosClient from "../../api/axiosClient";

export default function AdminUsers() {
    const [searchParams] = useSearchParams();
    const currentSection = searchParams.get("section") || "users";

    const [usersList, setUsersList] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);

    const fetchUsersList = async () => {
        setUsersLoading(true);
        try {
            const response = await axiosClient.get("/admin/users");
            setUsersList(response.data?.data || []);
        } catch (err) {
            console.error("Error fetching users list:", err);
        } finally {
            setUsersLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsersList();
        }, 0);
        return () => clearTimeout(timer);
    }, []);

    const handleToggleUserStatus = async (userId) => {
        try {
            const response = await axiosClient.put(`/admin/users/${userId}/status`);
            const updatedUser = response.data?.data;
            if (updatedUser) {
                setUsersList((prev) => prev.map((u) => (u._id === userId ? updatedUser : u)));
            }
        } catch (err) {
            console.error("Error toggling user status:", err);
            alert("Failed to toggle user status.");
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="rounded-3xl border border-white/10 bg-[#0d0e15] p-6">
                <h2 className="text-lg font-bold mb-4">
                    {currentSection === "suspended-users" ? "Suspended Accounts" : "All Platform Users"}
                </h2>
                {usersLoading ? (
                    <div className="flex justify-center py-10">
                        <FiLoader className="text-2xl text-orange-500 animate-spin" />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 text-xs font-bold uppercase text-white/60">
                                    <th className="py-3 px-4">Name</th>
                                    <th className="py-3 px-4">Email</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Registered</th>
                                    <th className="py-3 px-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {usersList
                                    .filter((u) => currentSection !== "suspended-users" || u.accountStatus === "suspended")
                                    .map((u) => (
                                        <tr key={u._id} className="hover:bg-white/[0.01]">
                                            <td className="py-3 px-4 font-semibold">{u.name}</td>
                                            <td className="py-3 px-4 text-white/60">{u.email}</td>
                                            <td className="py-3 px-4">
                                                <span
                                                    className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                        u.accountStatus === "suspended"
                                                            ? "bg-red-500/10 text-red-400"
                                                            : "bg-emerald-500/10 text-emerald-400"
                                                    }`}
                                                >
                                                    {u.accountStatus}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-white/40">
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <button
                                                    onClick={() => handleToggleUserStatus(u._id)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                                                        u.accountStatus === "suspended"
                                                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                                                            : "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20"
                                                    }`}
                                                >
                                                    {u.accountStatus === "suspended" ? <FiToggleRight /> : <FiToggleLeft />}
                                                    {u.accountStatus === "suspended" ? "Activate" : "Suspend"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
