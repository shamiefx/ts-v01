"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

type UserProfile = {
  email: string | null;
  full_name: string | null;
  dob: string | null;
  gender: string | null;
  profile_image: string | null;
  bio: string | null;
  address: string | null;
  created_at: string | null;
  updated_at: string | null;
};

function normalizeProfile(input: unknown): UserProfile {
  const empty: UserProfile = {
    email: null,
    full_name: null,
    dob: null,
    gender: null,
    profile_image: null,
    bio: null,
    address: null,
    created_at: null,
    updated_at: null,
  };

  if (!input || typeof input !== "object") return empty;
  const obj = input as Record<string, unknown>;

  // Update endpoint returns { message, profile: { ... } }
  const maybeProfile = obj.profile && typeof obj.profile === "object" ? (obj.profile as Record<string, unknown>) : obj;

  const pick = (k: keyof UserProfile) => {
    const v = maybeProfile[k] as unknown;
    return typeof v === "string" ? v : v === null ? null : null;
  };

  return {
    email: pick("email"),
    full_name: pick("full_name"),
    dob: pick("dob"),
    gender: pick("gender"),
    profile_image: pick("profile_image"),
    bio: pick("bio"),
    address: pick("address"),
    created_at: pick("created_at"),
    updated_at: pick("updated_at"),
  };
}

function getProfileImageUrl(profile_image: string | null) {
  if (!profile_image) return null;
  if (/^https?:\/\//i.test(profile_image)) return profile_image;
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");

  // Per USERPROFILE_API_GUIDE.md, profile_image is stored as: profile_images/<filename>
  // In most CI4 setups, these are served from a public /uploads folder.
  // If your backend uses a different public path, adjust here.
  if (base) return `${base}/uploads/${profile_image.replace(/^\//, "")}`;

  return `/uploads/${profile_image.replace(/^\//, "")}`;
}

// Small icon helpers (no extra libs)
function Icon({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border bg-white ${className}`}>
      {children}
    </span>
  );
}

export default function ProfilePage() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [messageSuccess, setMessageSuccess] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    dob: "",
    gender: "",
    bio: "",
    address: "",
  });

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setLoadError(null);
        setMessageError(null);
        setMessageSuccess(null);
        const data = await apiFetch<unknown>("/api/profile", {
          method: "GET",
          cache: "no-store",
        });

        if (!active) return;

        const p = normalizeProfile(data);
        setProfile(p);
        setForm({
          full_name: p.full_name ?? "",
          dob: p.dob ?? "",
          gender: p.gender ?? "",
          bio: p.bio ?? "",
          address: p.address ?? "",
        });
      } catch (err) {
        if (!active) return;
        setLoadError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  // Cleanup any object URL previews on unmount/change.
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (messageSuccess) {
      const timer = setTimeout(() => setMessageSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [messageSuccess]);

  const user = profile;

  const initials = useMemo(() => {
    const parts = (user?.full_name || "User").trim().split(/\s+/);
    const a = parts[0]?.[0] || "U";
    const b = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return (a + b).toUpperCase();
  }, [user?.full_name]);

  const subtitle = "Full Stack Developer"; // not in your JSON, set from your app
  const location = user?.address || "-";

  const profileImageSrc = localPreview
    ? localPreview
    : getProfileImageUrl(user?.profile_image ?? null);

  const handlePickImage = () => fileRef.current?.click();

  // Resize and center-crop image to 256x256 (1:1 aspect ratio)
  const resizeAndCropImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const size = 256;
          canvas.width = size;
          canvas.height = size;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          // Calculate center-crop coordinates (1:1 aspect ratio)
          const sourceSize = Math.min(img.width, img.height);
          const sx = (img.width - sourceSize) / 2;
          const sy = (img.height - sourceSize) / 2;

          // Draw center-cropped image scaled to 256x256
          ctx.drawImage(img, sx, sy, sourceSize, sourceSize, 0, 0, size, size);

          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error("Failed to create image blob"));
              return;
            }
            const resizedFile = new File([blob], file.name, { type: "image/jpeg" });
            resolve(resizedFile);
          }, "image/jpeg", 0.9);
        };
        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // Quick client-side checks (API also validates)
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(f.type)) {
      setMessageError("Invalid file type. Allowed: jpg, png, gif, webp.");
      e.target.value = "";
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setMessageError("File too large (max 2MB).");
      e.target.value = "";
      return;
    }

    setMessageError(null);
    setMessageSuccess(null);

    try {
      setUploading(true);

      // Resize and crop image to 110x110
      const resizedFile = await resizeAndCropImage(f);

      // Show preview of resized image
      const url = URL.createObjectURL(resizedFile);
      setLocalPreview(url);

      const fd = new FormData();
      fd.set("profile_image", resizedFile, resizedFile.name);

      const data = await apiFetch<unknown>("/api/profile/image", {
        method: "POST",
        body: fd,
      });

      const obj = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
      const newPath = obj && typeof obj.profile_image === "string" ? obj.profile_image : null;
      if (!newPath) {
        throw new Error("Upload succeeded but no profile_image path was returned");
      }

      setProfile((prev) => (prev ? { ...prev, profile_image: newPath } : prev));
      setMessageSuccess("Profile image updated.");
      setLocalPreview(null);
      e.target.value = "";
    } catch (err) {
      setMessageError(err instanceof Error ? err.message : "Failed to upload profile image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setMessageError(null);
    setMessageSuccess(null);

    const fullName = form.full_name.trim();
    if (!fullName) {
      setMessageError("Full name is required.");
      return;
    }
    if (form.dob.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(form.dob.trim())) {
      setMessageError("DOB must be in YYYY-MM-DD format.");
      return;
    }

    const payload: Record<string, unknown> = {
      full_name: fullName,
      dob: form.dob.trim() ? form.dob.trim() : null,
      gender: form.gender.trim() ? form.gender.trim() : null,
      bio: form.bio.trim() ? form.bio.trim() : null,
      address: form.address.trim() ? form.address.trim() : null,
    };

    try {
      setSaving(true);
      const data = await apiFetch<unknown>("/api/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      const p = normalizeProfile(data);
      setProfile(p);
      setForm({
        full_name: p.full_name ?? "",
        dob: p.dob ?? "",
        gender: p.gender ?? "",
        bio: p.bio ?? "",
        address: p.address ?? "",
      });
      setEditMode(false);
      setMessageSuccess("Profile updated.");
    } catch (err) {
      setMessageError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="">
      <div className="mb-6">
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-zinc-900">Profile</h1>
            <p className="mt-2 text-sm text-zinc-600">Manage your profile information</p>
        </div>

        {loading ? (
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="text-zinc-600">Loading profile...</div>
          </div>
        ) : loadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-800">Error: {loadError}</p>
            <div className="mt-3">
              <button
                type="button"
                className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        ) : !user ? (
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="text-zinc-600">No profile data.</div>
          </div>
        ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-4 space-y-6">
            {/* Profile Card */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center text-center">
                {/* Avatar + Upload */}
                <div className="relative">
                  <div className="h-28 w-28 overflow-hidden rounded-full border bg-zinc-50">
                    {profileImageSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={profileImageSrc}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-zinc-600">
                        {initials}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handlePickImage}
                    className="absolute -bottom-2 right-0 rounded-full border bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm hover:bg-zinc-50"
                    title="Upload photo"
                    disabled={uploading}
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                <h2 className="mt-4 text-xl font-semibold text-zinc-900">{user.full_name || "-"}</h2>
                <p className="text-sm text-zinc-600">{subtitle}</p>
                <p className="mt-1 text-sm text-zinc-500">{location}</p>

                {/* <div className="mt-5 flex gap-3">
                  <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    Follow
                  </button>
                  <button className="rounded-md border px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50">
                    Message
                  </button>
                </div> */}

                {user.bio ? (
                  <p className="mt-4 text-sm text-zinc-600">{user.bio}</p>
                ) : null}

                {messageSuccess ? (
                  <p className="mt-4 text-sm text-green-700">{messageSuccess}</p>
                ) : null}

                {messageError ? (
                  <p className="mt-2 text-sm text-red-600">{messageError}</p>
                ) : null}
              </div>
            </div>

            {/* Social Links Card (like the image) */}
            {/* <div className="rounded-lg border bg-white shadow-sm">
              <div className="divide-y">
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Icon>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M2 12h20" />
                        <path d="M12 2a15 15 0 0 1 0 20" />
                        <path d="M12 2a15 15 0 0 0 0 20" />
                      </svg>
                    </Icon>
                    <div>
                      <div className="text-sm font-medium text-zinc-900">Website</div>
                      <div className="text-xs text-zinc-500">https://example.com</div>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400">—</span>
                </div>

                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Icon>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77 5.44 5.44 0 0 0 3.5 8.5c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                      </svg>
                    </Icon>
                    <div>
                      <div className="text-sm font-medium text-zinc-900">Github</div>
                      <div className="text-xs text-zinc-500">@janedoe</div>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400">—</span>
                </div>

                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Icon>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2-2-.2-3.7-1.5-4.3-3.4.6.1 1.2.1 1.8-.1-2.2-.5-3.6-2.8-3.1-5 .6.3 1.3.5 2 .5C2.7 7.8 3.1 5.3 4.6 4c2.3 2.8 5.6 4.3 9.2 4.1.1-.5.3-1 .6-1.4 1.1-1.2 3-1.3 4.3-.2C20.2 6.5 22 4 22 4z" />
                      </svg>
                    </Icon>
                    <div>
                      <div className="text-sm font-medium text-zinc-900">Twitter</div>
                      <div className="text-xs text-zinc-500">@janedoe</div>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400">—</span>
                </div>

                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Icon>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
                      </svg>
                    </Icon>
                    <div>
                      <div className="text-sm font-medium text-zinc-900">Instagram</div>
                      <div className="text-xs text-zinc-500">@janedoe</div>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400">—</span>
                </div>

                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Icon>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                      </svg>
                    </Icon>
                    <div>
                      <div className="text-sm font-medium text-zinc-900">Facebook</div>
                      <div className="text-xs text-zinc-500">/janedoe</div>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400">—</span>
                </div>
              </div>
            </div> */}
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-8 space-y-6">
            {/* Details Card */}
            <div className="rounded-lg border bg-white p-6 shadow-sm">
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-[140px_1fr] gap-4 border-b pb-3">
                  <div className="text-sm font-medium text-zinc-700">Full Name</div>
                  <div className="text-sm text-zinc-900">
                    {editMode ? (
                      <input
                        value={form.full_name}
                        onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="Full name"
                      />
                    ) : (
                      user.full_name || "-"
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4 border-b pb-3">
                  <div className="text-sm font-medium text-zinc-700">Email</div>
                  <div className="text-sm text-zinc-900">{user.email || "-"}</div>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4 border-b pb-3">
                  <div className="text-sm font-medium text-zinc-700">DOB</div>
                  <div className="text-sm text-zinc-900">
                    {editMode ? (
                      <input
                        value={form.dob}
                        onChange={(e) => setForm((p) => ({ ...p, dob: e.target.value }))}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="YYYY-MM-DD"
                      />
                    ) : (
                      user.dob || "-"
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4 border-b pb-3">
                  <div className="text-sm font-medium text-zinc-700">Gender</div>
                  <div className="text-sm text-zinc-900 capitalize">
                    {editMode ? (
                      <input
                        value={form.gender}
                        onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="e.g. female"
                      />
                    ) : (
                      user.gender || "-"
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4 border-b pb-3">
                  <div className="text-sm font-medium text-zinc-700">Address</div>
                  <div className="text-sm text-zinc-900">
                    {editMode ? (
                      <input
                        value={form.address}
                        onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="Address"
                      />
                    ) : (
                      user.address || "-"
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4 border-b pb-3">
                  <div className="text-sm font-medium text-zinc-700">Bio</div>
                  <div className="text-sm text-zinc-900">
                    {editMode ? (
                      <textarea
                        value={form.bio}
                        onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                        className="w-full rounded-md border px-3 py-2 text-sm"
                        placeholder="Tell us about you"
                        rows={4}
                      />
                    ) : (
                      user.bio || "-"
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-[140px_1fr] gap-4">
                  <div className="text-sm font-medium text-zinc-700">Updated</div>
                  <div className="text-sm text-zinc-900">{user.updated_at || "-"}</div>
                </div>

                <div className="pt-2">
                  {editMode ? (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        className="rounded-md border px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                        onClick={() => {
                          setEditMode(false);
                          setMessageError(null);
                          setMessageSuccess(null);
                          setForm({
                            full_name: user.full_name ?? "",
                            dob: user.dob ?? "",
                            gender: user.gender ?? "",
                            bio: user.bio ?? "",
                            address: user.address ?? "",
                          });
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                      onClick={() => setEditMode(true)}
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom cards like the image */}
            {/* <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-baseline gap-2">
                  <span className="text-xs italic text-blue-600">assignment</span>
                  <h3 className="text-sm font-semibold text-zinc-900">Project Status</h3>
                </div>
                <div className="space-y-4">
                  {status.map((s) => (
                    <ProgressRow key={s.label} label={s.label} value={s.value} />
                  ))}
                </div>
              </div>

              <div className="rounded-lg border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-baseline gap-2">
                  <span className="text-xs italic text-blue-600">assignment</span>
                  <h3 className="text-sm font-semibold text-zinc-900">Project Status</h3>
                </div>
                <div className="space-y-4">
                  {status.map((s) => (
                    <ProgressRow key={`2-${s.label}`} label={s.label} value={Math.max(10, s.value - 10)} />
                  ))}
                </div>
              </div>
            </div> */}
          </div>
        </div>
        )}
      </div>
    </div>
  );
}