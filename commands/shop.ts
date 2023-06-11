import { CommandObject, CommandType } from "wokcommands";
import { EmbedBuilder } from "discord.js";
import {forEach, getItem} from "../utils/ShopItems";
import {ItemUsage} from "../classes/Item";

function addUsage(usage: ItemUsage | ItemUsage[], embed: EmbedBuilder) {
    if (Array.isArray(usage)) usage.forEach((value, index) => embed.addFields([
            {
                name: `Usage ${index + 1}`,
                value: `${value.command !== "indirect" ? `**For command:** ${value.command}` : "Indirect usage"}\n**Purpose:** ${value.purpose}`,
                inline: true
            }
        ]))
    else embed.addFields([
        {
            name: "Usage",
            value: `${usage.command !== "indirect" ? `**For command:** ${usage.command}` : "Indirect usage"}\n**Purpose:** ${usage.purpose}`,
            inline: true
        }
    ])
}

export default {
    description: "View all items (or one item) in the shop",
    type: CommandType.LEGACY,
    guildOnly: true,
    minArgs: 0,
    maxArgs: 1,
    expectedArgs: "[item]",
    reply: true,
    callback: ({ args }) => {
        const item = getItem(args[0]);
        
        if (item) {
            const itemEmbed = new EmbedBuilder()
                .setColor(item.color)
                .setTitle(item.name)
                .setDescription(`Here's the extended info for ${item.name}!`)
                .setThumbnail(item.thumbnail)
                .addFields([
                    {
                        name: "ID",
                        value: item.id,
                        inline: true
                    },
                    {
                        name: "Description",
                        value: item.description,
                        inline: true
                    },
                    {
                        name: "Price",
                        value: `${item.price}`,
                        inline: true
                    }
                ])
            
            if (item.usage) addUsage(item.usage, itemEmbed);
            
            return {
                embeds: [itemEmbed]
            }
        }
        
        const shopEmbed = new EmbedBuilder()
            .setColor("Blurple")
            .setTitle("Shop")
            .setDescription("Welcome to the shop! Have a look around!");

        forEach((item) => shopEmbed.addFields([
                {
                    name: item.name,
                    value: `**ID:** ${item.id}\n**Price:** ${item.price}`,
                    inline: true
                },
            ])
        )

        return {
            embeds: [shopEmbed],
        };
    },
} as CommandObject;
