import type { Message } from "./types.js";

export function parseWhatsApp(content: string): Message[] {
  const lines = content.split("\n");
  const messages: Message[] = [];

  const regex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}), (\d{1,2}:\d{2}) - ([^:]+): (.+)$/;

  for (const line of lines) {
    const match = line.match(regex);
    if (!match) continue;

    const [_, date, time, member, text] = match;

    if(member && text) {
        messages.push({
        date: new Date(`${date} ${time}`),
        member: member.trim(),
        text: text.trim(),
        });
    }
  }

  return messages;
}

export function getMessagesByMember(messages: Message[], member: string): Message[] {
  return messages.filter((m) =>
    m.member.toLowerCase().includes(member.toLowerCase())
  );
}

export function getMessagesByPeriod(
  messages: Message[],
  start: Date,
  end: Date
): Message[] {
  return messages.filter((m) => m.date >= start && m.date <= end);
}

export function getMetrics(messages: Message[]) {
  const counts: Record<string, number> = {};

  for (const m of messages) {
    counts[m.member] = (counts[m.member] || 0) + 1;
  }

  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  return {
    total_messages: messages.length,
    members: sorted.map(([member, count]) => ({ member, count })),
    period: {
      start: messages[0]?.date,
      end: messages[messages.length - 1]?.date,
    },
  };
}
