"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  slug: string;
  ctaRegister: string;
  ctaLogin: string;
  containerClass: string;
  registerClass: string;
  loginClass: string;
  loggedInLabel?: string;
  loggedInClass?: string;
  loggedInHref?: string;
}

export function CommunityAuthCTAs({
  slug,
  ctaRegister,
  ctaLogin,
  containerClass,
  registerClass,
  loginClass,
  loggedInLabel = "Ver mi perfil",
  loggedInClass,
  loggedInHref,
}: Props) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return (
      <div className={containerClass}>
        <Link
          href={loggedInHref ?? `/${slug}/profile`}
          className={loggedInClass ?? registerClass}
        >
          {loggedInLabel}
        </Link>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <Link href={`/${slug}/auth/register`} className={registerClass}>
        {ctaRegister}
      </Link>
      <Link href={`/${slug}/auth/login`} className={loginClass}>
        {ctaLogin}
      </Link>
    </div>
  );
}
