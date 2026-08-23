import {
  Camera,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Mail,
  Save,
  User,
} from "lucide-react";

import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from "react";

import api from "../../services/api";

interface Profile {
  id: number;
  name: string;
  email: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  profileImage: string | null;
}

export default function TeacherProfile() {
  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (
    imagePath: string | null | undefined
  ) => {
    if (!imagePath) {
      return "";
    }

    if (
      imagePath.startsWith("http://") ||
      imagePath.startsWith("https://")
    ) {
      return imagePath;
    }

    return `http://localhost:5000${imagePath}`;
  };

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/user/profile");

      console.log(
        "PROFILE RESPONSE:",
        response.data
      );

      const user: Profile | undefined =
        response.data?.data;

      if (!user) {
        throw new Error(
          "Profile data was not returned by the server."
        );
      }

      setName(user.name || "");
      setEmail(user.email || "");

      setPreview(
        getImageUrl(
          user.profileImage
        )
      );

    } catch (error: any) {
      console.error(
        "LOAD TEACHER PROFILE ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.message ||
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
  // SELECT IMAGE
  // =====================================================

  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setError(
        "Only JPG, PNG, and WebP images are allowed."
      );

      e.target.value = "";
      return;
    }

    const maxSize =
      5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Profile image must not exceed 5MB."
      );

      e.target.value = "";
      return;
    }

    setSelectedImage(file);

    const objectUrl =
      URL.createObjectURL(file);

    setPreview(objectUrl);
  };

  // =====================================================
  // UPLOAD IMAGE
  // =====================================================

  const uploadImage = async () => {
    if (!selectedImage) {
      setError(
        "Please select an image first."
      );
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      const formData =
        new FormData();

      formData.append(
        "profileImage",
        selectedImage
      );

      console.log(
        "Uploading:",
        selectedImage.name
      );

      const response =
        await api.post(
          "/user/profile/avatar",
          formData
        );

      console.log(
        "UPLOAD RESPONSE:",
        response.data
      );

      const updatedUser:
        | Profile
        | undefined =
        response.data?.data;

      if (!updatedUser) {
        throw new Error(
          "Server did not return updated profile."
        );
      }

      setName(
        updatedUser.name || ""
      );

      setEmail(
        updatedUser.email || ""
      );

      const imageUrl =
        getImageUrl(
          updatedUser.profileImage
        );

      setPreview(
        imageUrl
          ? `${imageUrl}?t=${Date.now()}`
          : ""
      );

      setSelectedImage(null);

      setSuccess(
        response.data?.message ||
          "Profile picture updated successfully."
      );

    } catch (error: any) {
      console.error(
        "UPLOAD PROFILE IMAGE ERROR:",
        error
      );

      console.error(
        "STATUS:",
        error.response?.status
      );

      console.error(
        "DATA:",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload profile picture."
      );

    } finally {
      setUploading(false);
    }
  };

  // =====================================================
  // UPDATE NAME + EMAIL
  // =====================================================

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError(
        "Name is required."
      );
      return;
    }

    if (!email.trim()) {
      setError(
        "Email is required."
      );
      return;
    }

    try {
      setSaving(true);

      // ==========================================
      // 1. UPDATE NAME + EMAIL
      // ==========================================

      const profileResponse =
        await api.put(
          "/user/profile",
          {
            name: name.trim(),
            email: email.trim(),
          }
        );

      console.log(
        "PROFILE UPDATE RESPONSE:",
        profileResponse.data
      );

      // ==========================================
      // 2. UPLOAD IMAGE IF SELECTED
      // ==========================================

      if (selectedImage) {
        const formData =
          new FormData();

        formData.append(
          "profileImage",
          selectedImage
        );

        console.log(
          "UPLOADING PROFILE IMAGE:",
          selectedImage.name
        );

        const imageResponse =
          await api.post(
            "/user/profile/avatar",
            formData
          );

        console.log(
          "PROFILE IMAGE RESPONSE:",
          imageResponse.data
        );
      }

      // ==========================================
      // 3. RELOAD PROFILE FROM DATABASE
      // ==========================================

      const latestResponse =
        await api.get(
          "/user/profile"
        );

      const latestUser:
        | Profile
        | undefined =
        latestResponse.data?.data;

      if (latestUser) {
        setName(
          latestUser.name || ""
        );

        setEmail(
          latestUser.email || ""
        );

        const latestImage =
          getImageUrl(
            latestUser.profileImage
          );

        setPreview(
          latestImage
            ? `${latestImage}?t=${Date.now()}`
            : ""
        );
      }

      // ==========================================
      // 4. CLEAR SELECTED IMAGE
      // ==========================================

      setSelectedImage(null);

      setSuccess(
        selectedImage
          ? "Profile and profile picture updated successfully."
          : "Profile updated successfully."
      );

    } catch (error: any) {
      console.error(
        "SAVE PROFILE ERROR:",
        error
      );

      console.error(
        "STATUS:",
        error.response?.status
      );

      console.error(
        "DATA:",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to save profile."
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
      <div className="mx-auto max-w-4xl p-6 lg:p-8">
        <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2
              size={32}
              className="animate-spin text-indigo-600"
            />

            <p className="text-sm font-medium">
              Loading profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="mx-auto max-w-4xl p-6 lg:p-8">

      {/* HEADER */}

      <div className="mb-8">
        <p className="text-sm font-semibold text-indigo-600">
          Teacher
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your teacher account information.
        </p>
      </div>

      {/* ERROR */}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-600">
          <CheckCircle2 size={18} />
          {success}
        </div>
      )}

      {/* PROFILE CARD */}

      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">

        {/* COVER */}

        <div className="h-32 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700" />

        {/* PROFILE IMAGE */}

        <div className="-mt-16 px-6 sm:px-8">

          <div className="relative h-32 w-32">

            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-indigo-100 shadow-lg">

              {preview ? (
                <img
                  src={preview}
                  alt="Teacher profile"
                  className="h-full w-full object-cover"
                  onError={() => {
                    console.error(
                      "Failed to load image:",
                      preview
                    );
                  }}
                />
              ) : (
                <User
                  size={52}
                  className="text-indigo-500"
                />
              )}

            </div>

            {/* CAMERA */}

            <label
              htmlFor="profile-image"
              className="absolute bottom-0 right-0 flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md transition hover:bg-indigo-700"
            >
              <Camera size={18} />

              <input
                id="profile-image"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleImageChange
                }
                disabled={
                  uploading ||
                  saving
                }
                className="hidden"
              />
            </label>

          </div>

        </div>

        {/* CONTENT */}

        <div className="p-6 pt-6 sm:p-8">

          {/* ACCOUNT INFORMATION */}

          <div className="mb-8">

            <h2 className="text-xl font-bold text-slate-900">
              Account Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Update your personal information.
            </p>

          </div>

          {/* PROFILE FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* NAME */}

            <div>

              <label
                htmlFor="teacher-name"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Full Name
              </label>

              <div className="relative">

                <User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="teacher-name"
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white disabled:opacity-60"
                />

              </div>

            </div>

            {/* EMAIL */}

            <div>

              <label
                htmlFor="teacher-email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email Address
              </label>

              <div className="relative">

                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="teacher-email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white disabled:opacity-60"
                />

              </div>

            </div>

            {/* ROLE */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Role
              </label>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-semibold text-indigo-600">
                Teacher
              </div>

            </div>

            {/* ACTIONS */}

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

              {/* IMAGE ACTION */}

              <div>

                {selectedImage && (
                  <button
                    type="button"
                    onClick={uploadImage}
                    disabled={
                      uploading ||
                      saving
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {uploading ? (
                      <>
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />

                        Uploading...
                      </>
                    ) : (
                      <>
                        <ImageIcon
                          size={17}
                        />

                        Upload Photo
                      </>
                    )}
                  </button>
                )}

              </div>

              {/* SAVE PROFILE */}

              <button
                type="submit"
                disabled={
                  saving ||
                  uploading
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:ml-auto"
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

        </div>

      </div>

    </div>
  );
}
