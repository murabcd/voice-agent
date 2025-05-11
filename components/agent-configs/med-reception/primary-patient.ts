import { AgentConfig, Tool, ToolParameters } from "@/lib/types";
import { PrimaryPatientPrompt } from "@/lib/ai/prompts";

const checkAvailability: ToolParameters = {
  type: "object",
  properties: {
    specialty: {
      type: "string",
      description: "Medical specialty requested (e.g., Therapist, Optometrist)",
    },
    preferredDoctor: {
      type: "string",
      description: "Preferred doctor's name (optional)",
    },
    preferredDate: {
      type: "string",
      description: "Preferred date or date range (e.g., 2025-05-15, 'next week')",
    },
    preferredTime: {
      type: "string",
      description: "Preferred time slot (e.g., 'morning', 'after 3 PM')",
    },
  },
  required: ["specialty"],
};

const checkAvailabilityTool: Tool = {
  type: "function",
  name: "checkAvailability",
  description:
    "Checks available appointment slots based on specialty, doctor, date, and time preferences.",
  parameters: checkAvailability,
};

const scheduleAppointment: ToolParameters = {
  type: "object",
  properties: {
    patientName: { type: "string", description: "Patient's full name" },
    patientPhone: { type: "string", description: "Patient's contact phone number" },
    specialty: { type: "string", description: "Medical specialty for the appointment" },
    doctorId: {
      type: "string",
      description: "ID or name of the specific doctor for the appointment",
    },
    appointmentSlot: {
      type: "string",
      description: "The confirmed date and time slot (e.g., '2025-07-15T10:30:00')",
    },
  },
  required: ["patientName", "patientPhone", "specialty", "doctorId", "appointmentSlot"],
};

const scheduleAppointmentTool: Tool = {
  type: "function",
  name: "scheduleAppointment",
  description: "Schedules a new appointment for the patient with the specified details.",
  parameters: scheduleAppointment,
};

const primaryPatientAgentConfig: AgentConfig = {
  name: "primary",
  publicDescription: "Handles inquiries and scheduling for new patients.",
  instructions: PrimaryPatientPrompt,
  tools: [checkAvailabilityTool, scheduleAppointmentTool],
  toolLogic: {
    checkAvailability: async (args) => {
      console.log("[toolLogic] Checking availability with args:", args);
      return {
        availableSlots: [
          { doctorId: "doc123", doctorName: "Dr. Smith", time: "2025-07-15T10:00:00" },
          { doctorId: "doc123", doctorName: "Dr. Smith", time: "2025-07-15T11:30:00" },
          { doctorId: "doc456", doctorName: "Dr. Jones", time: "2025-07-16T14:00:00" },
        ],
      };
    },
    scheduleAppointment: async (args) => {
      console.log("[toolLogic] Scheduling appointment with args:", args);
      return {
        success: true,
        appointmentId: `APT-${Date.now()}`,
        confirmationDetails: `Appointment confirmed for ${args.patientName} with ${args.doctorId} on ${args.appointmentSlot}`,
      };
    },
  },
  downstreamAgents: [
    { name: "Reception Assistant", publicDescription: "Initial contact and triage" },
  ],
};

export default primaryPatientAgentConfig;
