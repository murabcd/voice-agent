import { AllAgentConfigsType } from "@/lib/types";

import simpleExample from "@/app/agent-configs/web-search/index";
import customerService from "@/app/agent-configs/customer-service/index";

export const allAgentSets: AllAgentConfigsType = {
  simpleExample,
  customerService,
};

export const defaultAgentSetKey = "simpleExample";
