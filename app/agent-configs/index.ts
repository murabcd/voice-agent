import { AllAgentConfigsType } from "@/lib/types";

import simpleExample from "@/app/agent-configs/simple-example";
import webSearch from "@/app/agent-configs/web-search/web-search-agent";

export const allAgentSets: AllAgentConfigsType = {
  simpleExample,
  webSearch,
};

export const defaultAgentSetKey = "simpleExample";
