export interface Message {
  date: Date;
  member: string;
  text: string;
}

export interface GetMessagesByMemberInput {
  member: string;
}

export interface GetMessagesByPeriodInput {
  start: string;
  end: string;
}

export type ToolInput = GetMessagesByMemberInput | GetMessagesByPeriodInput | Record<never, never>;

export enum ToolName {
    GetMessagesByMember = "get_messages_by_member",
    GetMessagesByPeriod = "get_messages_by_period",
    GetMetrics = "get_metrics",
}
