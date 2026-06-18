import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { uploadAvatar } from "../api/profile.api";
import { useUserStore } from "@/stores/userStore";
import { toast } from "sonner";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
}

export const AvatarUpload = ({ currentAvatarUrl }: AvatarUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const setUser = useUserStore((s) => s.setUser);
  const user = useUserStore((s) => s.user);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsLoading(true);
    try {
      const result = await uploadAvatar(file);
      setUser({ ...user, avatarUrl: result.avatarUrl });
      toast.success("Profile picture updated!");
    } catch (error) {
      toast.error("Failed to upload profile picture");
      console.error(error);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center">
        {currentAvatarUrl ? (
          <img
            src={currentAvatarUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <User className="w-16 h-16 text-muted-foreground" />
        )}
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileChange}
      />
      <Button
        variant="outline"
        size="sm"
        disabled={isLoading}
        onClick={() => fileInputRef.current?.click()}
      >
        {isLoading ? "Uploading..." : "Change picture"}
      </Button>
    </div>
  );
};
