import { useEffect, useRef, useState } from "react";
import {
  Camera,
  CheckCircle2,
  ImagePlus,
  LoaderCircle,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadAvatar } from "../api/profile.api";
import { useUserStore } from "@/stores/userStore";
import { toast } from "sonner";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 5 * 1024 * 1024;

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  name: string;
  onAvatarUpdated: (avatarUrl: string) => void;
}

export const AvatarUpload = ({
  currentAvatarUrl,
  name,
  onAvatarUpdated,
}: AvatarUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!allowedTypes.has(file.type)) {
      toast.error("Choose a JPEG, PNG, or WebP image.");
      event.target.value = "";
      return;
    }
    if (file.size > maxFileSize) {
      toast.error("Profile image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setProgress(0);
    setIsLoading(true);

    try {
      const result = await uploadAvatar(file, setProgress);
      setUser({ ...user, avatarUrl: result.avatarUrl });
      onAvatarUpdated(result.avatarUrl);
      toast.success("Profile picture updated.");
      setProgress(100);
      setPreviewUrl(null);
    } catch {
      toast.error("We could not upload that image. Please try again.");
      setPreviewUrl(null);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const imageUrl = previewUrl ?? currentAvatarUrl;

  return (
    <div className="flex flex-col items-center">
      <div className="group relative">
        <div className="grid size-36 place-items-center overflow-hidden rounded-[2.5rem] border-4 border-white bg-gradient-to-br from-violet-100 to-blue-100 text-violet-600 shadow-2xl shadow-violet-200/60">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${name} profile`}
              className="size-full object-cover"
            />
          ) : (
            <UserRound className="size-16" />
          )}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          aria-label="Choose profile picture"
          className="absolute -bottom-2 -right-2 grid size-12 place-items-center rounded-2xl border-4 border-white bg-violet-600 text-white shadow-lg transition hover:scale-105 hover:bg-violet-700 disabled:cursor-wait"
        >
          {isLoading ? (
            <LoaderCircle className="size-5 animate-spin" />
          ) : (
            <Camera className="size-5" />
          )}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
      />

      <Button
        type="button"
        variant="outline"
        disabled={isLoading}
        onClick={() => fileInputRef.current?.click()}
        className="mt-6 h-10 rounded-xl border-violet-100 bg-white font-bold text-violet-700"
      >
        <ImagePlus className="mr-2 size-4" />
        {isLoading ? `Uploading ${progress}%` : "Change profile photo"}
      </Button>

      {isLoading && (
        <div className="mt-3 h-1.5 w-44 overflow-hidden rounded-full bg-violet-100">
          <div
            className={`h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-500 transition-[width] ${progressWidth(progress)}`}
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
          <ShieldCheck className="size-3" />
          Private account
        </span>
        {currentAvatarUrl && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
            <CheckCircle2 className="size-3" />
            Photo added
          </span>
        )}
      </div>
      <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
        JPEG, PNG or WebP · Maximum 5 MB
      </p>
    </div>
  );
};

function progressWidth(progress: number) {
  if (progress >= 100) return "w-full";
  if (progress >= 90) return "w-11/12";
  if (progress >= 75) return "w-3/4";
  if (progress >= 60) return "w-3/5";
  if (progress >= 45) return "w-1/2";
  if (progress >= 30) return "w-1/3";
  if (progress >= 15) return "w-1/5";
  return "w-1/12";
}
