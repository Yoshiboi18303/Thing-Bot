import { CommandObject, CommandType } from "wokcommands";
import { EmbedBuilder, AttachmentBuilder } from "discord.js";
import { readFile } from "fs/promises";
import * as path from "path";

export default {
    description: "View some of the source code!",
    type: CommandType.LEGACY,
    aliases: ["view", "code", "vc"],
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "<path>",
    ownerOnly: true,
    reply: true,
    callback: async ({ args }) => {
        const pathToFile = args[0];

        const filePath = path.join(process.cwd(), pathToFile);
        const filePathSplit = filePath.split(".");
        const extension = filePathSplit[filePathSplit.length - 1];
        let error: boolean = false;
        let file = await readFile(filePath).catch((err) => {
            console.error(err);
            error = true;
            return;
        });

        if (error)
            return {
                content:
                    "An error occurred while reading the file, this has been logged in the console!",
            };

        file = file as Buffer;
        const fileString = file.toString("utf-8");

        if (fileString.length > 2048) {
            const attachment = new AttachmentBuilder(file, {
                name: `code.${extension}`,
            });

            return {
                content: `That ${extension.toUpperCase()} file is too long, so here's an attachment!`,
                files: [attachment],
            };
        } else {
            const embed = new EmbedBuilder()
                .setColor("Blurple")
                .setTitle("File Code")
                .setDescription(`\`\`\`${extension}\n${fileString}\n\`\`\``);

            return {
                embeds: [embed],
            };
        }
    },
} as CommandObject;
