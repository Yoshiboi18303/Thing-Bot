import { CommandObject, CommandType } from "wokcommands";
import Users from "../schemas/UserSchema";
import { EmbedBuilder, APIEmbedField } from "discord.js";
import { findOneUser } from "../utils";

export default {
    description: "Check out your (or someone else's) stomach stats",
    type: CommandType.LEGACY,
    aliases: ["belly"],
    maxArgs: 1,
    expectedArgs: "[@user]",
    reply: true,
    guildOnly: true,
    callback: async ({ message }) => {
        const user = message!.mentions.users.first() || message!.author;
        const EndUser = await findOneUser(user.id);

        function makeField(
            name: string,
            value: string,
            inline = false
        ): APIEmbedField {
            return {
                name,
                value,
                inline,
            };
        }

        const username =
            user.username === message!.author.username
                ? "Your"
                : `${user.username}'s`;

        const embed = new EmbedBuilder()
            .setColor(EndUser.stomachColor!)
            .setTitle(`${username} Stomach`)
            .setDescription(
                `${username} stomach color is shown on the left of this embed.`
            )
            .addFields([
                makeField(
                    "Amount Of People In Stomach",
                    `${EndUser.amountOfPeopleInStomach}`,
                    true
                ),
                makeField(
                    "Stomach Capacity",
                    `${EndUser.stomachCapacity}`,
                    true
                ),
                makeField(
                    "Is Full?",
                    `${
                        EndUser.amountOfPeopleInStomach! >=
                        EndUser.stomachCapacity!
                            ? "Yes"
                            : "No"
                    }`,
                    true
                ),
                makeField("Belly Color", EndUser.skinColor!, true),
                makeField("Acid Color", EndUser.acidColor!, true),
            ]);

        return {
            embeds: [embed],
        };
    },
} as CommandObject;
