import { Link } from "react-router-dom";
import {
  FaGithub,
  FaLinkedin,
  FaInstagram,
  FaXTwitter,
  FaArrowRight,
} from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#07080D]">

      <div className="mx-auto max-w-[1500px] px-5 py-20 sm:px-8 lg:px-12 xl:px-16">

        {/* Top */}

        <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr_1fr_1.2fr]">

          {/* Brand */}

          <div>

            <h2 className="text-3xl font-bold tracking-tight text-white">
              SkillSwap
              <span className="text-orange-500">AI</span>
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

          {/* Newsletter */}

          <div>

            <h3 className="text-lg font-semibold text-white">
              Stay Updated
            </h3>

            <p className="mt-5 leading-7 text-white/45">
              Subscribe to receive AI learning tips, new mentors and
              platform updates.
            </p>

            <div className="mt-7">

              <div className="flex rounded-2xl border border-white/10 bg-[#111218] p-2">

                <input
                  type="email"
                  placeholder="Enter your email"
                  className="
                    flex-1
                    bg-transparent
                    px-4
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-white/25
                  "
                />

                <button
                  className="
                    flex h-12 w-12
                    items-center
                    justify-center
                    rounded-xl
                    bg-orange-500
                    text-white
                    transition-all duration-300
                    hover:bg-orange-400
                   font-bold"
                >
                  <FaArrowRight className="animate-arrow-move" />
                </button>

              </div>

            </div>

          </div>

        </div>

        {/* Divider */}

        <div className="my-12 h-px bg-white/10" />

        {/* Bottom */}

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
        font-semibold
        tracking-wide
        text-white/80
        transition-all
        duration-300
        group-hover:text-orange-400
      "
            >
              Heli Vyas

              <span
                className="
          absolute
          -bottom-1
          left-0
          h-px
          w-0
          bg-orange-500
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