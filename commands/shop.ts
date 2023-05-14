import { CommandObject, CommandType } from "wokcommands";
import { EmbedBuilder } from "discord.js";
import ShopItems from "../utils/ShopItems";

export default {
    description: "View all items in the shop",
    type: CommandType.LEGACY,
    guildOnly: true,
    minArgs: 0,
    maxArgs: 0,
    expectedArgs: "[item]",
    reply: true,
    callback: () => {
        const shopEmbed = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle("Shop")
            .setDescription("Welcome to the shop! Have a look around!");

        for (const item of ShopItems) {
            shopEmbed.addFields([
                {
                    name: item.name,
                    value: `**ID:** ${item.id}\n**Description:** ${item.description}\n**Price:** ${item.price}`,
                },
            ]);
        }

        return {
            embeds: [shopEmbed],
        };
    },
} as CommandObject;
