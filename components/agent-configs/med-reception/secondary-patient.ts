import { AgentConfig, Tool, ToolParameters } from "@/lib/types";
import { SecondaryPatientPrompt } from "@/lib/ai/prompts";

const lookupPatientRecordParameters: ToolParameters = {
  type: "object",
  properties: {
    patientIdentifier: {
      type: "string",
      description: "Patient identifier (e.g., phone number, full name + DOB, patient ID)",
    },
  },
  required: ["patientIdentifier"],
};

const lookupPatientRecordTool: Tool = {
  type: "function",
  name: "lookupPatientRecord",
  description: "Looks up an existing patient's record using an identifier.",
  parameters: lookupPatientRecordParameters,
};

const getClinicInfo: ToolParameters = {
  type: "object",
  properties: {
    clinicNameOrLocation: {
      type: "string",
      description:
        "Name or location of the Meridian Clinic branch (e.g., 'Central', 'Downtown')",
    },
  },
  required: ["clinicNameOrLocation"],
};

const getClinicInfoTool: Tool = {
  type: "function",
  name: "getClinicInfo",
  description:
    "Retrieves information about a specific Meridian Clinic branch (address, hours, contact).",
  parameters: getClinicInfo,
};

const rescheduleAppointment: ToolParameters = {
  type: "object",
  properties: {
    appointmentId: { type: "string", description: "ID of the appointment to reschedule" },
    newAppointmentSlot: {
      type: "string",
      description: "The new desired date and time slot (e.g., '2025-07-18T15:00:00')",
    },
    patientIdentifier: {
      type: "string",
      description: "Patient identifier for verification",
    },
  },
  required: ["appointmentId", "newAppointmentSlot", "patientIdentifier"],
};

const rescheduleAppointmentTool: Tool = {
  type: "function",
  name: "rescheduleAppointment",
  description: "Reschedules an existing appointment to a new time slot.",
  parameters: rescheduleAppointment,
};

const cancelAppointmentParameters: ToolParameters = {
  type: "object",
  properties: {
    appointmentId: { type: "string", description: "ID of the appointment to cancel" },
    patientIdentifier: {
      type: "string",
      description: "Patient identifier for verification",
    },
    reason: { type: "string", description: "Reason for cancellation (optional)" },
  },
  required: ["appointmentId", "patientIdentifier"],
};

const cancelAppointmentTool: Tool = {
  type: "function",
  name: "cancelAppointment",
  description: "Cancels an existing appointment.",
  parameters: cancelAppointmentParameters,
};

const secondaryPatientAgentConfig: AgentConfig = {
  name: "SecondaryPatientHandler",
  publicDescription: "Handles inquiries and requests from existing patients.",
  instructions: SecondaryPatientPrompt,
  tools: [
    lookupPatientRecordTool,
    getClinicInfoTool,
    rescheduleAppointmentTool,
    cancelAppointmentTool,
  ],
  toolLogic: {
    lookupPatientRecord: async (args) => {
      console.log("[toolLogic] Looking up patient record with args:", args);
      return {
        patientId: "PAT-456",
        name: "Ivan Petrov",
        dob: "1985-03-10",
        lastVisit: "2025-05-20",
        upcomingAppointments: [
          {
            appointmentId: "APT-789",
            specialty: "General Practitioner",
            doctorName: "Dr. Sidorov",
            time: "2025-07-22T09:00:00",
          },
        ],
      };
    },
    getClinicInfo: async (args) => {
      console.log("[toolLogic] Getting clinic info with args:", args);
      if (args.clinicNameOrLocation.toLowerCase().includes("central")) {
        return {
          name: "ZdravClinic Central",
          address: "1 Central St, City",
          hours: "Mon-Fri 8:00-20:00, Sat 9:00-15:00",
          phone: "+7 (XXX) XXX-XX-01",
        };
      } else {
        return {
          error: "Clinic not found",
          details: `No info for ${args.clinicNameOrLocation}`,
        };
      }
    },
    rescheduleAppointment: async (args) => {
      console.log("[toolLogic] Rescheduling appointment with args:", args);
      return {
        success: true,
        appointmentId: args.appointmentId,
        confirmationDetails: `Appointment ${args.appointmentId} rescheduled to ${args.newAppointmentSlot}`,
      };
    },
    cancelAppointment: async (args) => {
      console.log("[toolLogic] Cancelling appointment with args:", args);
      return {
        success: true,
        appointmentId: args.appointmentId,
        confirmationDetails: `Appointment ${args.appointmentId} has been cancelled.`,
      };
    },
  },
  downstreamAgents: [
    { name: "Reception Assistant", publicDescription: "Initial contact and triage" },
  ],
};

export default secondaryPatientAgentConfig;
