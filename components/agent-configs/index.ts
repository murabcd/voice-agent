import { AllAgentConfigsType } from "@/lib/types";

import simpleExample from "@/components/agent-configs/web-search/index";
import customerService from "@/components/agent-configs/customer-service/index";

export const allAgentSets: AllAgentConfigsType = {
  simpleExample,
  customerService,
};

export const defaultAgentSetKey = "simpleExample";
