"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateProfileImageMutation,
  useUpdateEmailMutation,
  useChangePasswordMutation,
  useUploadProfileImageMutation,
} from "@/store/slices/userApiSlice";
import { setCredentials } from "@/store/slices/authSlice";
import {
  User, Mail, Phone, Lock, Camera, Loader2,
  CheckCircle2, AlertCircle, Eye, EyeOff,
} from "lucide-react";
import Image from "next/image";
import UserLayout from "@/components/user/UserLayout";

export default function SettingsPage() {
  const { user: authUser, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const { data: profileData, isLoading: loadingProfile } = useGetProfileQuery(undefined, {
    skip: !mounted || !isAuthenticated,
  });
  const [updateProfile, { isLoading: updatingProfile }] = useUpdateProfileMutation();
  const [updateProfileImage, { isLoading: updatingImage }] = useUpdateProfileImageMutation();
  const [updateEmail, { isLoading: updatingEmail }] = useUpdateEmailMutation();
  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation();
  const [uploadImage] = useUploadProfileImageMutation();

  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // Profile form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Email form
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [showEmailPassword, setShowEmailPassword] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailError, setEmailError] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Image upload
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    if (mounted && !isAuthenticated) router.replace("/login");
  }, [mounted, isAuthenticated, router]);

  useEffect(() => {
    if (profileData?.user) {
      setFullName(profileData.user.fullName);
      setPhone(profileData.user.phone);
      setNewEmail(profileData.user.email);
    }
  }, [profileData]);

  if (!mounted || !isAuthenticated) return null;

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    try {
      const result = await updateProfile({ fullName, phone }).unwrap();
      setProfileSuccess(result.message);
      // Update auth state
      if (authUser) {
        dispatch(setCredentials({
          user: { ...authUser, name: result.user.fullName },
          token: authUser.token || "",
        }));
      }
    } catch (err: any) {
      setProfileError(err?.data?.message || "Failed to update profile");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setImageError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const uploadResult = await uploadImage(fd).unwrap();
      const imageUrl = uploadResult.url;

      if (imageUrl) {
        await updateProfileImage({ profileImage: imageUrl }).unwrap();
        setProfileSuccess("Profile image updated successfully");
        
        // Update auth state with new profile image
        if (authUser) {
          dispatch(setCredentials({
            user: { ...authUser, profileImage: imageUrl },
            token: authUser.token || "",
          }));
        }
      }
    } catch (err: any) {
      setImageError(err?.data?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEmailUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess("");
    if (!newEmail || !emailPassword) {
      setEmailError("Email and password are required");
      return;
    }
    try {
      const result = await updateEmail({ email: newEmail, password: emailPassword }).unwrap();
      setEmailSuccess(result.message);
      setEmailPassword("");
    } catch (err: any) {
      setEmailError(err?.data?.message || "Failed to update email");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      const result = await changePassword({ currentPassword, newPassword }).unwrap();
      setPasswordSuccess(result.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err?.data?.message || "Failed to change password");
    }
  };

  return (
    <UserLayout>
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "profile"
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "security"
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Security
          </button>
        </div>

        {loadingProfile ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-green-600" />
          </div>
        ) : (
          <>
            {/* ── Profile Tab ── */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                {/* Profile Image */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                      {profileData?.user.profileImage ? (
                        <Image
                          src={profileData.user.profileImage}
                          alt={profileData.user.fullName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        profileData?.user.fullName.charAt(0).toUpperCase()
                      )}
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 size={24} className="animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
                        <Camera size={16} />
                        {uploadingImage ? "Uploading..." : "Change Photo"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-2">JPG, PNG or WebP. Max 5MB.</p>
                      {imageError && (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle size={12} /> {imageError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Info */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    {profileSuccess && (
                      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg">
                        <CheckCircle2 size={16} />
                        {profileSuccess}
                      </div>
                    )}
                    {profileError && (
                      <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-4 py-3 rounded-lg">
                        <AlertCircle size={16} />
                        {profileError}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <User size={14} className="inline mr-1" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <Phone size={14} className="inline mr-1" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updatingProfile}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      {updatingProfile ? (
                        <><Loader2 size={16} className="animate-spin" /> Updating...</>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* ── Security Tab ── */}
            {activeTab === "security" && (
              <div className="space-y-6">
                {/* Email */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Address</h2>
                  <form onSubmit={handleEmailUpdate} className="space-y-4">
                    {emailSuccess && (
                      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg">
                        <CheckCircle2 size={16} />
                        {emailSuccess}
                      </div>
                    )}
                    {emailError && (
                      <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-4 py-3 rounded-lg">
                        <AlertCircle size={16} />
                        {emailError}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <Mail size={14} className="inline mr-1" />
                        New Email
                      </label>
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        <Lock size={14} className="inline mr-1" />
                        Confirm with Password
                      </label>
                      <div className="relative">
                        <input
                          type={showEmailPassword ? "text" : "password"}
                          value={emailPassword}
                          onChange={(e) => setEmailPassword(e.target.value)}
                          className="w-full px-4 py-2.5 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowEmailPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showEmailPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={updatingEmail}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      {updatingEmail ? (
                        <><Loader2 size={16} className="animate-spin" /> Updating...</>
                      ) : (
                        "Update Email"
                      )}
                    </button>
                  </form>
                </div>

                {/* Password */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    {passwordSuccess && (
                      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg">
                        <CheckCircle2 size={16} />
                        {passwordSuccess}
                      </div>
                    )}
                    {passwordError && (
                      <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 px-4 py-3 rounded-lg">
                        <AlertCircle size={16} />
                        {passwordError}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-4 py-2.5 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2.5 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2.5 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      {changingPassword ? (
                        <><Loader2 size={16} className="animate-spin" /> Changing...</>
                      ) : (
                        "Change Password"
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </UserLayout>
  );
}
