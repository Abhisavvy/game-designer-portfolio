"use client";

import Link from "next/link";
import Image from "next/image";
import { defaultPortfolioContent } from "../data/site-content";
import { User, Briefcase, Mail, FileText, Zap } from "lucide-react";

const nav = [
  { href: "/#work", label: "Work", icon: Briefcase },  
  { href: "/#skills", label: "Skills", icon: Zap },
  { href: "/#about", label: "About", icon: User },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/#contact", label: "Contact", icon: Mail },
];

export function SiteHeader() {
  const brand = defaultPortfolioContent.siteMeta.siteName;

  return (
    <header className="fixed top-0 z-50 w-full border-b border-orange-500/30 bg-gradient-to-r from-orange-600/95 to-orange-500/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6">
        <Link
          href="/"
          aria-label="Go to homepage - Abhishek Dutta Portfolio"
          className="flex items-center space-x-2 sm:space-x-3 flex-shrink min-w-0 text-sm font-semibold tracking-tight text-white transition 
                     hover:text-orange-200 focus:text-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 
                     focus:ring-offset-2 focus:ring-offset-orange-600 rounded-md"
        >
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden flex-shrink-0">
            {/* Custom icon background */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-orange-500"></div>
            
            {/* Custom brand icon */}
            <div className="absolute inset-0 flex items-center justify-center p-1.5">
              <Image 
                src="/icon.svg" 
                alt="Brand Icon"
                width={20}
                height={20}
                className="w-full h-full object-contain filter brightness-0 invert"
              />
            </div>
          </div>
          <span className="font-display text-sm sm:text-base tracking-wide hidden sm:inline-block truncate min-w-0" style={{ fontFamily: 'Quicksand, Poppins, system-ui, sans-serif', fontWeight: '600', letterSpacing: '0.5px' }}>
            Abhishek in a nutshell
          </span>
        </Link>
        <nav id="navigation" className="flex items-center justify-end gap-x-3 sm:gap-x-4 text-sm sm:text-base text-white/90" role="navigation" aria-label="Main navigation">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-label={`Navigate to ${item.label} section`}
              className="flex items-center space-x-1.5 transition-all duration-200 
                         hover:text-white hover:bg-white/15 focus:text-white focus:bg-white/20
                         focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2 focus:ring-offset-orange-600
                         px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg font-bold whitespace-nowrap hover:scale-105 focus:scale-105"
            >
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" aria-hidden="true" />
              <span className="hidden md:inline">{item.label}</span>
              <span className="md:hidden sr-only">{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
