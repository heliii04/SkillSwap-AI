import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid md:grid-cols-4 gap-10">

          {/* Logo */}
          <div>
            <h2 className="text-2xl font-bold text-indigo-400">
              SkillSwap AI
            </h2>

            <p className="mt-4 text-sm leading-7">
              Learn skills from amazing people,
              teach what you know and grow together.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              Quick Links
            </h3>

            <ul className="space-y-3">
              <li>
                <Link to="/">Home</Link>
              </li>

              <li>
                <Link to="/search">Browse Skills</Link>
              </li>

              <li>
                <Link to="/login">Login</Link>
              </li>

              <li>
                <Link to="/register">Register</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              Support
            </h3>

            <ul className="space-y-3">
              <li>Help Center</li>

              <li>Privacy Policy</li>

              <li>Terms & Conditions</li>

              <li>Contact</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              Follow Us
            </h3>

            <div className="flex gap-5 text-2xl">
              <a href="#">
                <FaGithub />
              </a>

              <a href="#">
                <FaLinkedin />
              </a>

              <a href="#">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>

        <hr className="my-8 border-slate-700" />
        <p className="text-center text-sm">
          © 2026 SkillSwap AI. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}