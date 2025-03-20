import TelegramBot from "node-telegram-bot-api";
import { HumanMessage } from "@langchain/core/messages";

interface TelegramInterfaceOptions {
  onExit: () => void;
  onKill: () => void;
}

export class TelegramInterface {
  private bot: TelegramBot;
  private agent: any;
  private config: any;
  private options: TelegramInterfaceOptions;
  private isStarted: boolean = false;
  private demoScenarios = [
    "Create a new French tutoring service for next Monday at 2 PM, priced at $50 per hour",
    "Show me available language tutoring services",
    "Book the French tutoring service for Monday",
    "Generate a meeting link for the French tutoring session",
    "Complete the French tutoring booking and leave a 5-star review",
    "Show me the booking history for French tutoring services",
    "Report an issue with a tutoring session that was incomplete",
    "Resolve the dispute for the tutoring session"
  ];

  constructor(agent: any, config: any, options: TelegramInterfaceOptions) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error("TELEGRAM_BOT_TOKEN must be provided!");
    }

    this.bot = new TelegramBot(token, { polling: true });
    this.agent = agent;
    this.config = config;
    this.options = options;

    this.setupHandlers();
    console.log("Telegram bot initialized. Waiting for /start command...");
  }

  private setupHandlers() {
    // Handle /start command
    this.bot.onText(/\/start/, (msg) => {
      const chatId = msg.chat.id;
      this.isStarted = true;
      console.log(
        `Telegram session started by user ${msg.from?.username || msg.from?.id}`,
      );
      this.bot.sendMessage(
        chatId,
        "🌟 *Welcome to Moderia* 🌟\n\nI'm your AI marketplace mediator for digital deals. I help connect service providers with clients and ensure smooth transactions.\n\nHow can I assist you today?\n\n• List a service you offer\n• Find available services\n• Book a service\n• Manage your bookings\n• Handle disputes\n\nUse /exit to return to terminal or /kill to shut down the application.",
        { parse_mode: "Markdown" }
      );
    });

    // Handle /exit command
    this.bot.onText(/\/exit/, async (msg) => {
      const chatId = msg.chat.id;
      if (this.isStarted) {
        await this.bot.sendMessage(chatId, "👋 Goodbye! Returning to terminal...");
        console.log("Telegram session ended. Returning to terminal...");
        this.bot.stopPolling();
        this.options.onExit();
      }
    });

    // Handle /kill command
    this.bot.onText(/\/kill/, async (msg) => {
      const chatId = msg.chat.id;
      if (this.isStarted) {
        await this.bot.sendMessage(chatId, "🛑 Shutting down the application...");
        console.log("Kill command received. Shutting down...");
        this.bot.stopPolling();
        this.options.onKill();
      }
    });

    // Handle /help command
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;
      if (this.isStarted) {
        await this.bot.sendMessage(
          chatId,
          "🌟 *Moderia Help* 🌟\n\n*Service Provider Commands:*\n• Create a new service - List your availability for a service\n• View my services - See services you've listed\n• Update service status - Mark service as unavailable\n\n*Client Commands:*\n• Find services - Browse available services\n• Book a service - Reserve a time slot\n• View my bookings - See your upcoming bookings\n• Complete booking - Finalize a completed service\n\n*Dispute Resolution:*\n• Report issue - Report a problem with a service\n• Dispute booking - Contest a service quality\n\nUse natural language for all commands - I'm designed to understand your needs!",
          { parse_mode: "Markdown" }
        );
      }
    });

    // Handle /menu command
    this.bot.onText(/\/menu/, async (msg) => {
      const chatId = msg.chat.id;
      if (this.isStarted) {
        await this.bot.sendMessage(
          chatId,
          "🎯 *Available Commands*\n\n" +
          "*Basic Commands:*\n" +
          "• /start - Start the bot\n" +
          "• /menu - Show this menu\n" +
          "• /help - Get detailed help\n" +
          "• /demo - Run a demo sequence\n" +
          "• /exit - Return to terminal\n" +
          "• /kill - Shut down the application\n\n" +
          "*Service Provider Actions:*\n" +
          "• Create a new service\n" +
          "• Update service details\n" +
          "• List my services\n" +
          "• Set availability\n\n" +
          "*Client Actions:*\n" +
          "• Find services\n" +
          "• Book a service\n" +
          "• View my bookings\n" +
          "• Cancel booking\n\n" +
          "*Payment & Reviews:*\n" +
          "• Complete booking\n" +
          "• Leave review\n" +
          "• Check payment status\n\n" +
          "*Support & Disputes:*\n" +
          "• Report issue\n" +
          "• Open dispute\n" +
          "• Contact support\n\n" +
          "💡 _Use natural language for all actions!_",
          { parse_mode: "Markdown" }
        );
      }
    });

    // Handle /demo command
    this.bot.onText(/\/demo/, async (msg) => {
      const chatId = msg.chat.id;
      if (this.isStarted) {
        await this.bot.sendMessage(
          chatId,
          "🎮 *Starting Demo Mode*\n\nI'll walk you through a complete service booking and dispute resolution scenario. Watch how I handle each step!\n\n_Demo will begin in 3 seconds..._",
          { parse_mode: "Markdown" }
        );

        await new Promise(resolve => setTimeout(resolve, 3000));

        for (const scenario of this.demoScenarios) {
          await this.bot.sendMessage(
            chatId,
            `🔄 *Demo Action:*\n${scenario}`,
            { parse_mode: "Markdown" }
          );

          await this.bot.sendChatAction(chatId, "typing");

          const stream = await this.agent.stream(
            { messages: [new HumanMessage(scenario)] },
            this.config
          );

          let response = "";
          for await (const chunk of stream) {
            if ("agent" in chunk) {
              response += chunk.agent.messages[0].content;
            } else if ("tools" in chunk) {
              response += chunk.tools.messages[0].content;
            }
          }

          await this.bot.sendMessage(chatId, response);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

        await this.bot.sendMessage(
          chatId,
          "✨ *Demo Completed!*\n\nNow you can try these actions yourself or explore other features using the /menu command.",
          { parse_mode: "Markdown" }
        );
      }
    });

    // Handle all other messages
    this.bot.on("message", async (msg) => {
      if (msg.text && !msg.text.startsWith("/") && this.isStarted) {
        const chatId = msg.chat.id;
        console.log(
          `Received message from ${msg.from?.username || msg.from?.id}: ${msg.text}`,
        );

        try {
          await this.bot.sendChatAction(chatId, "typing");

          const stream = await this.agent.stream(
            { messages: [new HumanMessage(msg.text)] },
            this.config,
          );

          let response = "";
          for await (const chunk of stream) {
            if ("agent" in chunk) {
              response += chunk.agent.messages[0].content;
            } else if ("tools" in chunk) {
              response += chunk.tools.messages[0].content;
            }
          }

          console.log(
            `Sending response to ${msg.from?.username || msg.from?.id}: ${response}`,
          );
          await this.bot.sendMessage(chatId, response);
        } catch (error) {
          console.error("Error processing message:", error);
          await this.bot.sendMessage(
            chatId,
            "❌ Sorry, I encountered an error processing your message. Please try again later.",
          );
        }
      }
    });
  }
}
