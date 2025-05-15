"use client";

import { useState } from "react";
import { MenuIcon, X } from "lucide-react";
import Logo from "@/src/ui/Logo";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <>
      {/* Header container */}
      <div className="bg-white border-b border-gray-200 shadow-sm py-3 px-4 md:px-6 relative z-50">
        <div className="max-w-6xl mx-auto">
          {/* Desktop Header */}
          <div className="hidden md:flex justify-between items-center">
            <div>
              <Logo />
            </div>
            <div className="text-right">
              <h1 className="text-md font-bold text-custom-blue">
                Your intelligent conversation assistant
              </h1>
              <div className="flex justify-end gap-1.5">
                <p className="text-xs subtitle">Powered by</p>
                <span className="text-xs text-gray-500">Llama 3.0</span>
              </div>
            </div>
          </div>

          {/* Mobile Header */}
          <div className="flex md:hidden justify-between items-center">
            <Logo />
            <button
              className="p-2 rounded-md focus:outline-none"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-600" />
              ) : (
                <MenuIcon className="h-6 w-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu - absolute and separate */}
      <div
        className={`md:hidden absolute top-[60px] left-0 w-full bg-white border-t border-gray-100 shadow transition-all duration-300 overflow-hidden z-40 ${
          isMenuOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="py-3 text-center">
          <h1 className="text-md font-bold text-custom-blue">
            Your intelligent conversation assistant
          </h1>
          <div className="flex justify-center gap-1.5 mt-1">
            <p className="text-xs subtitle">Powered by</p>
            <span className="text-xs text-gray-500">Llama 3.0</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
