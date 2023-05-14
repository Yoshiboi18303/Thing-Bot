import { CommandObject, CommandType } from "wokcommands";
import Users from "../schemas/UserSchema";
import { ColorResolvable, EmbedBuilder } from "discord.js";
import { findOneUser, removeOneItem } from "../utils";

// Why did I decide to make this command, my god...
// I regret making this command
export default {
    description: "Spit all over someone (disgusting)",
    type: CommandType.LEGACY,
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "<@user>",
    reply: true,
    callback: async ({ message }) => {
        const author = message!.author;
        const user = message!.mentions.users.first();

        if (!user) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription("Please mention a user!");

            return {
                embeds: [embed],
            };
        }

        const EndUser = await findOneUser(author.id);
        const hasAcidSpit = EndUser.items!["acid"] > 0;

        if (user.id === author.id && hasAcidSpit) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(
                    "Okay, come on bro. You're just gonna melt your own skin with that, and for what?"
                )
                .setFooter({
                    text: "Not a good idea.",
                });

            return {
                embeds: [embed],
            };
        }

        if (hasAcidSpit) {
            const bonesGained =
                Math.random() > 0.79
                    ? 206
                    : Math.ceil(206 / Math.floor(Math.random() * 5));
            await removeOneItem("acid", author.id, true);

            const UpdatedEndUser = await Users.findOneAndUpdate(
                {
                    id: author.id,
                },
                {
                    $inc: {
                        bonesCollected: bonesGained,
                    },
                }
            );

            UpdatedEndUser!.save();

            const description =
                bonesGained === 206
                    ? `You spit some of your stomach acids all over **${user.username}** and got all _(**206**)_ of their bones!`
                    : `You spit some of your stomach acids all over **${user.username}** and got **${bonesGained}** bones from them!`;
            const embed = new EmbedBuilder()
                .setColor(EndUser.acidColor! as ColorResolvable)
                .setTitle("Used Acid Spit")
                .setDescription(description)
                .setFooter({
                    text: "You are definitely something, you know that?",
                });

            return {
                embeds: [embed],
            };
        } else {
            const embed = new EmbedBuilder()
                .setColor("DarkGrey")
                .setDescription(
                    `You just spit all over **${
                        user.id === author.id ? "yourself" : user.username
                    }**, disgusting.`
                );

            return {
                embeds: [embed],
            };
        }
    },
} as CommandObject;
