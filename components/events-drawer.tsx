"use client";

import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import Events from "@/components/events";

interface EventsDrawerProps {
  children: React.ReactNode; // The trigger element
}

const EventsDrawer: React.FC<EventsDrawerProps> = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Logs</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 max-h-[80vh] overflow-y-auto">
          <Events isExpanded={true} variant="drawer" />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default EventsDrawer;
