import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import {
  FaArrowRight,
  FaSignOutAlt,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, authLoading, logout } = useAuth();

  const isAuthenticated = Boolean(user);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const navLinkClass = ({ isActive }) =>
    `relative transition-colors duration-300 hover:text-orange-400 ${isActive ? "text-orange-400" : "text-white/70"
    }`;

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    await logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <header
      className={`
        fixed left-0 right-0 top-0 z-50
        transition-all duration-500
        ${scrolled
          ? "border-b border-white/10 bg-[#07080d]/90 shadow-[0_12px_40px_rgba(0,0,0,0.3)] backdrop-blur-xl"
          : "bg-transparent"
        }
      `}
    >
      <nav
        className="
          mx-auto flex w-full max-w-[1500px]
          items-center justify-between
          px-5 py-4
          sm:px-8
          lg:px-12
          xl:px-16
        "
      >
        {/* Logo */}

        <Link
          to="/"
          className="flex items-center gap-3"
          onClick={closeMenu}
        >
          <div
            className="
              flex h-10 w-10 items-center justify-center
              rounded-xl
              bg-gradient-to-br from-orange-400 to-orange-600
              text-sm font-black text-white
              shadow-[0_0_25px_rgba(249,115,22,0.35)]
            "
          >
            S
          </div>

          <div>
            <p className="text-xl font-bold tracking-tight text-white">
              SkillSwap
              <span className="text-orange-400"> AI</span>
            </p>

            <p className="hidden text-[9px] uppercase tracking-[0.28em] text-white/35 sm:block">
              Learn · Teach · Grow
            </p>
          </div>
        </Link>

        {/* Desktop links */}

        <ul className="hidden items-center gap-8 text-sm font-medium lg:flex">
          <li>
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
          </li>

          <li>
            <NavLink to="/browse-skills" className={navLinkClass}>
              Browse Skills
            </NavLink>
          </li>

          <li>
            <NavLink to="/how-it-works" className={navLinkClass}>
              How It Works
            </NavLink>
          </li>

          <li>
            <NavLink to="/about" className={navLinkClass}>
              About
            </NavLink>
          </li>

          <li>
            <NavLink to="/contact" className={navLinkClass}>
              Contact
            </NavLink>
          </li>
        </ul>

        {/* Desktop actions */}

        <div className="hidden items-center gap-4 lg:flex">
          {authLoading ? (
            <div className="h-11 w-36 animate-pulse rounded-full bg-white/10" />
          ) : isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="
                  group flex items-center gap-3
                  rounded-full
                  bg-gradient-to-r from-orange-500 to-orange-600
                  px-6 py-3
                  text-sm font-semibold text-white
                  shadow-[0_0_30px_rgba(249,115,22,0.3)]
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:from-orange-400 hover:to-orange-500
                "
              >
                Dashboard

                <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="
                  flex items-center gap-2
                  rounded-full border border-white/15
                  px-5 py-3
                  text-sm font-medium text-white/75
                  transition
                  hover:border-orange-500/50
                  hover:text-orange-400
                "
              >
                <FaSignOutAlt />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="
                  px-3 py-2
                  text-sm font-medium text-white/75
                  transition hover:text-orange-400
                "
              >
                Login
              </Link>

              <Link
                to="/register"
                className="
                  group flex items-center gap-3
                  rounded-full
                  bg-gradient-to-r from-orange-500 to-orange-600
                  px-6 py-3
                  text-sm font-semibold text-white
                  shadow-[0_0_30px_rgba(249,115,22,0.3)]
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:from-orange-400 hover:to-orange-500
                "
              >
                Get Started

                <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() =>
            setMenuOpen((currentValue) => !currentValue)
          }
          className="
            flex h-11 w-11 items-center justify-center
            rounded-xl border border-white/10
            bg-white/5
            text-2xl text-white
            backdrop-blur-md
            lg:hidden
          "
        >
          {menuOpen ? <IoClose /> : <HiOutlineMenuAlt3 />}
        </button>
      </nav>

      {/* Mobile menu */}

      <div
        className={`
          overflow-hidden border-t border-white/10
          bg-[#0b0c12]/95
          backdrop-blur-xl
          transition-all duration-500
          lg:hidden
          ${menuOpen
            ? "max-h-[650px] opacity-100"
            : "max-h-0 border-transparent opacity-0"
          }
        `}
      >
        <div className="flex flex-col gap-1 px-5 py-5">
          <NavLink
            to="/"
            onClick={closeMenu}
            className="rounded-xl px-4 py-3 text-white/80 hover:bg-white/5"
          >
            Home
          </NavLink>

          <NavLink
            to="/browse-skills"
            onClick={closeMenu}
            className="rounded-xl px-4 py-3 text-white/80 hover:bg-white/5"
          >
            Browse Skills
          </NavLink>

          <NavLink
            to="/how-it-works"
            onClick={closeMenu}
            className="rounded-xl px-4 py-3 text-white/80 hover:bg-white/5"
          >
            How It Works
          </NavLink>

          <NavLink
            to="/about"
            onClick={closeMenu}
            className="rounded-xl px-4 py-3 text-white/80 hover:bg-white/5"
          >
            About
          </NavLink>

          <NavLink
            to="/contact"
            onClick={closeMenu}
            className="rounded-xl px-4 py-3 text-white/80 hover:bg-white/5"
          >
            Contact
          </NavLink>

          <div className="mt-4">
            {authLoading ? (
              <div className="h-12 w-full animate-pulse rounded-xl bg-white/10" />
            ) : isAuthenticated ? (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/dashboard"
                  onClick={closeMenu}
                  className="
                    rounded-xl
                    bg-orange-500
                    px-4 py-3
                    text-center font-semibold text-white
                    transition hover:bg-orange-400
                  "
                >
                  Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="
                    flex items-center justify-center gap-2
                    rounded-xl border border-white/15
                    px-4 py-3
                    font-medium text-white
                    transition
                    hover:border-orange-500/50
                    hover:text-orange-400
                  "
                >
                  <FaSignOutAlt />
                  Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="
                    rounded-xl border border-white/15
                    px-4 py-3
                    text-center font-medium text-white
                  "
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="
                    rounded-xl
                    bg-orange-500
                    px-4 py-3
                    text-center font-semibold text-white
                  "
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header >
  );
}