import { CommandObject, CommandType, CooldownTypes } from "wokcommands";
import Users from "../schemas/UserSchema";
import { EmbedBuilder } from "discord.js";
import { failCommand, findOneUser, getPersonWithUser } from "../utils";

export default {
    description: "Release someone (giving them some mercy).",
    type: CommandType.LEGACY,
    guildOnly: true,
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "<@user>",
    reply: true,
    cooldowns: {
        type: CooldownTypes.perUser,
        duration: "5 s",
        errorMessage: "Please wait for {TIME} to release another person!",
    },
    callback: async ({ message, cancelCooldown }) => {
        const userToRelease = message!.mentions.users.first();
        const author = message!.author;

        if (!userToRelease)
            return failCommand("Please mention a user.", cancelCooldown);

        const EndUser = await findOneUser(author.id);
        const OtherUser = await findOneUser(userToRelease.id);
        const userWithOtherUser = (await getPersonWithUser(OtherUser))
            .document!;

        if (author.id !== userWithOtherUser?.id)
            return failCommand(
                `You are not the holder of **\`${userToRelease.username}\`**!`,
                cancelCooldown,
                null,
                false
            );

        const updatedPeopleInStomach = EndUser.peopleInStomach!.filter(
            (person) => person !== userToRelease.id
        );

        const UpdatedEndUser = await Users.findOneAndUpdate(
            {
                id: author.id,
            },
            {
                $set: {
                    peopleInStomach: updatedPeopleInStomach,
                    amountOfPeopleInStomach:
                        EndUser.amountOfPeopleInStomach! - 1,
                },
            }
        );

        const UpdatedOtherUser = await Users.findOneAndUpdate(
            {
                id: userToRelease.id,
            },
            {
                $set: {
                    inStomach: false,
                    softness: 0,
                },
            }
        );

        UpdatedEndUser!.save();
        UpdatedOtherUser!.save();

        const releasedUserEmbed = new EmbedBuilder()
            .setColor("#00FF02")
            .setDescription(
                `You have successfully released **${userToRelease.username}**, let's hope they take this as mercy (or you're just really nice, I don't know).`
            );

        return {
            embeds: [releasedUserEmbed],
        };
    },
} as CommandObject;
