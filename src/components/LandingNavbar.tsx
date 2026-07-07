"use client";

import Link from "next/link";
import { Sparkles, Menu, X } from "lucide-react";
import { useState } from "react";

export default function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-dark/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-light" />
            <span className="text-xl font-bold gradient-text">AIForge</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-light-3 hover:text-light transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-light-3 hover:text-light transition-colors">
              Pricing
            </a>
            <Link
              href="/auth/login"
              className="text-light-3 hover:text-light transition-colors"
            >
              Login
            </Link>
            <Link href="/auth/signup" className="btn-primary !py-2 !px-5">
              Get Started
            </Link>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-light"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-dark-2">
          <div className="px-4 py-4 space-y-3">
            <a
              href="#features"
              onClick={() => setIsOpen(false)}
              className="block text-light-3 hover:text-light py-2"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={() => setIsOpen(false)}
              className="block text-light-3 hover:text-light py-2"
            >
              Pricing
            </a>
            <Link
              href="/auth/login"
              onClick={() => setIsOpen(false)}
              className="block text-light-3 hover:text-light py-2"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              onClick={() => setIsOpen(false)}
              className="block btn-primary text-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
