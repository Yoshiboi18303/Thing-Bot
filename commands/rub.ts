import { CommandObject, CommandType } from "wokcommands";
import Users from "../schemas/UserSchema";
import { EmbedBuilder } from "discord.js";
import { findOneUser } from "../utils";

export default {
    description: "Rub your (or someone else's) belly",
    type: CommandType.LEGACY,
    maxArgs: 1,
    expectedArgs: "[@user]",
    reply: true,
    guildOnly: true,
    callback: async ({ client, message }) => {
        const user = message!.mentions.users.first() || message!.author;
        const User = await findOneUser(user.id);

        const peopleInStomach = User.peopleInStomach!;
        const usernames: string[] = [];

        for (const person of peopleInStomach) {
            const userInStomach = client.users.cache.get(person); // If they're uncached, there's not much we can do.
            const Person = await Users.findOne({
                id: person,
            });
            usernames.push(
                `\`${userInStomach?.username || "Unknown/Uncached User"}\`${
                    Person
                        ? ` (**${Person.softness! < 0.5 ? "Hard" : "Soft"}**)`
                        : ""
                }`
            );
        }

        const isEndUser = user.id === message!.author.id;
        const embed = new EmbedBuilder()
            .setColor("Blurple")
            .setDescription(
                `You have rubbed ${
                    isEndUser ? "your" : `${user.username}'s`
                } belly and felt all the users inside of ${
                    isEndUser ? "it" : "them"
                }.`
            )
            .addFields([
                {
                    name: "People",
                    value:
                        usernames.length === 0 ? "None" : usernames.join(", "),
                    inline: true,
                },
            ]);

        return {
            embeds: [embed],
        };
    },
} as CommandObject;
