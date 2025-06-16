import Link from "next/link";

import { motion } from "framer-motion";
import { Podcast } from "lucide-react";

export const Greeting = () => {
  return (
    <div
      key="overview"
      className="size-full flex flex-col justify-center items-center gap-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
      >
        <Podcast className="w-12 h-12 text-muted-foreground" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="text-sm text-muted-foreground"
      >
        Conversation will appear here
      </motion.div>
    </div>
  );
};
