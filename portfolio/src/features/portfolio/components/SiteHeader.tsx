"use client";

import Link from "next/link";
import { defaultPortfolioContent } from "../data/site-content";
import { Zap, User, Briefcase, Mail, FileText } from "lucide-react";

const nav = [
  { href: "/#about", label: "About", icon: User },
  { href: "/#work", label: "Work", icon: Briefcase },  
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/#contact", label: "Contact", icon: Mail },
];

export function SiteHeader() {
  const brand = defaultPortfolioContent.siteMeta.siteName;

  return (
    <header className="fixed top-0 z-50 w-full border-b border-orange-500/30 bg-gradient-to-r from-orange-600/95 to-orange-500/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="flex items-center space-x-3 truncate text-sm font-semibold tracking-tight text-white transition hover:text-orange-200"
        >
          <div className="relative w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
            {/* Geometric background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-orange-500"></div>
            <div className="absolute top-0 right-0 w-3 h-3 bg-orange-700/20 rounded-bl-lg"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-white/30 rounded-tr-lg"></div>
            
            {/* Stylized AD monogram */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" className="text-white">
                {/* Custom A and D letterforms */}
                <path 
                  d="M4 20L8 6h2l4 14h-2l-1-3H7l-1 3H4zm3-5h4l-2-6-2 6z" 
                  fill="currentColor"
                />
                <path 
                  d="M16 6h3c2 0 4 1.5 4 4v4c0 2.5-2 4-4 4h-3V6zm2 2v10h1c1 0 2-1 2-2v-4c0-1-1-2-2-2h-1z" 
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
          <span className="font-display text-base tracking-wide" style={{ fontFamily: 'Quicksand, Poppins, system-ui, sans-serif', fontWeight: '600', letterSpacing: '0.5px' }}>Abhishek in a nutshell</span>
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm text-orange-100/80">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center space-x-1 transition hover:text-white hover:bg-white/10 px-2 py-1 rounded-md font-bold"
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
