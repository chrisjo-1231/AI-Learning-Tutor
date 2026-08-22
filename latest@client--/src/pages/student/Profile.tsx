import {
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  Loader2,
  Mail,
  Save,
  User,
} from "lucide-react";

import api from "../../services/api";

interface Profile {
  id: number;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  profileImage?: string | null;
}

interface ProfileResponse {
  success: boolean;
  data: Profile;
  message?: string;
}

export default function Profile() {
  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

    const [selectedImage, setSelectedImage] =
  useState<File | null>(null);

const [previewImage, setPreviewImage] =
  useState<string | null>(null);
  // =====================================================
  // LOAD PROFILE
  // =====================================================

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get<ProfileResponse>(
          "/user/profile"
        );

      const user =
        response.data.data;

      setProfile(user);
      setName(user.name);
      setEmail(user.email);
    } catch (error: any) {
      console.error(
        "Profile error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response =
        await api.put<ProfileResponse>(
          "/user/profile",
          {
            name,
            email,
          }
        );

      setProfile(
        response.data.data
      );

      setName(
        response.data.data.name
      );

      setEmail(
        response.data.data.email
      );

      setSuccess(
        response.data.message ||
          "Profile updated successfully."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (error: any) {
      console.error(
        "Update profile error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">

        <div className="text-center">

          <Loader2
            size={32}
            className="mx-auto animate-spin text-indigo-600"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading profile...
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error && !profile) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-8">

        <h2 className="font-bold text-red-700">
          Unable to load profile
        </h2>

        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>

        <button
          type="button"
          onClick={loadProfile}
          className="mt-5 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
        >
          Try Again
        </button>

      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const initial =
    profile.name
      ?.charAt(0)
      .toUpperCase() || "S";

      const handleImageChange = (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    setError("Please select a valid image.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setError("Image must be smaller than 5MB.");
    return;
  }

  setError("");
  setSelectedImage(file);

  const imageUrl = URL.createObjectURL(file);

  setPreviewImage(imageUrl);
};
const handleImageUpload = async () => {
  if (!selectedImage) {
    setError("Please select an image first.");
    return;
  }

  try {
    setSaving(true);
    setError("");
    setSuccess("");

    const formData = new FormData();

    formData.append("profileImage", selectedImage);

    console.log("Selected image:", selectedImage);
    console.log(
      "FormData file:",
      formData.get("profileImage")
    );

    const response = await api.post<ProfileResponse>(
      "/user/profile/avatar",
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
      }
    );

    const updatedUser = response.data.data;

    setProfile(updatedUser);

    setPreviewImage(null);
    setSelectedImage(null);

    setSuccess(
      response.data.message ||
        "Profile picture updated successfully."
    );

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  } catch (error: any) {
    console.error(
      "Upload profile image error:",
      error
    );

    console.error(
      "Response:",
      error.response?.data
    );

    setError(
      error.response?.data?.message ||
        "Failed to upload profile picture."
    );
  } finally {
    setSaving(false);
  }
};
  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <section>

        <p className="text-sm font-semibold text-indigo-600">
          Student Portal
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your account information.
        </p>

      </section>

      {/* =================================================
          PROFILE HEADER
      ================================================= */}

      <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">

        <div className="h-32 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800" />

        <div className="-mt-12 px-6 pb-6 sm:px-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">

            {/* AVATAR */}
<div className="flex flex-col items-center">
  <label className="relative block h-24 w-24 cursor-pointer">
    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-indigo-100 text-3xl font-bold text-indigo-600 shadow-sm">
      {previewImage ? (
        <img
          src={previewImage}
          alt="Profile preview"
          className="h-full w-full object-cover"
        />
      ) : profile.profileImage ? (
        <img
          src={`http://localhost:5000${profile.profileImage}`}
          alt={profile.name}
          className="h-full w-full object-cover"
        />
      ) : (
        initial
      )}
    </div>

    <input
      type="file"
      accept="image/jpeg,image/png,image/webp"
      onChange={handleImageChange}
      className="hidden"
    />
  </label>

  {selectedImage && (
    <button
      type="button"
      onClick={handleImageUpload}
      disabled={saving}
      className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {saving ? "Uploading..." : "Save Photo"}
    </button>
  )}
</div>
            <div className="pb-1">

              <h2 className="text-xl font-bold text-slate-900">
                {profile.name}
              </h2>

              <div className="mt-1 flex items-center gap-2 text-sm text-slate-400">

                <Mail size={14} />

                {profile.email}

              </div>

            </div>

            <div className="sm:ml-auto sm:pb-1">

              <span className="rounded-full bg-indigo-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-indigo-600">
                {profile.role}
              </span>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">

          <CheckCircle2 size={19} />

          {success}

        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* =================================================
          PERSONAL INFORMATION
      ================================================= */}

      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">

        <div className="mb-7">

          <h2 className="text-xl font-bold text-slate-900">
            Personal Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Update your basic account information.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* NAME */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Full Name
            </label>

            <div className="relative">

              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                placeholder="Enter your name"
                required
              />

            </div>

          </div>

          {/* EMAIL */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email Address
            </label>

            <div className="relative">

              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                placeholder="Enter your email"
                required
              />

            </div>

          </div>

          {/* ROLE */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Account Role
            </label>

            <input
              type="text"
              value={profile.role}
              disabled
              className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3.5 text-sm font-semibold uppercase text-slate-500"
            />

            <p className="mt-2 text-xs text-slate-400">
              Your account role cannot be changed here.
            </p>

          </div>

          {/* BUTTON */}

          <div className="flex justify-end border-t border-slate-100 pt-6">

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >

              {saving ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />

                  Save Changes
                </>
              )}

            </button>

          </div>

        </form>

      </section>

    </div>
  );
}