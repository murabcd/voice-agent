import baggage from "./baggage-helper";
import operator from "./operator";
import offers from "./special-offers";

import { injectTransferTools } from "@/lib/utils";

operator.downstreamAgents = [baggage, offers];
baggage.downstreamAgents = [operator, offers];
offers.downstreamAgents = [operator, baggage];

const agents = injectTransferTools([operator, baggage, offers]);

export default agents;
