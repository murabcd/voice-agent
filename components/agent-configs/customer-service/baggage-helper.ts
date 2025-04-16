import { AgentConfig } from "@/lib/types";
import { baggageHelperPrompt } from "@/lib/ai/prompts";

const baggage: AgentConfig = {
  name: "baggage",
  publicDescription: "Customer support agent specializing in baggage inquiries.",
  instructions: baggageHelperPrompt,
  tools: [
    {
      type: "function",
      name: "lookupOrders",
      description:
        "Get detailed information about orders using the user's phone number, including delivery status and item details. Be brief and provide only the minimum necessary information to the user to remind them of the relevant order details.",
      parameters: {
        type: "object",
        properties: {
          phoneNumber: {
            type: "string",
            description: "User's phone number associated with their orders.",
          },
        },
        required: ["phoneNumber"],
        additionalProperties: false,
      },
    },
    {
      type: "function",
      name: "retrievePolicy",
      description:
        "Retrieve and present store policies, including eligibility for returns. Do not describe the rules directly to the user, only refer to them indirectly to potentially collect more useful information from the user.",
      parameters: {
        type: "object",
        properties: {
          region: {
            type: "string",
            description: "Region where the user is located.",
          },
          itemCategory: {
            type: "string",
            description:
              "Category of the item the user wants to return (e.g., shoes, accessories).",
          },
        },
        required: ["region", "itemCategory"],
        additionalProperties: false,
      },
    },
    {
      type: "function",
      name: "checkEligibilityAndPossiblyInitiateReturn",
      description: `Check eligibility for the proposed action for the given order, providing approval or denial with reasons. This will send a request to an experienced agent who is very knowledgeable in determining eligibility for an order who can agree and initiate a return.

# Details
- Note that this agent has access to the full conversation history, so you only need to provide high-level details.
- ALWAYS check retrievePolicy first to make sure we have the appropriate context. 
- Note that this may take up to 10 seconds, so please provide the user with small updates every few seconds, such as 'I need a little more time'.`,
      parameters: {
        type: "object",
        properties: {
          userDesiredAction: {
            type: "string",
            description: "Proposed action the user wants to take.",
          },
          question: {
            type: "string",
            description:
              "Question you would like help with from a qualified escalation agent.",
          },
        },
        required: ["userDesiredAction", "question"],
        additionalProperties: false,
      },
    },
    {
      type: "function",
      name: "fetchBaggagePolicies",
      description:
        "Get up-to-date information from the Ural Airlines website to provide accurate data to the user. Use this tool to find information about baggage rules, fares, and other airline services.",
      parameters: {
        type: "object",
        properties: {
          targetUrl: {
            type: "string",
            description:
              "URL of the page on the Ural Airlines website from which to get information (e.g., 'https://www.uralairlines.ru/baggage_main' for baggage information).",
          },
        },
        required: ["targetUrl"],
        additionalProperties: false,
      },
    },
  ],
  toolLogic: {
    lookupOrders: ({ phoneNumber }) => {
      console.log(`[toolLogic] looking up orders for ${phoneNumber}`);
      return {
        orders: [
          {
            order_id: "UAL-20250401-001",
            order_date: "2025-04-01T09:30:00Z",
            flight_date: "2025-04-20T14:00:00Z",
            order_status: "booked",
            total_rub: 35000.0,
            items: [
              {
                item_id: "TKT-MOW-VVO",
                item_name: "Ticket Moscow to Vladivostok",
                retail_price_rub: 30000.0,
              },
              {
                item_id: "BAG-EXTRA-20KG",
                item_name: "Extra Baggage 20kg",
                retail_price_rub: 5000.0,
              },
            ],
          },
          {
            order_id: "UAL-20250405-002",
            order_date: "2025-04-05T10:15:00Z",
            flight_date: "2025-04-25T10:00:00Z",
            order_status: "completed",
            total_rub: 28000.0,
            items: [
              {
                item_id: "TKT-EKB-SVO",
                item_name: "Ticket Yekaterinburg to Moscow",
                retail_price_rub: 20000.0,
              },
              {
                item_id: "BAG-STD-23KG",
                item_name: "Standard Baggage 23kg",
                retail_price_rub: 0.0,
              },
              {
                item_id: "SEAT-SELECT",
                item_name: "Seat Selection",
                retail_price_rub: 3000.0,
              },
            ],
          },
        ],
      };
    },
    retrievePolicy: () => {
      return `
The policy of Ural Airlines regarding baggage and additional services is designed to ensure transparency and convenience for passengers. The main rules are listed below:

1. GENERAL RULES FOR BAGGAGE TRANSPORTATION
• Baggage allowance: The free baggage allowance depends on the ticket fare. Usually it is 23 kg for checked baggage and 5-10 kg for hand luggage.
• Excess baggage: An additional fee is charged for exceeding the norm, which depends on the route and weight.
• Prohibited items: Hazardous materials, weapons and certain liquids are prohibited for transportation in accordance with international safety regulations.

2. CONDITIONS FOR THE TRANSPORTATION OF SPECIAL BAGGAGE
• Sports equipment: May be transported as part of the free allowance or for an additional fee if it exceeds weight restrictions.
• Musical instruments: Can be transported in the cabin as hand luggage, provided that an additional seat is purchased, or in the luggage compartment with appropriate packaging.
• Pets: Transportation of animals is possible in compliance with the airline's rules and the availability of necessary documents.

3. DAMAGE OR LOSS OF BAGGAGE
• Responsibility: The airline is responsible for the loss or damage of baggage in accordance with international standards (Warsaw Convention).
• Procedure: In case of loss or damage to baggage, the passenger must contact the baggage tracing service at the airport of arrival and fill out the appropriate act.
• Compensation: The amount of compensation is determined in accordance with the rules of the airline and international agreements.

4. RETURN AND CHANGE OF SERVICES
• Ticket refunds: The possibility of a refund depends on the fare. Some fares are non-refundable.
• Change of reservation: Changes are possible for an additional fee, depending on the fare and availability of seats.

5. ADDITIONAL SERVICES
• Seat selection: Passengers can choose a seat in the cabin for an additional fee.
• Meals on board: Special meals can be ordered in advance for a separate fee.

6. ADDITIONAL CONDITIONS
• Subsidized transportation: Preferential fares are available for certain categories of passengers.
• Communication: To clarify any questions, please contact our passenger support service.

We hope that these rules will help you feel confident in the quality of our services. Thank you for choosing Ural Airlines!
`;
    },
    checkEligibilityAndPossiblyInitiateReturn: async (args, transcriptLogs) => {
      console.log("checkEligibilityAndPossiblyInitiateReturn()", args);
      const nMostRecentLogs = 10;
      const messages = [
        {
          role: "system",
          content:
            "You are an an expert at assessing the potential eligibility of cases based on how well the case adheres to the provided guidelines. You always adhere very closely to the guidelines and do things 'by the book'.",
        },
        {
          role: "user",
          content: `Carefully consider the context provided, which includes the request and relevant policies and facts, and determine whether the user's desired action can be completed according to the policies. Provide a concise explanation or justification. Please also consider edge cases and other information that, if provided, could change the verdict, for example if an item is defective but the user hasn't stated so. Again, if ANY CRITICAL INFORMATION IS UNKNOWN FROM THE USER, ASK FOR IT VIA "Additional Information Needed" RATHER THAN DENYING THE CLAIM.

<modelContext>
${JSON.stringify(args, null, 2)}
</modelContext>

<conversationContext>
${JSON.stringify(transcriptLogs.slice(nMostRecentLogs), args, 2)}
</conversationContext>

<output_format>
# Rationale
// Short description explaining the decision.

# User Request
// The user's desired outcome or action.

# Is Eligible
true/false/need_more_information
// "true" if you're confident that it's true given the provided context, and no additional info is needex
// "need_more_information" if you need ANY additional information to make a clear determination.

# Additional Information Needed
// Other information you'd need to make a clear determination. Can be "None".

# Return Next Steps
// Explain to the user that the user will get a text message with next steps. Only if is_eligible=true, otherwise "None". Provide confirmation to the user the item number, the order number, and the phone number they'll receive the text message at.
</output_format>  
`,
        },
      ];

      const model = "gpt-4.1-mini";
      console.log(`checking order eligibility with model=${model}`);

      const response = await fetch("/api/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model, messages }),
      });

      if (!response.ok) {
        console.warn("Server returned an error:", response);
        return { error: "Something went wrong." };
      }

      const completion = await response.json();
      console.log(completion.choices[0].message.content);
      return { result: completion.choices[0].message.content };
    },
    fetchBaggagePolicies: async ({ targetUrl }) => {
      console.log(`[toolLogic] fetching content from ${targetUrl}`);
      try {
        const response = await fetch(
          `/api/reader?targetUrl=${encodeURIComponent(targetUrl)}`
        );
        if (!response.ok) {
          console.error(`Error fetching content from ${targetUrl}: ${response.status}`);
          return {
            error: `Failed to fetch content from ${targetUrl}. Status: ${response.status}`,
          };
        }
        const data = await response.json();
        return { content: data.content };
      } catch (error) {
        console.error(`Error in fetchBaggagePolicies:`, error);
        return { error: `Internal error while fetching content from ${targetUrl}` };
      }
    },
  },
};

export default baggage;
