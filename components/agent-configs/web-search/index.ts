import greeter from "./greeter";
import search from "./search";
import { injectTransferTools } from "@/lib/utils";

greeter.downstreamAgents = [search];
search.downstreamAgents = [greeter];

const agents = injectTransferTools([greeter, search]);

export default agents;
