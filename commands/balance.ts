import { CommandObject, CommandType } from "wokcommands";
import { ColorResolvable, EmbedBuilder } from "discord.js";
import { findOneUser, getRandomColor } from "../utils";

export default {
    description: "View your (or someone else's) balance!",
    type: CommandType.LEGACY,
    aliases: ["bal"],
    guildOnly: true,
    maxArgs: 1,
    expectedArgs: "[@user]",
    reply: true,
    callback: async ({ message }) => {
        const user = message!.mentions.users.first() || message!.author;
        const User = await findOneUser(user.id);
        const randomColor = await getRandomColor(user.id);

        const embed = new EmbedBuilder()
            .setColor(randomColor as ColorResolvable)
            .setTitle(`Balance of ${user.username}`)
            .addFields([
                {
                    name: "Bones In Stomach",
                    value: `${User.bonesInStomach!}`,
                    inline: true,
                },
                {
                    name: "Bones Collected",
                    value: `${User.bonesCollected!}`,
                    inline: true,
                },
            ]);

        return {
            embeds: [embed],
        };
    },
} as CommandObject;
