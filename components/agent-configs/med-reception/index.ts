import primaryPatientAgentConfig from "./primary-patient";
import secondaryPatientAgentConfig from "./secondary-patient";

import { injectTransferTools } from "@/lib/utils";

primaryPatientAgentConfig.downstreamAgents = [secondaryPatientAgentConfig];
secondaryPatientAgentConfig.downstreamAgents = [primaryPatientAgentConfig];

const agents = injectTransferTools([
  primaryPatientAgentConfig,
  secondaryPatientAgentConfig,
]);

export default agents;
