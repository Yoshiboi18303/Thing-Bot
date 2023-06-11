import { CommandObject, CommandType, CooldownTypes } from "wokcommands";
import Users from "../schemas/UserSchema";
import { EmbedBuilder } from "discord.js";
import {
    failCommand,
    findOneUser,
    getPersonWithUser,
    removeOneItem,
} from "../utils";

export default {
    description: "Turn someone into your dinner",
    type: CommandType.LEGACY,
    guildOnly: true,
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "<@user>",
    reply: true,
    cooldowns: {
        type: CooldownTypes.perUser,
        duration: "1 m",
        errorMessage:
            "You need to chillax with that, calm it down for **{TIME}**.",
    },
    callback: async ({ client, message, cancelCooldown }) => {
        const author = message!.author;
        const userToEat = message?.mentions.users.first();

        if (!userToEat)
            return failCommand("Please mention a user!", cancelCooldown);

        if (userToEat.id === author.id)
            return failCommand(
                "You can't eat yourself, what is this? The fucking Matrix?!",
                cancelCooldown,
                {
                    text: "No. No it's not.",
                },
                false
            );

        if (userToEat.bot)
            return failCommand(
                "Leave my kind alone, what did they ever do to you?",
                cancelCooldown,
                null,
                false
            );

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

            return failCommand(
                `Sorry, but you're inside of ${
                    user?.username || "Unknown User"
                }'s stomach, you can't do anything while they have you.`,
                cancelCooldown,
                null,
                false
            );
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

            return failCommand(
                `Sorry, but ${userToEat.username} is inside of ${username} stomach, ${otherText}`,
                cancelCooldown,
                null,
                false
            );
        }

        if (EndUser.amountOfPeopleInStomach! >= EndUser.stomachCapacity!)
            return failCommand(
                "You're completely full, one more person and you're gonna pop like a balloon. Please either release one person or digest.",
                cancelCooldown,
                null,
                false
            );

        if (OtherUser.items!["poison"] > 0) {
            const merciful = Math.random() > 0.7;
            const bonesInStomach = EndUser.bonesInStomach!;
            await removeOneItem("poison", userToEat.id);

            if (merciful) {
                const UpdatedEndUser = await Users.findOneAndUpdate(
                    {
                        id: EndUser.id,
                    },
                    {
                        $set: {
                            bonesInStomach: 0,
                        },
                        $inc: {
                            bonesCollected: bonesInStomach,
                        },
                    }
                );

                const embed = new EmbedBuilder()
                    .setColor("Blue")
                    .setTitle("Poisoned, but saved!")
                    .setDescription(
                        `Seems like **${userToEat.username}** had some rat poison and you violently threw them up.\n\n**However, they were merciful with you, helped you to the ground, called an ambulance, and let you keep your bones!**`
                    );

                UpdatedEndUser!.save();

                return {
                    embeds: [embed],
                };
            } else {
                const UpdatedEndUser = await Users.findOneAndUpdate(
                    {
                        id: EndUser.id,
                    },
                    {
                        $set: {
                            bonesInStomach: 0,
                        },
                    }
                );
                const UpdatedOtherUser = await Users.findOneAndUpdate(
                    {
                        id: OtherUser.id,
                    },
                    {
                        $inc: {
                            bonesCollected: bonesInStomach,
                        },
                    }
                );

                const embed = new EmbedBuilder()
                    .setColor("Red")
                    .setTitle("Poisoned and ruined...")
                    .setDescription(
                        `Seems like **${userToEat.username}** had some rat poison and you violently threw them up.\n\n**They weren't too happy with that stunt you pulled, they beat you to the ground, didn't help and worst of all, stole all the bones from your stomach!**`
                    );

                UpdatedEndUser!.save();
                UpdatedOtherUser!.save();

                return {
                    embeds: [embed],
                };
            }
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
        } else
            return failCommand(
                `You have failed to swallow ${pingedUserToEat}, maybe try again later, you might succeed next time!`,
                cancelCooldown,
                null,
                false
            );
    },
} as CommandObject;
