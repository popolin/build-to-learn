# WhatsApp Analyzer

An AI-powered CLI that analyzes WhatsApp group chat history using the Anthropic API.

## What it does

- Parses exported WhatsApp `.txt` files
- Provides an interactive chat interface to query the group history
- Uses Claude tools to answer questions about members, periods, and metrics

## Example queries

- "Who sent the most messages?"
- "What did Rodrigo say?"
- "How many messages were sent in 2024?"

## Stack

- TypeScript
- [Anthropic SDK](https://github.com/anthropic-ai/anthropic-sdk-typescript)

## Setup
```bash
npm install
```

Add your Anthropic API key to `.env`:
```
ANTHROPIC_API_KEY=sk-ant-...
```

Export a WhatsApp conversation (without media) and place it at `data/conversa.txt`.

## Run
```bash
npx tsx src/index.ts
```

## Concepts covered

- Anthropic API — messages, system prompt, parameters
- Tool use — definition, input schema, result handling
- Chat loop — conversation history, stop_reason
- XML tag parsing — extracting structured replies
- TypeScript interfaces for tool inputs
