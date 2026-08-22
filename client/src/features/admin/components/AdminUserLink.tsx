import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AdminUserLink({ id, name, avatarUrl, compact = false }: { id: string; name: string; avatarUrl?: string; compact?: boolean }) {
  return <Link to={`/admin/users/${id}`} className="group inline-flex min-w-0 items-center gap-2 rounded-xl p-1 text-left transition-colors hover:bg-violet-50">
    <Avatar className={compact ? "size-7" : "size-9"}><AvatarImage src={avatarUrl} alt="" /><AvatarFallback className="bg-violet-100 text-xs font-black text-primary">{name.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
    <span className="truncate text-sm font-semibold text-slate-700 group-hover:text-primary">{name}</span>
  </Link>;
}
