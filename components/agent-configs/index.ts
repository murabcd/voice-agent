import { AllAgentConfigsType } from "@/lib/types";

import webSearch from "@/components/agent-configs/web-search/index";
import customerService from "@/components/agent-configs/customer-service/index";

export const allAgentSets: AllAgentConfigsType = {
  webSearch,
  customerService,
};

export const defaultAgentSetKey = "webSearch";
