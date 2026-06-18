import { useState, useEffect } from "react";
import { AvatarUpload } from "../components/AvatarUpload";
import { ProfileForm } from "../components/ProfileForm";
import { getMe } from "../api/profile.api";
import type { UserProfile } from "../types/profile.types";

export const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMe();
        setProfile(data);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-muted-foreground">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="p-6 bg-card rounded-xl shadow-sm border">
              <AvatarUpload currentAvatarUrl={profile.avatarUrl} />
              <div className="mt-6 space-y-2 text-center">
                <h2 className="text-xl font-semibold">{profile.name}</h2>
                <p className="text-muted-foreground capitalize">{profile.role}</p>
                {profile.email && <p className="text-sm">{profile.email}</p>}
                {profile.phone && <p className="text-sm">{profile.phone}</p>}
              </div>
            </div>
          </div>
          <div className="lg:col-span-2">
            <ProfileForm profile={profile} />
          </div>
        </div>
      </div>
    </div>
  );
};
