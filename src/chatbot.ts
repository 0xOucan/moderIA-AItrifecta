import {
  AgentKit,
  CdpWalletProvider,
  wethActionProvider,
  walletActionProvider,
  erc20ActionProvider,
  cdpApiActionProvider,
  cdpWalletActionProvider,
  pythActionProvider,
  Network,
  ViemWalletProvider,
} from "@coinbase/agentkit";

import { getLangChainTools } from "@coinbase/agentkit-langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as readline from "readline";
import { TelegramInterface } from "./telegram-interface";
import "reflect-metadata";
import { nillionDBActionProvider } from "./action-providers/nillion-db";
import { createPublicClient, http } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from "viem/accounts";
import { createWalletClient } from "viem";

dotenv.config();

/**
 * Validates that required environment variables are set
 *
 * @throws {Error} - If required environment variables are missing
 * @returns {void}
 */
function validateEnvironment(): void {
  const missingVars: string[] = [];

  const requiredVars = [
    "OPENAI_API_KEY",
    "WALLET_PRIVATE_KEY",
    "SV_ORG_DID",
    "SV_PRIVATE_KEY",
    "SV_NODE1_URL",
    "SV_NODE1_DID",
    "SV_NODE2_URL",
    "SV_NODE2_DID",
    "SV_NODE3_URL",
    "SV_NODE3_DID",
    "SCHEMA_ID_SERVICE",
    "SCHEMA_ID_BOOKING",
    "SCHEMA_ID_REVIEW"
  ];
  
  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set");
    missingVars.forEach((varName) => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    process.exit(1);
  }

  console.log("Environment validated successfully");
}

// Add this right after imports and before any other code
validateEnvironment();

/**
 * Initialize the agent with CDP Agentkit
 *
 * @returns Agent executor and config
 */
async function initializeAgent() {
  try {
    console.log("Initializing agent...");

    const privateKey = process.env.WALLET_PRIVATE_KEY;

    if (!privateKey) {
      throw new Error("Wallet private key not found in environment variables");
    }

    // Use baseSepolia (testnet) as the default chain
    const selectedChain = baseSepolia;

    // Create Viem account and client
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    
    const transport = http(selectedChain.rpcUrls.default.http[0], {
      batch: true,
      fetchOptions: {},
      retryCount: 3,
      retryDelay: 100,
      timeout: 30_000,
    });

    const client = createWalletClient({
      account,
      chain: selectedChain,
      transport,
    });

    // Create Viem wallet provider
    const walletProvider = new ViemWalletProvider(client);

    // Initialize LLM
    const llm = new ChatOpenAI({
      model: "gpt-4-turbo-preview",
      temperature: 0,
    });

    console.log("LLM initialized");

    // Initialize AgentKit with Nillion DB
    const agentkit = await AgentKit.from({
      walletProvider,
      actionProviders: [
        walletActionProvider(),
        nillionDBActionProvider(),
      ],
    });

    const tools = await getLangChainTools(agentkit);
    const memory = new MemorySaver();
    const agentConfig = {
      configurable: { thread_id: "Moderia AI Marketplace Agent" },
    };

    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: `
        You are Moderia, a helpful AI marketplace agent that mediates digital deals between service providers and clients.
        Your main purpose is to facilitate service bookings, handle payments, and mediate disputes between parties.
        
        🌟 MODERIA: "Modern mediator for digital deals" 🌟
        
        Core Features:
        
        💼 Service Marketplace:
        - Service providers can list their services with availability
        - Clients can browse and book available services
        - Handle secure payments and escrow
        
        📅 Booking Management:
        - Create and confirm bookings
        - Generate meeting links
        - Send reminders
        - Track service completion
        
        🤖 Meeting Participation:
        - Join service calls to take notes
        - Monitor quality and compliance
        - Provide objective third-party oversight
        
        ⚖️ Dispute Resolution:
        - Mediate disagreements between parties
        - Review meeting notes for evidence
        - Issue fair resolutions
        - Handle refunds or compensation when necessary
        
        Service Types:
        - Language classes
        - Tutoring sessions
        - Consulting appointments
        - Coaching sessions
        - Other professional services
        
        When responding to users, use these context emojis:
        ℹ️ For general information
        ✅ For successful operations
        ❌ For errors or failures
        📋 For listings and search results
        🔧 For system operations
        ⚖️ For dispute resolution
        🔄 For status updates
        
        Example commands:
        - "Create a new French class service for next Monday"
        - "Find available tutoring sessions for math"
        - "Book the Spanish class with Maria for tomorrow"
        - "Complete my booking for math tutoring with review"
        - "Resolve dispute for booking XYZ"
        
        Always maintain a helpful, neutral, and professional tone while mediating digital deals.
      `,
    });

    console.log("Agent initialization complete");
    return { agent, config: agentConfig };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}

/**
 * Run the agent autonomously with specified intervals
 */
async function runAutonomousMode(agent: any, config: any, interval = 10) {
  console.log("Starting autonomous mode...");

  while (true) {
    try {
      const thought =
        "Be creative and help manage the marketplace by identifying any pending disputes or checking on upcoming bookings.";

      const stream = await agent.stream(
        { messages: [new HumanMessage(thought)] },
        config,
      );

      for await (const chunk of stream) {
        if ("agent" in chunk) {
          console.log(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
        console.log("-------------------");
      }

      await new Promise((resolve) => setTimeout(resolve, interval * 1000));
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error:", error.message);
      }
      process.exit(1);
    }
  }
}

/**
 * Run the agent interactively based on user input
 */
async function runChatMode(agent: any, config: any) {
  console.log("Starting chat mode... Type 'exit' to end.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  try {
    while (true) {
      const userInput = await question("\nPrompt: ");

      if (userInput.toLowerCase() === "exit") {
        break;
      }

      const stream = await agent.stream(
        { messages: [new HumanMessage(userInput)] },
        config,
      );

      for await (const chunk of stream) {
        if ("agent" in chunk) {
          console.log(chunk.agent.messages[0].content);
        } else if ("tools" in chunk) {
          console.log(chunk.tools.messages[0].content);
        }
        console.log("-------------------");
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

/**
 * Run the Telegram interface mode
 */
async function runTelegramMode(agent: any, config: any) {
  console.log("Starting Telegram mode... Waiting for /start command");

  return new Promise<void>((resolve) => {
    const telegram = new TelegramInterface(agent, config, {
      onExit: () => {
        console.log("Exiting Telegram mode...");
        resolve();
      },
      onKill: () => {
        console.log("Kill command received. Shutting down...");
        process.exit(0);
      },
    });
  });
}

/**
 * Run a demo sequence showcasing Moderia's capabilities
 */
async function runDemoMode(agent: any, config: any) {
  console.log("🎮 Starting demo mode...");
  
  const demoScenarios = [
    "Create a new French tutoring service for next Monday at 2 PM, priced at $50 per hour",
    "Show me available language tutoring services",
    "Book the French tutoring service for Monday",
    "Generate a meeting link for the French tutoring session",
    "Complete the French tutoring booking and leave a 5-star review",
    "Show me the booking history for French tutoring services",
    "Report an issue with a tutoring session that was incomplete",
    "Resolve the dispute for the tutoring session"
  ];

  for (const scenario of demoScenarios) {
    console.log("\n🔄 Demo Action:", scenario);
    console.log("-------------------");

    const stream = await agent.stream(
      { messages: [new HumanMessage(scenario)] },
      config
    );

    for await (const chunk of stream) {
      if ("agent" in chunk) {
        console.log(chunk.agent.messages[0].content);
      } else if ("tools" in chunk) {
        console.log(chunk.tools.messages[0].content);
      }
      console.log("-------------------");
    }

    // Add a delay between scenarios for better readability
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log("\n✨ Demo completed! Type 'exit' to return to mode selection or continue chatting.");
}

/**
 * Choose whether to run in autonomous, chat, or telegram mode
 */
async function chooseMode(): Promise<"chat" | "auto" | "telegram" | "demo"> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  while (true) {
    console.log("\nAvailable modes:");
    console.log("1. chat      - Interactive chat mode");
    console.log("2. telegram  - Telegram bot mode");
    console.log("3. auto      - Autonomous action mode");
    console.log("4. demo      - Run demo sequence");

    const choice = (await question("\nChoose a mode (enter number or name): "))
      .toLowerCase()
      .trim();

    rl.close();

    if (choice === "1" || choice === "chat") {
      return "chat";
    } else if (choice === "2" || choice === "telegram") {
      return "telegram";
    } else if (choice === "3" || choice === "auto") {
      return "auto";
    } else if (choice === "4" || choice === "demo") {
      return "demo";
    }
    console.log("Invalid choice. Please try again.");
  }
}

/**
 * Main entry point
 */
async function main() {
  try {
    console.log("Starting initialization...");
    const { agent, config } = await initializeAgent();
    console.log("Agent initialized successfully");

    while (true) {
      const mode = await chooseMode();
      console.log(`Selected mode: ${mode}`);

      if (mode === "chat") {
        await runChatMode(agent, config);
      } else if (mode === "telegram") {
        await runTelegramMode(agent, config);
      } else if (mode === "demo") {
        await runDemoMode(agent, config);
      } else {
        await runAutonomousMode(agent, config);
      }

      // After any mode exits, we'll loop back to mode selection
      console.log("\nReturning to mode selection...");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Fatal error:", error.message);
    }
    process.exit(1);
  }
}

main();
