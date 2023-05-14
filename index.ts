import { Client, IntentsBitField, Partials } from "discord.js";
import WOK, { DefaultCommands } from "wokcommands";
import path from "path";
import mongoose from "mongoose";
import { activityLoop } from "./utils";
require("dotenv/config");

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.MessageContent,
    ],
    partials: [Partials.Channel],
    allowedMentions: {
        parse: ["roles", "users"],
        repliedUser: true,
    },
});

client.on("ready", async () => {
    console.log("The client is ready!");

    // Register all commands.
    new WOK({
        client,
        commandsDir: path.join(__dirname, "commands"),
        mongoUri: process.env.MONGO_CONNECTION_STRING,
        botOwners: ["697414293712273408"],
        disabledDefaultCommands: [
            DefaultCommands.CustomCommand,
            DefaultCommands.RequiredPermissions,
        ],
        cooldownConfig: {
            errorMessage: "Please wait {TIME} before doing that again.",
            botOwnersBypass: false,
            dbRequired: 10,
        },
    });

    // Start bot activity loop
    await activityLoop(client);
});

mongoose.connect(process.env.MONGO_CONNECTION_STRING!);

client.login(process.env.TOKEN);
