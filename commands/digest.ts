import { CommandObject, CommandType, CooldownTypes } from "wokcommands";
import Users from "../schemas/UserSchema";
import { EmbedBuilder } from "discord.js";
import { failCommand, findOneUser } from "../utils";

export default {
    description: "Finish off the prey inside of you",
    type: CommandType.LEGACY,
    maxArgs: 0,
    guildOnly: true,
    reply: true,
    cooldowns: {
        type: CooldownTypes.perUser,
        duration: "5 m",
        errorMessage: "Give your stomach {TIME} to rest, then try this again."
    },
    callback: async ({ client, message, cancelCooldown }) => {
        const author = message!.author;
        const EndUser = await findOneUser(author.id);

        const amountOfPeopleInStomach = EndUser.amountOfPeopleInStomach!;

        if (amountOfPeopleInStomach <= 0) return failCommand(
            "You don't have anyone inside of you, please eat someone then try this command again!",
            cancelCooldown,
            null,
            false
        )

        const baseNumber = 206; // The base amount of bones in the human body, used with our formula for how many bones the user gets

        // Formula: baseNumber * number of people inside the user
        // Adding in the amount of bones in each person inside (not the ones the user already removed, kinda like a bank), if they have any.
        //
        // Example: 206 * 3 + 412 + 206 + 0 = 824 bones, my math could be way off though.
        let bonesCollected = baseNumber * amountOfPeopleInStomach;
        const stomachCapacityIncreases = Math.random() > 0.79;
        const stomachCapacityIncrease = Math.ceil(Math.random() * 5);

        const peopleInStomach = EndUser.peopleInStomach!;

        for (const id of peopleInStomach) {
            const Person = await findOneUser(id);
            const bonesLost = Person.bonesInStomach!;
            bonesCollected += bonesLost;
            const updated = await Users.findOneAndUpdate(
                {
                    id,
                },
                {
                    $set: {
                        inStomach: false,
                        softness: 0,
                        bonesInStomach: 0,
                    },
                }
            );

            updated!.save();
            const user = client.users.cache.get(id);

            if (user && Person!.canBeDmed) {
                if (bonesLost > 0) {
                    const embed = new EmbedBuilder()
                        .setColor("#FF0000")
                        .setDescription(
                            `**Whoopsies!** You just got digested and lost all ${bonesLost} of the bones inside of you!`
                        )
                        .setFooter({
                            text: "Tip: Remove those bones next time, please...",
                        });

                    user.send({
                        embeds: [embed],
                    }).catch(() => {
                        return;
                    });
                } else {
                    const embed = new EmbedBuilder()
                        .setColor("Orange")
                        .setDescription(
                            `You just got digested by **${author.username}**!`
                        );

                    user.send({
                        embeds: [embed],
                    }).catch(() => {
                        return;
                    });
                }
            }
        }

        if (stomachCapacityIncreases) {
            const UpdatedEndUser = await Users.findOneAndUpdate(
                {
                    id: EndUser.id,
                },
                {
                    $set: {
                        amountOfPeopleInStomach: 0,
                        peopleInStomach: [],
                    },
                    $inc: {
                        bonesInStomach: bonesCollected,
                        stomachCapacity: stomachCapacityIncrease,
                    },
                }
            );

            UpdatedEndUser!.save();
        } else {
            const UpdatedEndUser = await Users.findOneAndUpdate(
                {
                    id: EndUser.id,
                },
                {
                    $set: {
                        amountOfPeopleInStomach: 0,
                        peopleInStomach: [],
                    },
                    $inc: {
                        bonesInStomach: bonesCollected,
                    },
                }
            );

            UpdatedEndUser!.save();
        }

        let desc = `You have successfully digested ${
            amountOfPeopleInStomach > 1
                ? `all ${amountOfPeopleInStomach} people`
                : `the ${amountOfPeopleInStomach} person`
        } in your stomach, and earned ${bonesCollected} bones (which are now in your stomach) \`(I would recommend you get them out of there, because if you get digested by someone with those bones still inside of you, you will lose them)\`!`;

        if (stomachCapacityIncreases)
            desc += `\n\n**Also, lucky you! Your stomach decided to hold more people! Your stomach capacity has risen by __\`${stomachCapacityIncrease}\`__!**`;

        const embed = new EmbedBuilder()
            .setColor("#00FF02")
            .setDescription(desc);

        return {
            embeds: [embed],
        };
    },
} as CommandObject;
