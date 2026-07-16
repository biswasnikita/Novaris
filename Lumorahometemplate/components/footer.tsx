import { Orbit, Github } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-slate-900 border-t border-slate-700/30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-8 md:px-12">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Orbit className="h-6 w-6 text-cyan-400" />
          <span className="text-lg font-medium text-white tracking-tight">Novaris</span>
        </Link>

        {/* Social Links */}
        <div className="flex items-center gap-6">
          <Link
            href="#"
            className="text-slate-400 transition-colors hover:text-white"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </Link>
          <Link
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 transition-colors hover:text-white"
            aria-label="X (formerly Twitter)"
          >
            <svg
              className="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </Link>
        </div>

        {/* Legal Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="text-sm text-slate-400 transition-colors hover:text-white"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-sm text-slate-400 transition-colors hover:text-white"
          >
            Terms Of Use
          </Link>
        </div>
      </div>
    </footer>
  );
}
