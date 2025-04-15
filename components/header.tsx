import React from "react";
import { AudioLines, Settings, Terminal } from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import EventsDrawer from "./events-drawer";

interface HeaderProps {
  setIsSheetOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setIsSheetOpen }) => {
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
      <div className="flex items-center gap-x-2">
        <EventsDrawer>
          <Button variant="outline" size="icon" className="md:hidden">
            <Terminal className="h-4 w-4" />
          </Button>
        </EventsDrawer>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSheetOpen(true)}
          className="md:hidden"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <ModeToggle />
      </div>
    </div>
  );
};

export default Header;
