"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "../public/3DARG/logos/3dargwhite.svg";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-gray-200 border-t border-gray-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 py-12">
        {/* Top */}
        <div className="grid grid-cols-12 gap-8 mb-8">
          {/* Branding (≈ 1/4) */}
          <div className="col-span-12 md:col-span-3 flex flex-col items-start">
            <Image src={Logo} width={150} height={150} alt="3DARG logo" />
            <p className=" text-2xl font-mono font-bold italic text-white">
              Walk into the future.
            </p>
          </div>

          {/* Links (≈ 3/4) */}
          <div className="col-span-12 md:col-span-9">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {/* Products */}
              <div>
                <h4 className="text-white font-semibold mb-4">Products</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/products" className="hover:text-white transition">
                      Categories
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition">
                      Offers
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition">
                      New
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div>
                <h4 className="text-white font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="#" className="hover:text-white transition">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition">
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition">
                      Shipments
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="text-white font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="#" className="hover:text-white transition">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-white transition">
                      Terms & Conditions
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-center text-sm text-gray-400">
            © {currentYear} 3DARG. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};