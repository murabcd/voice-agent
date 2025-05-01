import { AllAgentConfigsType } from "@/lib/types";

import webSearch from "@/components/agent-configs/web-search/index";
import customerService from "@/components/agent-configs/customer-service/index";
import medReception from "@/components/agent-configs/med-reception/index";

export const allAgentSets: AllAgentConfigsType = {
  webSearch,
  customerService,
  medReception,
};

export const defaultAgentSetKey = "webSearch";
