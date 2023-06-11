import { CommandObject, CommandType, CooldownTypes } from "wokcommands";
import Users from "../schemas/UserSchema";
import { EmbedBuilder } from "discord.js";
import { findOneUser, getDailyStreak } from "../utils";

export default {
    description: "Claim your daily reward!",
    type: CommandType.LEGACY,
    guildOnly: true,
    reply: true,
    cooldowns: {
        type: CooldownTypes.perUser,
        duration: "1 d",
        errorMessage:
            "You can't claim your daily reward right now! Try again in {TIME}.",
    },
    callback: async ({ message, cancelCooldown }) => {
        const author = message!.author;

        let user = await findOneUser(author.id);
        const dailyStreak = await getDailyStreak(author.id);

        let bonesEarned: number;

        if (dailyStreak.hasLostStreak) {
            const Updated = await Users.findOneAndUpdate(
                {
                    id: author.id,
                },
                {
                    $set: {
                        dailyStreak: 0,
                    },
                }
            );

            if (Updated) {
                Updated.save();
                user = Updated;
            }
        }

        if (user.dailyStreak! > 0)
            bonesEarned = Math.ceil(
                (Math.random() * 1001) * user.dailyStreak! -
                    (0.5 * user.dailyStreak!)
            );
        else bonesEarned = Math.ceil(Math.random() * 1001);
        

        // Example of this:
        //   Current date: 6/7/2023
        //   Date of expiration: 6/9/2023
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 2); // Sets the day-of-the-month to two days ahead.
        expirationDate.setHours(0, 0, 0, 0); // Sets the time to midnight.

        const UpdatedUser = await Users.findOneAndUpdate(
            {
                id: author.id,
            },
            {
                $inc: {
                    bonesCollected: bonesEarned,
                    dailyStreak: 1,
                },
                $set: {
                    lastDailyReward: Date.now(),
                    streakExpirationDate: expirationDate,
                },
            }
        );

        let errorOccurred: boolean = false;

        UpdatedUser?.save().catch(() => {
            errorOccurred = true;
            cancelCooldown();
        });

        let description = errorOccurred
            ? "Your data has failed to save, your document has not been updated and your cooldown has been cancelled. **Please try again.**"
            : `You have successfully claimed your daily reward of **${bonesEarned}** bones, __your data should have been saved correctly.__`;

        if (user.dailyStreak! > 0 && !dailyStreak.hasLostStreak)
            description += `\n\n**You have a daily streak of ${user.dailyStreak! + 1}, keep it up!**`;
        else if (dailyStreak.hasLostStreak)
            description +=
                "\n\n**You have sadly lost your daily streak, come back tomorrow to try to start it back up!**";
        else
            description +=
                "\n\n**Come back tomorrow to start a daily streak!**";

        const embed = new EmbedBuilder()
            .setColor(
                errorOccurred
                    ? "#FF0000"
                    : dailyStreak.hasLostStreak
                    ? "#0000ff"
                    : "#00FF02"
            )
            .setDescription(description);

        return {
            embeds: [embed],
        };
    },
} as CommandObject;
