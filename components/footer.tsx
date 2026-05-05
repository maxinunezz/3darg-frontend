"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "../public/3DARG/logos/3dargwhite.svg";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-gray-200 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-12 gap-8 mb-8">
          {/* Branding */}
          <div className="col-span-12 md:col-span-3 flex flex-col items-start gap-3">
            <Image src={Logo} width={150} height={60} alt="3DARG logo" />
            <p className="text-xl font-mono font-bold italic text-white">
              Walk into the future.
            </p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Impresión 3D personalizada en Argentina. Diseños únicos para cada necesidad.
            </p>
          </div>

          <div className="col-span-12 md:col-span-9">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {/* Tienda */}
              <div>
                <h4 className="text-white font-semibold mb-4">Tienda</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/shop" className="hover:text-white transition-colors">
                      Todos los productos
                    </Link>
                  </li>
                  <li>
                    <Link href="/cart" className="hover:text-white transition-colors">
                      Mi carrito
                    </Link>
                  </li>
                  <li>
                    <Link href="/profile" className="hover:text-white transition-colors">
                      Mis pedidos
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Soporte */}
              <div>
                <h4 className="text-white font-semibold mb-4">Cuenta</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link href="/login" className="hover:text-white transition-colors">
                      Iniciar sesión
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="hover:text-white transition-colors">
                      Registrarse
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Legal */}
              <div>
                <h4 className="text-white font-semibold mb-4">3DARG</h4>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a
                      href="https://instagram.com/3darg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      Instagram
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://wa.me/5491100000000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition-colors"
                    >
                      WhatsApp
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-400">
          <p>© {currentYear} 3DARG. Todos los derechos reservados.</p>
          <p>Hecho en Argentina 🇦🇷</p>
        </div>
      </div>
    </footer>
  );
};
