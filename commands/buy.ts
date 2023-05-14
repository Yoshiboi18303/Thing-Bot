import { CommandObject, CommandType } from "wokcommands";
import Users from "../schemas/UserSchema";
import { EmbedBuilder } from "discord.js";
import ShopItems from "../utils/ShopItems";

const itemIdsToNotAdd: string[] = ["competition"];

export default {
    description: "Buy something from the shop",
    type: CommandType.LEGACY,
    guildOnly: true,
    minArgs: 1,
    maxArgs: 2,
    expectedArgs: "<item id> [quantity]",
    reply: true,
    callback: async ({ message, args }) => {
        const itemId = args[0];
        const quantity = parseInt(args[1] || "1");
        const item = ShopItems.find((shopItem) => shopItem.id === itemId);
        const author = message!.author;

        if (!item) {
            const invalidItemEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(
                    "That's not a valid item ID, please run the shop command to view all items!"
                );

            return {
                embeds: [invalidItemEmbed],
            };
        }

        if (isNaN(quantity)) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription("That's not a number!");

            return {
                embeds: [embed],
            };
        }

        let success: boolean;

        if (itemIdsToNotAdd.includes(item.id))
            success = await item.buy(author.id, quantity, false);
        else success = await item.buy(author.id, quantity);

        if (!success) {
            const failedEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(
                    `Purchase of **${item.name}** failed, you have not been charged.`
                );

            return {
                embeds: [failedEmbed],
            };
        } else {
            if (item.id === "competition") {
                const UpdatedEndUser = await Users.findOneAndUpdate(
                    {
                        id: author.id,
                    },
                    {
                        $inc: {
                            stomachCapacity: Math.ceil(Math.random() * 11),
                        },
                    }
                );

                UpdatedEndUser!.save();
            }

            const successEmbed = new EmbedBuilder()
                .setColor("#00FF02")
                .setDescription(
                    `**${quantity}** of **${item.name}** purchased! Your data should have been updated and saved.`
                );

            return {
                embeds: [successEmbed],
            };
        }
    },
} as CommandObject;
