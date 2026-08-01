import { useMemo, useState, useEffect, useRef } from "react";
import {
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { toast } from "react-toastify";


import {
  HiOutlineAcademicCap,
  HiOutlineBars3,
  HiOutlineBell,
  HiOutlineBookOpen,
  HiOutlineChatBubbleLeftRight,
  HiOutlineHome,
  HiOutlineMagnifyingGlass,
  HiOutlinePaperAirplane,
  HiOutlineSparkles,
  HiOutlineUser,
  HiOutlineXMark,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineFlag,
  HiOutlineCog6Tooth,
  HiOutlineChartBar,
  HiOutlineCpuChip,
  HiOutlineListBullet,
  HiOutlineArrowPath
} from "react-icons/hi2";

import { FiLogOut } from "react-icons/fi";

import { useAuth } from "../context/AuthContext";
import { getAccessToken } from "../api/tokenStore";
import { io } from "socket.io-client";

const navigationItems = [
  {
    label: "Overview",
    path: "/dashboard",
    icon: HiOutlineHome,
  },
  // {
  //   label: "My Profile",
  //   path: "/profile",
  //   icon: HiOutlineUser,
  // },
  {
    label: "Skills I Teach",
    path: "/skills/teach",
    icon: HiOutlineAcademicCap,
  },
  {
    label: "Skills I Want",
    path: "/skills/learn",
    icon: HiOutlineBookOpen,
  },
  {
    label: "Discover",
    path: "/search",
    icon: HiOutlineMagnifyingGlass,
  },
  {
    label: "AI Matches",
    path: "/recommendations",
    icon: HiOutlineSparkles,
  },
  {
    label: "Requests",
    path: "/requests",
    icon: HiOutlinePaperAirplane,
  },
  {
    label: "Messages",
    path: "/messages",
    icon: HiOutlineChatBubbleLeftRight,
  },
];

const adminNavigationItems = [
  {
    label: "Dashboard",
    path: "/admin?section=dashboard",
    icon: HiOutlineHome,
  },
  {
    label: "All Users",
    path: "/admin?section=users",
    icon: HiOutlineUser,
  },
  {
    label: "Suspended Users",
    path: "/admin?section=suspended-users",
    icon: HiOutlineXMark,
  },
  {
    label: "All Skills",
    path: "/admin?section=skills",
    icon: HiOutlineAcademicCap,
  },
  {
    label: "Reported Skills",
    path: "/admin?section=reported-skills",
    icon: HiOutlineFlag,
  },
  {
    label: "Swap Requests",
    path: "/admin?section=swaps",
    icon: HiOutlineArrowPath,
  },
  {
    label: "Reports & Moderation",
    path: "/admin?section=reports",
    icon: HiOutlineFlag,
  },
  {
    label: "Reported Messages",
    path: "/admin?section=reported-messages",
    icon: HiOutlineChatBubbleLeftRight,
  },
  // {
  //   label: "Notifications",
  //   path: "/admin?section=notifications",
  //   icon: HiOutlineBell,
  // },
  {
    label: "Analytics",
    path: "/admin?section=analytics",
    icon: HiOutlineChartBar,
  },
  {
    label: "AI Insights",
    path: "/admin?section=ai-insights",
    icon: HiOutlineCpuChip,
  },
  // {
  //   label: "Settings",
  //   path: "/admin?section=settings",
  //   icon: HiOutlineCog6Tooth,
  // },
  {
    label: "Audit Logs",
    path: "/admin?section=audit-logs",
    icon: HiOutlineListBullet,
  },
];

const getPageTitle = (pathname) => {
  if (pathname === "/dashboard") {
    return {
      title: "Dashboard",
      subtitle: "Your learning and teaching workspace",
    };
  }
  if (pathname === "/profile") {
    return {
      title: "My Profile",
      subtitle: "Manage your personal profile and settings",
    };
  }
  if (pathname.startsWith("/search")) {
    return {
      title: "Discover",
      subtitle: "Explore skills and find mentors",
    };
  }
  if (pathname.startsWith("/recommendations")) {
    return {
      title: "AI Matches",
      subtitle: "People you should swap skills with, and why",
    };
  }
  if (pathname.startsWith("/messages")) {
    return {
      title: "Messages",
      subtitle: "Connect and chat with your matches",
    };
  }
  if (pathname.startsWith("/notifications")) {
    return {
      title: "Notifications",
      subtitle: "Stay updated with request activities and message alerts",
    };
  }
  if (pathname.startsWith("/skills")) {
    return {
      title: "Skills",
      subtitle: "Manage your skills and learning goals",
    };
  }
  return {
    title: "Workspace",
    subtitle: "Your learning and teaching workspace",
  };
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] =
    useState(false);
  const [collapsed, setCollapsed] =
    useState(false);

  const [logoutLoading, setLogoutLoading] =
    useState(false);

  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    const handleServiceWorkerMessage = (event) => {
      if (event.data && event.data.type === "NAVIGATE") {
        navigate(event.data.url);
      }
    };
    if (navigator.serviceWorker) {
      navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
    }
    return () => {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
      }
    };
  }, [navigate]);

  // For notification popups (in-app and system-level)
  const knownNotificationsRef = useRef(new Set());
  const currentUserRef = useRef(null);
  const isFirstFetchRef = useRef(true);

  if (user?._id !== currentUserRef.current && user?.id !== currentUserRef.current) {
    knownNotificationsRef.current = new Set();
    currentUserRef.current = user?._id || user?.id;
    isFirstFetchRef.current = true;
  }

  // Request browser notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  // Initial load of unread notifications count
  useEffect(() => {
    let isMounted = true;
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    const fetchUnreadCount = async () => {
      try {
        const token = getAccessToken();
        if (!token) return;

        const headers = {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        };

        const response = await fetch(`${API_URL}/notifications`, { credentials: "include", headers });
        if (response.ok && isMounted) {
          const resData = await response.json();
          const list = resData?.data?.notifications || [];
          const unreadCount = list.filter(n => !n.isRead).length;
          setUnreadNotificationsCount(unreadCount);
        }
      } catch (err) {
        console.error("Error fetching initial notifications count:", err);
      }
    };

    fetchUnreadCount();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Real-time notifications via Socket.io
  useEffect(() => {
    const token = getAccessToken();
    if (!token || !user) return;

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const socketHost = API_URL.replace("/api", "");

    const socket = io(socketHost, {
      withCredentials: true,
    });

    const currentUserId = user.id || user._id;
    socket.emit("register_user", currentUserId);

    socket.on("new_notification", (notification) => {
      // 1. Increment count
      setUnreadNotificationsCount(prev => prev + 1);

      // 2. Skip showing toast alerts for new messages if the user is currently on the Messages page
      if (notification.type === "message" && window.location.pathname === "/messages") {
        return;
      }

      // 3. Trigger toast popup in-app
      toast(
        <div className="flex flex-col gap-1 cursor-pointer" onClick={() => {
          if (notification.link) {
            navigate(notification.link);
          }
        }}>
          <span className="font-semibold text-white/95">{notification.title}</span>
          <span className="text-xs text-white/70 line-clamp-2">{notification.message}</span>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "dark",
        }
      );

      // 4. Trigger system/browser notification if not active/focused
      if (!document.hasFocus() && "Notification" in window && Notification.permission === "granted") {
        try {
          const sysNotif = new Notification(notification.title, {
            body: notification.message,
            icon: "/favicon.svg",
          });
          sysNotif.onclick = () => {
            window.focus();
            if (notification.link) {
              navigate(notification.link);
            }
          };
        } catch (err) {
          console.error("System notification error:", err);
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user, navigate]);

  const initials = useMemo(() => {
    const name =
      user?.name?.trim() || "User";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part[0]?.toUpperCase()
      )
      .join("");
  }, [user?.name]);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);

      await logout();

      navigate("/login", {
        replace: true,
      });
    } finally {
      setLogoutLoading(false);
    }
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-[#07080d] text-white">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[#0b0c12] transition-all duration-300 lg:translate-x-0 ${sidebarOpen
          ? "translate-x-0"
          : "-translate-x-full"
          } ${collapsed ? "lg:w-20" : "lg:w-72"} w-72`}
      >
        {collapsed ? (
          <div className="flex h-20 items-center justify-center border-b border-white/10 px-2">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex items-center justify-center"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 font-bold text-black">
                S
              </span>
            </button>
          </div>
        ) : (
          <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-3"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 font-bold text-black">
                S
              </span>

              <span className="text-lg font-semibold whitespace-nowrap">
                SkillSwap
                <span className="ml-1 text-orange-500">AI</span>
              </span>
            </button>

            <div className="flex items-center gap-1.5">
              {/* Desktop Toggle Button inside sidebar (above the line) */}
              <button
                type="button"
                onClick={() => setCollapsed(true)}
                className="hidden lg:flex rounded-xl p-2.5 border border-white/10 bg-white/[0.03] text-white/60 transition hover:bg-white/5 hover:text-white"
                title="Collapse sidebar"
              >
                <HiOutlineChevronLeft className="text-xl" />
              </button>

              {/* Mobile Close Button */}
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-xl p-2 text-white/50 transition hover:bg-white/5 hover:text-white lg:hidden"
              >
                <HiOutlineXMark className="text-2xl" />
              </button>
            </div>
          </div>
        )}

        <nav className={`flex-1 overflow-y-auto ${collapsed ? "px-2" : "px-4"} py-6 ${collapsed ? "space-y-4" : "space-y-1"}`}>
          {/* Desktop Toggle Sidebar Collapse Button (below the line) - ONLY when collapsed */}
          {collapsed && (
            <div className="hidden lg:flex items-center justify-center">
              <button
                type="button"
                onClick={() => setCollapsed(false)}
                className="rounded-xl p-2 border border-white/10 bg-white/[0.03] text-white/60 transition hover:bg-white/5 hover:text-white"
                title="Expand sidebar"
              >
                <HiOutlineChevronRight className="text-lg" />
              </button>
            </div>
          )}

          {!collapsed && (
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/25">
              {user?.role === "admin" && location.pathname.startsWith("/admin") ? "Admin Panel" : "Workspace"}
            </p>
          )}

          <div className="space-y-1">
            {(user?.role === "admin" && location.pathname.startsWith("/admin") ? adminNavigationItems : navigationItems).map(
              ({
                label,
                path,
                icon: Icon,
              }) => (
                <NavLink
                  key={path}
                  to={path}
                  title={collapsed ? label : undefined}
                  onClick={() =>
                    setSidebarOpen(
                      false
                    )
                  }
                  className={() => {
                    const isItemActive = location.pathname + location.search === path ||
                      (path === "/admin?section=dashboard" && location.pathname === "/admin" && location.search === "");
                    return `flex items-center ${collapsed ? "justify-center px-0 py-3" : "gap-3 px-3 py-3"} rounded-xl text-sm font-medium transition ${isItemActive
                      ? "bg-orange-500 text-black shadow-lg shadow-orange-500/20"
                      : "text-white/55 hover:bg-white/5 hover:text-white"
                      }`;
                  }}
                >
                  <Icon className="text-xl shrink-0" />

                  {!collapsed && (
                    <span className="truncate">
                      {label}
                    </span>
                  )}
                </NavLink>
              )
            )}
          </div>
        </nav>

        <div className={`border-t border-white/10 ${collapsed ? "p-2" : "p-4"}`}>
          <button
            type="button"
            onClick={() =>
              navigate("/profile")
            }
            title={collapsed ? user?.name || "User" : undefined}
            className={`flex w-full items-center ${collapsed ? "justify-center p-2" : "gap-3 p-3"} rounded-2xl bg-white/[0.04] text-left transition hover:bg-white/[0.07]`}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500 font-bold text-black">
              {initials}
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  {user?.name ||
                    "User"}
                </p>

                <p className="truncate text-xs text-white/35">
                  {user?.email ||
                    "No email available"}
                </p>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutLoading}
            title={collapsed ? "Sign out" : undefined}
            className={`mt-3 flex w-full items-center ${collapsed ? "justify-center px-0 py-3" : "justify-center gap-2 px-4 py-3"} rounded-xl border border-white/10 text-sm font-semibold text-white/55 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50`}
          >
            <FiLogOut className="text-lg shrink-0" />

            {!collapsed && (
              <span>
                {logoutLoading
                  ? "Signing out..."
                  : "Sign out"}
              </span>
            )}
          </button>
        </div>
      </aside>

      <div className={`min-h-screen transition-all duration-300 ${collapsed ? "lg:pl-20" : "lg:pl-72"}`}>
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#07080d]/90 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="rounded-xl border border-white/10 p-2.5 text-white/60 transition hover:bg-white/5 hover:text-white lg:hidden"
              >
                <HiOutlineBars3 className="text-2xl" />
              </button>



              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-orange-500 font-semibold">
                  {pageTitle.title}
                </p>

                <h2 className="mt-1 hidden text-sm font-medium text-white/60 sm:block">
                  {pageTitle.subtitle}
                </h2>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  navigate("/")
                }
                title="Go to Home"
                className="rounded-xl border border-white/10 p-3 text-white/55 transition hover:bg-white/5 hover:text-white"
              >
                <HiOutlineHome className="text-xl" />
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/notifications"
                  )
                }
                className="relative rounded-xl border border-white/10 p-3 text-white/55 transition hover:bg-white/5 hover:text-white"
              >
                <HiOutlineBell className="text-xl" />

                {unreadNotificationsCount > 0 && (
                  <span className="absolute right-2 top-2 flex h-4 w-4 -translate-y-1 translate-x-1 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-black ring-2 ring-[#07080d]">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/profile")
                }
                className="hidden items-center gap-3 border-l border-white/10 pl-3 sm:flex"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-sm font-bold text-black">
                  {initials}
                </div>

                <div className="max-w-40 text-left">
                  <p className="truncate text-sm font-semibold">
                    {user?.name ||
                      "User"}
                  </p>

                  <p className="truncate text-xs text-white/35">
                    Verified member
                  </p>
                </div>
              </button>
            </div>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
}