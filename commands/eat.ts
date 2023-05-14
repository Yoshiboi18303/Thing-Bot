import { CommandObject, CommandType, CooldownTypes } from "wokcommands";
import Users from "../schemas/UserSchema";
import { EmbedBuilder } from "discord.js";
import { findOneUser, getPersonWithUser } from "../utils";

export default {
    description: "Turn someone into your dinner",
    type: CommandType.LEGACY,
    guildOnly: true,
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "<@user>",
    reply: true,
    /*cooldowns: {
        type: CooldownTypes.perUser,
        duration: "1 m",
    },*/
    callback: async ({ client, message }) => {
        const author = message!.author;
        const userToEat = message?.mentions.users.first();

        if (!userToEat) {
            const embed = new EmbedBuilder()
                .setTitle("Error")
                .setColor("#FF0000")
                .setDescription("Please mention a user.");

            return {
                embeds: [embed],
            };
        }

        if (userToEat.id === author.id) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(
                    "You can't eat yourself, what is this? The fucking Matrix?!"
                )
                .setFooter({
                    text: "No. No it's not.",
                });

            return {
                embeds: [embed],
            };
        }

        if (userToEat.bot) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(
                    "Leave my kind alone, what did they ever do to you?"
                );

            return {
                embeds: [embed],
            };
        }

        const EndUser = await findOneUser(author.id);
        const OtherUser = await findOneUser(userToEat.id);

        if (!OtherUser.usable) {
            const notUsableEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription("This user is not able to be eaten, sorry...");

            return {
                embeds: [notUsableEmbed],
            };
        }

        if (EndUser.inStomach) {
            const userWithEndUser = (await getPersonWithUser(EndUser))
                .document!;
            const user = client.users.cache.get(userWithEndUser.id);
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(
                    `Sorry, but you're inside of ${
                        user?.username || "Unknown User"
                    }'s stomach, you can't do anything while they have you.`
                );

            return {
                embeds: [embed],
            };
        }

        if (OtherUser.inStomach) {
            const userWithOtherUser = (await getPersonWithUser(OtherUser))
                .document!;
            const user = client.users.cache.get(userWithOtherUser.id);
            const username = user
                ? user.id === author.id
                    ? "your"
                    : `${user.username}'s`
                : "Unknown User";
            const baseOtherText = "you can't do anything while they have them.";
            const otherText = user
                ? user.id === author.id
                    ? "just enjoy them, they're already inside of you."
                    : baseOtherText
                : baseOtherText;
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(
                    `Sorry, but ${userToEat.username} is inside of ${username} stomach, ${otherText}`
                );

            return {
                embeds: [embed],
            };
        }

        if (EndUser.amountOfPeopleInStomach! >= EndUser.stomachCapacity!) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(
                    "You're completely full, one more person and you're gonna pop like a balloon. Please either release one person or digest."
                );

            return {
                embeds: [embed],
            };
        }

        let success: boolean;

        if (OtherUser.amountOfPeopleInStomach! > 0)
            success =
                Math.random() >
                (OtherUser.amountOfPeopleInStomach! > 5
                    ? 0.6
                    : parseInt(`0.${OtherUser.amountOfPeopleInStomach}`));
        else success = true;

        const pingedUserToEat = `<@${userToEat.id}>`;

        if (success) {
            const UpdatedEndUser = await Users.findOneAndUpdate(
                {
                    id: EndUser.id,
                },
                {
                    $set: {
                        peopleInStomach: [
                            ...EndUser.peopleInStomach!,
                            userToEat.id,
                        ],
                    },
                    $inc: {
                        amountOfPeopleInStomach: 1,
                    },
                }
            );

            const UpdatedOtherUser = await Users.findOneAndUpdate(
                {
                    id: OtherUser.id,
                },
                {
                    $set: {
                        inStomach: true,
                        softness: Math.random(),
                    },
                }
            );

            UpdatedEndUser?.save();
            UpdatedOtherUser?.save();

            const embed = new EmbedBuilder()
                .setColor("#00FF02")
                .setDescription(
                    `You have successfully swallowed ${pingedUserToEat}, let's hope they get comfy inside of you!`
                );

            return {
                embeds: [embed],
            };
        } else {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(
                    `You have failed to swallow ${pingedUserToEat}, maybe try again later, you might succeed next time!`
                );

            return {
                embeds: [embed],
            };
        }
    },
} as CommandObject;
