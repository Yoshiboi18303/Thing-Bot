import { CommandObject, CommandType } from "wokcommands";
import Users from "../schemas/UserSchema";
import { EmbedBuilder } from "discord.js";
import { findOneUser, getPersonWithUser, removeOneItem } from "../utils";

export default {
    description:
        "Attempt to escape from your captor's stomach (has a (very) small chance of success).",
    type: CommandType.LEGACY,
    guildOnly: true,
    maxArgs: 0,
    reply: true,
    callback: async ({ client, message }) => {
        const author = message!.author;

        const EndUser = await findOneUser(author.id);

        if (!EndUser.inStomach) {
            const notInStomachEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(
                    "What the hell are you trying to escape from? Reality? **This command doesn't work if you're not in a stomach, come on man...**"
                );

            return {
                embeds: [notInStomachEmbed],
            };
        }

        const CaptorPerson = await getPersonWithUser(EndUser, client);
        const CaptorUserDocument = CaptorPerson.document!;
        const CaptorUserDiscord = CaptorPerson.discordUser;
        const CaptorUser = await findOneUser(CaptorUserDocument.id);

        let successful: boolean;

        if (EndUser.items!["lube"] > 0) {
            successful = Math.random() > 0.4;
            await removeOneItem("lube", author.id, true);
        } else successful = Math.random() > 0.8;

        if (successful) {
            const UpdatedEndUser = await Users.findOneAndUpdate(
                {
                    id: author.id,
                },
                {
                    $set: {
                        inStomach: false,
                        softness: 0,
                    },
                }
            );

            const updatedPeopleInStomach = CaptorUser.peopleInStomach!.filter(
                (person) => person !== author.id
            );

            const UpdatedCaptorUser = await Users.findOneAndUpdate(
                {
                    id: CaptorUser.id,
                },
                {
                    $set: {
                        peopleInStomach: updatedPeopleInStomach,
                        amountOfPeopleInStomach:
                            CaptorUser.amountOfPeopleInStomach! - 1,
                    },
                }
            );

            UpdatedEndUser!.save();
            UpdatedCaptorUser!.save();

            const successEmbed = new EmbedBuilder()
                .setColor("#00FF02")
                .setDescription(
                    "You have successfully escaped your captor's stomach! **Well done!**"
                );

            return {
                embeds: [successEmbed],
            };
        } else {
            const failedEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(
                    "You have failed to escape, you have also alerted your captor! **Maybe next time...?**"
                );

            if (CaptorUserDiscord && CaptorUser.canBeDmed) {
                const userAttemptedEscapeEmbed = new EmbedBuilder()
                    .setColor("Orange")
                    .setTitle("User Attempted Escape")
                    .setDescription(
                        `**${author.username}** attempted to escape your stomach, are you gonna punish them, or...?`
                    );

                await CaptorUserDiscord.send({
                    embeds: [userAttemptedEscapeEmbed],
                }).catch(() => {
                    return;
                });
            }

            return {
                embeds: [failedEmbed],
            };
        }
    },
} as CommandObject;
