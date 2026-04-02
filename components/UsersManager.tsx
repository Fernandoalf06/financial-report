"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { 
  UserPlus, Search, Shield, User, Star, Trash2, ShieldAlert,
  ChevronDown, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { inviteDivisionMember, updateMemberRole, removeMember } from "@/actions/division";

type Member = {
  id: string;
  username: string;
  globalRole: string;
  divisionRole: string;
  createdAt: Date;
};

export function UsersManager({ 
  initialMembers, 
  isHead,
  currentUserId 
}: { 
  initialMembers: Member[], 
  isHead: boolean,
  currentUserId: string
}) {
  const [members, setMembers] = useState(initialMembers);
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteRole, setInviteRole] = useState("VIEWER");
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const getRoleBadge = (role: string) => {
    switch(role) {
      case "HEAD":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-500/20 text-violet-400 border border-violet-500/30 shadow-sm shadow-violet-500/10"><Star className="w-3.5 h-3.5" /> Kepala Divisi</span>;
      case "EDITOR":
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><Shield className="w-3.5 h-3.5" /> Editor</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-400 border border-slate-500/30"><User className="w-3.5 h-3.5" /> Viewer</span>;
    }
  };

  async function handleInvite() {
    if (!inviteUsername.trim()) return;
    setIsInviting(true);
    setError("");

    const res = await inviteDivisionMember(inviteUsername, inviteRole);
    if (!res.success) {
      setError(res.error || "Gagal mengundang user.");
    } else {
      setInviteUsername("");
      setInviteRole("VIEWER");
      // Hard reload since we aren't lifting state high enough without useRouter refresh
      window.location.reload(); 
    }
    setIsInviting(false);
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    setLoadingId(memberId);
    const res = await updateMemberRole(memberId, newRole);
    if (!res.success) {
      alert(res.error);
    } else {
      setMembers(members.map(m => m.id === memberId ? { ...m, divisionRole: newRole } : m));
    }
    setLoadingId(null);
  }

  async function handleRemove(memberId: string) {
    if (!confirm("Hapus anggota ini dari divisi?")) return;
    setLoadingId(memberId);
    
    const res = await removeMember(memberId);
    if (!res.success) {
      alert(res.error);
    } else {
      setMembers(members.filter(m => m.id !== memberId));
    }
    setLoadingId(null);
  }

  return (
    <div className="space-y-6">
      {/* Invitation Bar (Only for HEAD) */}
      {isHead && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl backdrop-blur-sm relative overflow-hidden group">
           <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
           <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
             <UserPlus className="w-4 h-4 text-indigo-400" /> 
             Undang Anggota Baru
           </h3>
           
           <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
             <div className="relative flex-grow">
               <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                 <Search className="h-4 w-4 text-slate-500" />
               </div>
               <Input
                 placeholder="Ketik username staf yang terdaftar..."
                 value={inviteUsername}
                 onChange={(e) => setInviteUsername(e.target.value)}
                 className="pl-10 bg-slate-900/50 border-white/10 text-white focus:border-indigo-500 h-11"
               />
             </div>
             
             <select
               value={inviteRole}
               onChange={(e) => setInviteRole(e.target.value)}
               className="h-11 px-3 bg-slate-900/50 border border-white/10 rounded-md text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
             >
               <option value="VIEWER">Viewer (Hanya Lihat)</option>
               <option value="EDITOR">Editor (Input Transaksi)</option>
               <option value="HEAD">Head (Akses Penuh)</option>
             </select>

             <Button 
               onClick={handleInvite} 
               disabled={isInviting || !inviteUsername.trim()}
               className="h-11 px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
             >
               {isInviting ? "Mengundang..." : "Undang"}
             </Button>
           </div>
           
           {error && (
             <div className="mt-3 text-sm text-red-400 flex items-center gap-1.5">
               <AlertCircle className="w-4 h-4" /> {error}
             </div>
           )}
        </div>
      )}

      {/* Members Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/50 border-b border-white/10 text-slate-300 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold rounded-tl-xl">Username</th>
                <th className="p-4 font-semibold">Peran Divisi</th>
                <th className="p-4 font-semibold">Bergabung Pada</th>
                {isHead && <th className="p-4 font-semibold text-right rounded-tr-xl">Aksi</th>}
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-white/5">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={isHead ? 4 : 3} className="p-8 text-center text-slate-500">
                    Belum ada anggota di divisi ini.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr 
                    key={member.id} 
                    className={`hover:bg-white/[0.02] transition-colors ${loadingId === member.id ? 'opacity-50' : ''}`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
                          <span className="text-indigo-400 font-bold text-xs uppercase">
                            {member.username.substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white flex items-center gap-2">
                            {member.username}
                            {member.id === currentUserId && (
                               <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">(Anda)</span>
                            )}
                          </p>
                          {member.globalRole === "SUPERADMIN" && (
                            <p className="text-xs text-amber-500 flex items-center gap-1 mt-0.5">
                              <ShieldAlert className="w-3 h-3" /> System Admin
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getRoleBadge(member.divisionRole)}
                    </td>
                    <td className="p-4 text-slate-400">
                      {format(new Date(member.createdAt), "d MMMM yyyy", { locale: idLocale })}
                    </td>
                    {isHead && (
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           {/* Role Selector */}
                           {member.id !== currentUserId && (
                             <DropdownMenu>
                               <DropdownMenuTrigger>
                                 <Button variant="outline" size="sm" className="bg-transparent border-white/10 hover:bg-white/5 text-slate-300 h-8 px-2.5">
                                   Ubah Peran <ChevronDown className="w-3 h-3 ml-1" />
                                 </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end" className="bg-slate-900 border-white/10">
                                 <DropdownMenuItem onClick={() => handleRoleChange(member.id, "VIEWER")}>
                                   Jadikan Viewer
                                 </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => handleRoleChange(member.id, "EDITOR")}>
                                   Jadikan Editor
                                 </DropdownMenuItem>
                                 <DropdownMenuItem onClick={() => handleRoleChange(member.id, "HEAD")} className="text-violet-400">
                                   Jadikan Head Divisi
                                 </DropdownMenuItem>
                               </DropdownMenuContent>
                             </DropdownMenu>
                           )}

                           {/* Delete / Kick */}
                           {member.id !== currentUserId && (
                             <Button 
                               variant="ghost" 
                               size="icon"
                               onClick={() => handleRemove(member.id)}
                               className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 rounded-md transition-colors"
                             >
                               <Trash2 className="w-4 h-4" />
                             </Button>
                           )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
