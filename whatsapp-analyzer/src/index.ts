import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as readline from "readline";
import { parseWhatsApp, getMessagesByMember, getMessagesByPeriod, getMetrics } from "./parser.js";
import { tools } from "./tools.js";
import type { GetMessagesByMemberInput, GetMessagesByPeriodInput, ToolInput } from "./types.js";
import { ToolName } from "./types.js";

dotenv.config();


const client = new Anthropic();
const content = fs.readFileSync("data/conversa.txt", "utf-8");
const messages = parseWhatsApp(content);

async function getWelcomeMessage(): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 256,
    system: `Introduce yourself and list what you can help with based on your available tools. Be brief and friendly. Start in Portuguese (Brazil).`,
    tools: tools as Anthropic.Tool[],
    messages: [
      {
        role: "user",
        content: "Introduce yourself and list what you can help with based on your available tools. Be brief and friendly.",
      },
    ],
  });

  const raw = response.content.find((b) => b.type === "text") as Anthropic.TextBlock;
  return raw?.text ?? "WhatsApp Analyzer ready.";
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(prompt: string): Promise<string> {
  return new Promise((resolve) => rl.question(prompt, resolve));
}

function processTool(toolName: string, toolInput: ToolInput) {
  if (toolName === ToolName.GetMessagesByMember) {
    const { member } = toolInput as GetMessagesByMemberInput;
    return getMessagesByMember(messages, member).slice(0, 50);
  }

  if (toolName === ToolName.GetMessagesByPeriod) {
    const { start, end } = toolInput as GetMessagesByPeriodInput;
    return getMessagesByPeriod(
      messages,
      new Date(start),
      new Date(end)
    ).slice(0, 50);
  }

  if (toolName === ToolName.GetMetrics) {
    return getMetrics(messages);
  }

  return "Tool not found.";
}

async function chat() {
  const system = `You are an assistant that analyzes a WhatsApp group chat history.
            You have access to tools to query the messages. Use them when needed.
            Start in Portuguese (Brazil).
            Always respond to the user inside <reply></reply> tags.`;


  const metrics = getMetrics(messages);
  const welcome = await getWelcomeMessage();
  console.log(`\n${welcome}`);
  console.log(`\nLoaded ${metrics.total_messages} messages from ${metrics.period.start?.getFullYear()} to ${metrics.period.end?.getFullYear()}.`);
  console.log('Type "quit" to exit.\n');

  const history: Anthropic.MessageParam[] = [];

  while (true) {
    const userInput = await ask("You: ");

    if (userInput.toLowerCase() === "quit") {
      rl.close();
      break;
    }

    history.push({ role: "user", content: userInput });

    while (true) {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system,
        tools: tools as Anthropic.Tool[],
        messages: history,
      });

      history.push({ role: "assistant", content: response.content });

      if (response.stop_reason === "tool_use") {
        const toolUse = response.content.find((b) => b.type === "tool_use") as Anthropic.ToolUseBlock;
        const toolResult = processTool(toolUse.name, toolUse.input as Record<string, string>);

        console.log(`\n[calling tool: ${toolUse.name}]\n`);

        history.push({
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: toolUse.id,
              content: JSON.stringify(toolResult),
            },
          ],
        });

        // continue the loop so Claude can respond after the tool result
        continue;
      }

      // Claude finished — extract reply from XML tags
      const raw = response.content.find((b) => b.type === "text") as Anthropic.TextBlock;
      const match = raw?.text.match(/<reply>([\s\S]*?)<\/reply>/);
      const reply = match?.[1] ? match[1].trim() : raw?.text;

      console.log(`\nAssistant: ${reply}\n`);
      break;
    }
  }
}

chat();