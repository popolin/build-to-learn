export const tools = [
  {
    name: "get_messages_by_member",
    description: "Returns all messages sent by a specific group member.",
    input_schema: {
      type: "object",
      properties: {
        member: {
          type: "string",
          description: "The name or phone number of the member.",
        },
      },
      required: ["member"],
    },
  },
  {
    name: "get_messages_by_period",
    description: "Returns all messages sent within a specific time period.",
    input_schema: {
      type: "object",
      properties: {
        start: {
          type: "string",
          description: "Start date in ISO format (e.g. 2024-01-01).",
        },
        end: {
          type: "string",
          description: "End date in ISO format (e.g. 2024-12-31).",
        },
      },
      required: ["start", "end"],
    },
  },
  {
    name: "get_metrics",
    description:
      "Returns overall group metrics: total messages, message count per member, and activity period.",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];
