import { CommandObject, CommandType } from "wokcommands";
import Users from "../schemas/UserSchema";
import { EmbedBuilder } from "discord.js";
import { findOneUser, removeOneItem } from "../utils";

export default {
    description: "Extract all the bones from your stomach",
    type: CommandType.LEGACY,
    guildOnly: true,
    maxArgs: 0,
    reply: true,
    callback: async ({ message }) => {
        const author = message!.author;
        const EndUser = await findOneUser(author.id);
        let bonesInStomach = EndUser.bonesInStomach!;

        if (bonesInStomach <= 0) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription("You don't have any bones inside of you!");

            return {
                embeds: [embed],
            };
        }

        const loseBones =
            bonesInStomach > 206 && EndUser.items!["medicine"] <= 0
                ? Math.random() > 0.49
                : false;
        const bonesLost =
            bonesInStomach / (loseBones ? Math.floor(Math.random() * 5) : 1);
        const hasMedicine = EndUser.items!["medicine"] > 0;

        if (loseBones) bonesInStomach -= bonesLost;

        if (hasMedicine) {
            const UpdatedEndUser = await Users.findOneAndUpdate(
                {
                    id: author.id,
                },
                {
                    $inc: {
                        bonesCollected: bonesInStomach,
                    },
                    $set: {
                        bonesInStomach: 0,
                        items: await removeOneItem(
                            "medicine",
                            author.id,
                            false
                        ),
                    },
                }
            );

            UpdatedEndUser!.save();
        } else {
            const UpdatedEndUser = await Users.findOneAndUpdate(
                {
                    id: author.id,
                },
                {
                    $inc: {
                        bonesCollected: bonesInStomach,
                    },
                    $set: {
                        bonesInStomach: 0,
                    },
                }
            );

            UpdatedEndUser!.save();
        }

        const embed = new EmbedBuilder()
            .setColor("#00FF02")
            .setTitle(
                hasMedicine
                    ? "Slower Digestion saved your deserved bones!"
                    : null
            )
            .setDescription(
                `You have successfully extracted all **${bonesInStomach}** bones from your stomach${
                    loseBones
                        ? `(you did fail to extract **${bonesLost}** bones though)`
                        : ""
                }, they're all dried off and ready to use!`
            );

        return {
            embeds: [embed],
        };
    },
} as CommandObject;
