import { CommandObject, CommandType, CooldownTypes } from "wokcommands";
import Users from "../schemas/UserSchema";
import { ColorResolvable, EmbedBuilder } from "discord.js";
import { failCommand, findOneUser, removeOneItem } from "../utils";

// Why did I decide to make this command, my god...
// I regret making this command
export default {
    description: "Spit all over someone (disgusting)",
    type: CommandType.LEGACY,
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "<@user>",
    reply: true,
    cooldowns: {
        type: CooldownTypes.perUser,
        duration: "2 m",
        errorMessage: "Please calm it on the acid man, at least for {TIME}!",
    },
    callback: async ({ message, cancelCooldown }) => {
        const author = message!.author;
        const user = message!.mentions.users.first();

        if (!user) return failCommand("Please mention a user!", cancelCooldown);

        const EndUser = await findOneUser(author.id);
        const hasAcidSpit = EndUser.items!["acid"] > 0;

        if (user.id === author.id && hasAcidSpit)
            return failCommand(
                "Okay, come on bro. You're just gonna melt your own skin with that, and for what?",
                cancelCooldown,
                {
                    text: "Not a good idea.",
                },
                false
            );

        if (message!.channel.id === "1111409368064335962") cancelCooldown();
        if (hasAcidSpit) {
            // I hate math.
            const bonesGained = 206;
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

            const description = `You spit some of your stomach acids all over **${user.username}** and got all _(**206**)_ of their bones!`;
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

            cancelCooldown();

            return {
                embeds: [embed],
            };
        }
    },
} as CommandObject;
