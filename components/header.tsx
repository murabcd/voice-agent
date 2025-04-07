import React from "react";
import { AudioLines } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  return (
    <div className="p-5 text-lg font-semibold flex justify-between items-center">
      <div className="flex items-center">
        <div onClick={() => window.location.reload()} style={{ cursor: "pointer" }}>
          <AudioLines className="w-6 h-6 mr-2" />
        </div>
        <div>
          Realtime Voice <span className="text-muted-foreground">Agent</span>
        </div>
      </div>
      <ModeToggle />
    </div>
  );
};

export default Header;
