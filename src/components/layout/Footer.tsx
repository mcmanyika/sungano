"use client";

import { motion } from "framer-motion";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import Link from "next/link";
import { footerLinks, siteConfig } from "@/lib/data";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

/** X (Twitter) icon — not in Lucide under that name */
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const socialLinks = [
  { label: "Facebook", href: "#", icon: FacebookIcon },
  { label: "X", href: "#", icon: XIcon },
  { label: "YouTube", href: "#", icon: YoutubeIcon },
  { label: "WhatsApp", href: "#", icon: WhatsAppIcon },
  { label: "Telegram", href: "#", icon: Send },
];

export function Footer() {
  return (
    <footer id="contact" className="border-t border-neutral-200 bg-neutral-900 text-neutral-300 dark:border-neutral-800">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold text-white">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-bold">
                {siteConfig.initials}
              </span>
              {siteConfig.shortName}
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-neutral-400">
              A peaceful national movement committed to defending constitutional democracy through lawful action and civic participation.
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2 hover:text-white">
                <Mail className="h-4 w-4" /> {siteConfig.email}
              </a>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> +263 4 123 4567
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Harare, Zimbabwe
              </p>
            </div>
          </div>

          {/* About links */}
          <div>
            <h3 className="mb-4 font-semibold text-white">About</h3>
            <ul className="space-y-2">
              {footerLinks.about.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Links</h3>
            <ul className="space-y-2">
              {footerLinks.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                    {...(link.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal + Social */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Connect</h3>
            <ul className="mb-6 space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ scale: 1.1 }}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-800 text-neutral-400 transition-colors hover:bg-primary hover:text-white"
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-800 pt-8 text-center text-sm text-neutral-500">
          <p>&copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
          <p className="mt-2">
            Developed by{" "}
            <a
              href="https://www.partsonmanyika.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-400 transition-colors hover:text-white"
            >
              Manyika
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
