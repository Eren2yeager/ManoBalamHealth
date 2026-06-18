import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserProfile, UpdateProfileDto } from "../types/profile.types";
import { updateMe } from "../api/profile.api";
import { useUserStore } from "@/stores/userStore";
import { getViewerTimezone } from "@/lib/timezone";
import { toast } from "sonner";

interface ProfileFormProps {
  profile: UserProfile;
}

export const ProfileForm = ({ profile }: ProfileFormProps) => {
  const setUser = useUserStore((s) => s.setUser);
  const [formData, setFormData] = useState<UpdateProfileDto>({
    name: profile.name,
    age: profile.age,
    gender: profile.gender,
    emergencyContact: profile.emergencyContact,
    timezone: profile.timezone,
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const updated = await updateMe(formData);
      setUser(updated);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencyNameChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        name: val,
        phone: prev.emergencyContact?.phone || "",
      },
    }));
  };

  const handleEmergencyPhoneChange = (val: string) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        name: prev.emergencyContact?.name || "",
        phone: val,
      },
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name || ""}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    age: e.target.value ? parseInt(e.target.value) : undefined,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select
                id="gender"
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={formData.gender || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    gender: e.target.value as UpdateProfileDto["gender"],
                  }))
                }
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Emergency Contact</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Contact name"
                value={formData.emergencyContact?.name || ""}
                onChange={(e) => handleEmergencyNameChange(e.target.value)}
              />
              <Input
                placeholder="Contact phone"
                value={formData.emergencyContact?.phone || ""}
                onChange={(e) => handleEmergencyPhoneChange(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Input
              id="timezone"
              value={formData.timezone || ""}
              readOnly
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Detected automatically: {getViewerTimezone()}
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving changes..." : "Save changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
