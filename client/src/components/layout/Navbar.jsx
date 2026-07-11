import { Link, NavLink } from "react-router-dom";
import { HiOutlineMenuAlt3 } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          to="/"
          className="text-3xl font-bold text-indigo-600"
        >
          SkillSwap AI
        </Link>

        {/* Desktop Menu */}
        <ul className="hidden md:flex items-center gap-8 text-gray-700 font-medium">
          <li>
            <NavLink to="/" className="hover:text-indigo-600">
              Home
            </NavLink>
          </li>

          <li>
            <NavLink to="/search" className="hover:text-indigo-600">
              Browse Skills
            </NavLink>
          </li>

          <li>
            <NavLink to="/" className="hover:text-indigo-600">
              How It Works
            </NavLink>
          </li>

          <li>
            <NavLink to="/" className="hover:text-indigo-600">
              About
            </NavLink>
          </li>

          <li>
            <NavLink to="/" className="hover:text-indigo-600">
              Contact
            </NavLink>
          </li>
        </ul>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            to="/login"
            className="text-indigo-600 font-medium hover:text-indigo-800"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Register
          </Link>
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden text-3xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <IoClose /> : <HiOutlineMenuAlt3 />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="flex flex-col px-6 py-5 space-y-4">
            <NavLink to="/" onClick={() => setMenuOpen(false)}>
              Home
            </NavLink>

            <NavLink to="/search" onClick={() => setMenuOpen(false)}>
              Browse Skills
            </NavLink>

            <NavLink to="/" onClick={() => setMenuOpen(false)}>
              How It Works
            </NavLink>

            <NavLink to="/" onClick={() => setMenuOpen(false)}>
              About
            </NavLink>

            <NavLink to="/" onClick={() => setMenuOpen(false)}>
              Contact
            </NavLink>

            <Link
              to="/login"
              className="text-indigo-600"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>

            <Link
              to="/register"
              className="bg-indigo-600 text-white text-center py-2 rounded-lg"
              onClick={() => setMenuOpen(false)}
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}