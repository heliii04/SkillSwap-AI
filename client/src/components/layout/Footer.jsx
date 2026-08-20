import { Link } from "react-router-dom";
import {
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaXTwitter,
  FaArrowRight,
  FaLocationDot,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#07080D]">

      {/* Main Footer Links & Contact Info */}
      <div className="mx-auto max-w-[1500px] px-5 pt-12 pb-6 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr_1fr_1.3fr]">

          {/* Brand */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              SkillSwap
              <span className="text-orange-500"> AI</span>
            </h2>

            <p className="mt-6 max-w-sm leading-8 text-white/45">
              Learn, teach and grow together through AI-powered
              recommendations and meaningful skill exchange.
            </p>

            {/* Social */}
            <div className="mt-8 flex gap-4">
              {[
                FaGithub,
                FaLinkedin,
                FaInstagram,
                FaXTwitter,
              ].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="
                    flex h-12 w-12
                    items-center justify-center
                    rounded-xl
                    border border-white/10
                    bg-[#111218]
                    text-lg text-white/60
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:border-orange-500
                    hover:bg-orange-500
                    hover:text-white
                  "
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white">
              Quick Links
            </h3>

            <div className="mt-6 space-y-4">
              {[
                { name: "Home", path: "/" },
                { name: "Browse Skills", path: "/browse-skills" },
                { name: "How It Works", path: "/how-it-works" },
                { name: "About", path: "/about" },
                { name: "Contact", path: "/contact" },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="
                    block
                    text-white/45
                    transition-all duration-300
                    hover:translate-x-1
                    hover:text-orange-400
                  "
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold text-white">
              Resources
            </h3>

            <div className="mt-6 space-y-4">
              {[
                { name: "Privacy Policy", path: "/privacy" },
                { name: "Terms & Conditions", path: "/terms" },
                { name: "Help Center", path: "/help" },
                { name: "FAQ", path: "/faq" },
                { name: "Support", path: "/support" },
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="
                    block
                    text-white/45
                    transition-all duration-300
                    hover:translate-x-1
                    hover:text-orange-400
                  "
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Information Column */}
          <div>
            <h3 className="text-lg font-semibold text-white">
              Contact & Connect
            </h3>

            <div className="mt-6 space-y-5">

              {/* Find The Developer On */}
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 text-xl">
                  <FaLocationDot />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Find The Developer on</h4>
                  <div className="mt-1 flex items-center gap-3 text-white/60">
                    <a
                      href="https://github.com/heliii04"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                      className="transition-colors hover:text-orange-400 text-base"
                    >
                      <FaGithub />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/heli-vyas04"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="transition-colors hover:text-orange-400 text-base"
                    >
                      <FaLinkedin />
                    </a>
                  </div>
                </div>
              </div>

              {/* Call Us */}
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 text-xl">
                  <FaPhone />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Call us</h4>
                  <p className="text-sm text-white/45">+91 9023955998</p>
                </div>
              </div>

              {/* Mail Us */}
              <div className="flex items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 text-xl">
                  <FaEnvelope />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Mail us</h4>
                  <p className="text-sm text-white/45">vyasheli04@gmail.com</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Stay Updated Section - HORIZONTAL LAYOUT */}
        <div className="mt-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mt-[80px]">
          <div className="max-w-xl">
            <h3 className="text-xl font-bold text-white">
              Stay Updated
            </h3>
            <p className="mt-2 text-sm leading-6 text-white/45">
              Subscribe to receive AI learning tips, new mentors and platform updates.
            </p>
          </div>

          <div className="w-full lg:w-auto lg:min-w-[580px] xl:min-w-[650px]">
            <div className="flex w-full rounded-2xl border border-white/10 bg-[#111218] p-2 transition-all focus-within:border-orange-500/50">
              <input
                type="email"
                placeholder="Enter your email"
                style={{ border: "none", boxShadow: "none", outline: "none" }}
                className="
                  w-full
                  flex-1
                  bg-transparent
                  px-4
                  py-1
                  text-sm
                  text-white
                  placeholder:text-white/25
                "
              />

              <button
                className="
                  flex h-10 w-35 shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-orange-500
                  text-white
                  transition-all duration-300
                  hover:bg-orange-400
                  font-bold"
              > Subscribe&nbsp;&nbsp;<FaArrowRight className="animate-arrow-move" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* 100% Full-Width Edge-to-Edge Divider Line */}
      <div className="w-full h-px bg-white/10" />

      {/* Bottom Bar */}
      <div className="mx-auto max-w-[1500px] px-5 py-5 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">

          <p className="text-sm text-white/35">
            © 2026 SkillSwap AI. All rights reserved.
          </p>

          {/* Designer Credit */}
          <div className="group flex items-center gap-2 text-sm">
            <span className="text-white/35">
              Designed & Developed by
            </span>

            <span
              className="
                relative
                cursor-default
                font-signature
                text-lg
                font-normal
                tracking-wide
                text-orange-400
                transition-all
                duration-300
                group-hover:text-orange-400
                group-hover:scale-105
                inline-block
              "
            >
              Heli Vyas

              <span
                className="
                  absolute
                  -bottom-0.5
                  left-0
                  h-px
                  w-0
                  bg-gradient-to-r from-orange-500 to-amber-300
                  transition-all
                  duration-300
                  group-hover:w-full
                "
              />
            </span>
          </div>

          <div className="flex gap-8">
            <Link
              to="/privacy"
              className="text-sm text-white/35 hover:text-orange-400 transition"
            >
              Privacy
            </Link>

            <Link
              to="/terms"
              className="text-sm text-white/35 hover:text-orange-400 transition"
            >
              Terms
            </Link>

            <Link
              to="/privacy"
              className="text-sm text-white/35 hover:text-orange-400 transition"
            >
              Cookies
            </Link>
          </div>

        </div>
      </div>

    </footer>
  );
}