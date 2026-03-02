"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { clearTokens } from "@/lib/authClient";
import { apiFetch } from "@/lib/api";

type NavbarProps = {
  onMenuClickAction: () => void;
};

type ProfileUpdatedDetail = {
  profile_image?: string | null;
  email?: string | null;
};

export default function Navbar({ onMenuClickAction }: NavbarProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [email, setEmail] = useState<string>("-");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfileSummary() {
      try {
        const data = await apiFetch<unknown>("/api/profile", {
          method: "GET",
          cache: "no-store",
        });

        if (!active || !data || typeof data !== "object") return;
        const obj = data as Record<string, unknown>;
        const profileObj =
          obj.profile && typeof obj.profile === "object"
            ? (obj.profile as Record<string, unknown>)
            : obj;

        const nextEmail =
          typeof profileObj.email === "string" && profileObj.email.trim().length > 0
            ? profileObj.email
            : "-";
        const nextProfileImage =
          typeof profileObj.profile_image === "string" && profileObj.profile_image.trim().length > 0
            ? profileObj.profile_image
            : null;

        setEmail(nextEmail);
        setProfileImage(nextProfileImage);
      } catch {
        // keep fallback values; navbar should remain stable even if profile fails
      }
    }

    loadProfileSummary();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleProfileUpdated(event: Event) {
      const customEvent = event as CustomEvent<ProfileUpdatedDetail>;
      const detail = customEvent.detail;
      if (!detail) return;

      if (typeof detail.profile_image === "string" || detail.profile_image === null) {
        setProfileImage(detail.profile_image ?? null);
      }
      if (typeof detail.email === "string" && detail.email.trim().length > 0) {
        setEmail(detail.email);
      }
    }

    window.addEventListener("profile-updated", handleProfileUpdated as EventListener);
    return () => {
      window.removeEventListener("profile-updated", handleProfileUpdated as EventListener);
    };
  }, []);

  const initials = useMemo(() => {
    if (!email || email === "-") return "U";
    return email.trim()[0]?.toUpperCase() || "U";
  }, [email]);

  const profileImageUrl = useMemo(() => {
    if (!profileImage) return null;
    if (/^https?:\/\//i.test(profileImage)) return profileImage;

    const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
    const cleaned = profileImage.replace(/^\//, "");
    return base ? `${base}/uploads/${cleaned}` : `/uploads/${cleaned}`;
  }, [profileImage]);

  const handleLogout = async () => {
    setMenuOpen(false);
    clearTokens();
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth?view=sign-in");
  };

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleGoProfile = () => {
    setMenuOpen(false);
    router.push("/admin/profile");
  };

  const handleGoSetting = () => {
    setMenuOpen(false);
    router.push("/admin/settings");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/80 backdrop-blur">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 lg:hidden"
            onClick={onMenuClickAction}
            aria-label="Open sidebar"
          >
            ☰
          </button>
          <div>
            <p className="text-sm font-medium text-zinc-900">Admin Portal</p>
            <p className="text-xs text-zinc-500">Welcome back</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className="flex items-center gap-3 rounded-md bg-white px-3 py-2 hover:bg-zinc-50"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              aria-label="Open account menu"
            >
              <span className="max-w-36 truncate text-sm text-zinc-600 sm:max-w-45">{email}</span>
              <div className="h-8 w-8 overflow-hidden rounded-full bg-zinc-100">
                {profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-zinc-600">
                    {initials}
                  </div>
                )}
              </div>
            </button>

            {menuOpen ? (
              <div
                className="absolute right-0 mt-2 w-44 overflow-hidden rounded-md border border-zinc-200 bg-white py-1 shadow-lg"
                role="menu"
                aria-label="Account menu"
              >
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                  onClick={handleGoProfile}
                  role="menuitem"
                >
                  Profile
                </button>
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
                  onClick={handleGoSetting}
                  role="menuitem"
                >
                  Setting
                </button>
                <div className="my-1 border-t border-zinc-100" />
                <button
                  type="button"
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  onClick={handleLogout}
                  role="menuitem"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
