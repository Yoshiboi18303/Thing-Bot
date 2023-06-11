import { CommandObject, CommandType } from "wokcommands";
import Users from "../schemas/UserSchema";
import { EmbedBuilder } from "discord.js";
import { getItem } from "../utils/ShopItems";
import { ItemPurchaseStatus } from "../classes/Item";
import { prependString } from "../utils";

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
        const item = getItem(itemId);
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

        if (quantity < 1) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(
                    "You have to buy at least 1 item, come on bruh."
                );

            return {
                embeds: [embed],
            };
        }

        let status: ItemPurchaseStatus;

        if (itemIdsToNotAdd.includes(item.id))
            status = await item.buy(author.id, quantity, false);
        else status = await item.buy(author.id, quantity);

        if (!status.success) {
            const failedEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(
                    `Purchase of **${item.name}** failed. Please view the **\`Message\`** field for more details!`
                )
                .addFields([
                    {
                        name: "Message",
                        value: status.message,
                        inline: true,
                    },
                ]);

            if (status.error)
                failedEmbed.addFields([
                    {
                        name: "Error",
                        value: `${status.error}`,
                        inline: true,
                    },
                ]);

            return {
                embeds: [failedEmbed],
            };
        } else {
            const isCompetition = item.id === "competition";
            let statusText = "Your data should have been updated and saved.";

            if (isCompetition) {
                const stomachCapacityIncrement = Math.ceil(
                    Math.random() * (11 * quantity)
                );
                statusText = prependString(
                    statusText,
                    `After the eating competition, your stomach capacity has gone up by **${stomachCapacityIncrement}**!`
                );
                const UpdatedEndUser = await Users.findOneAndUpdate(
                    {
                        id: author.id,
                    },
                    {
                        $inc: {
                            stomachCapacity: stomachCapacityIncrement,
                        },
                    }
                );

                UpdatedEndUser!.save();
            }

            const successEmbed = new EmbedBuilder()
                .setColor("#00FF02")
                .setDescription(
                    `**${quantity}** of **${item.name}** purchased! ${statusText}`
                );

            return {
                embeds: [successEmbed],
            };
        }
    },
} as CommandObject;
