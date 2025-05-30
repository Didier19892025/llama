import { User } from "lucide-react";

interface Props {
  name: string;
}

export const SidebarUserInfo = ({ name }: Props) => (
  <div className="bg-blue-600 rounded-2xl p-2 mt-2 mb-2 space-y-1">
    <div className="flex items-center">
      <User className="h-4 w-4 mr-2" />
      <span className="text-sm font-medium truncate">{name || "Usuario"}</span>
    </div>
  </div>
);
