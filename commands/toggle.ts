import { CommandObject, CommandType } from "wokcommands";
import Users from "../schemas/UserSchema";
import { EmbedBuilder } from "discord.js";
import { findOneUser } from "../utils";

type Stat = "usable" | "dmable";

export default {
    description: "Toggle any of your settings",
    type: CommandType.LEGACY,
    minArgs: 1,
    maxArgs: 1,
    expectedArgs: "<usable | dmable>",
    reply: true,
    callback: async ({ message, args }) => {
        const author = message!.author;
        const statToToggle = args[0] as Stat;
        const EndUser = await findOneUser(author.id);
        const usable = EndUser.usable!;
        const dmable = EndUser.canBeDmed!;

        switch (statToToggle) {
            case "usable":
                const UpdatedEndUserUsability = await Users.findOneAndUpdate(
                    {
                        id: author.id,
                    },
                    {
                        $set: {
                            usable: !usable,
                        },
                    }
                );
                UpdatedEndUserUsability!.save();

                const usabilitySetEmbed = new EmbedBuilder()
                    .setColor("#00FF02")
                    .setDescription(
                        `Your usability (whether you can be eaten) was set to \`${!usable}\`!`
                    );

                return {
                    embeds: [usabilitySetEmbed],
                };
            case "dmable":
                const UpdatedEndUserDmability = await Users.findOneAndUpdate(
                    {
                        id: author.id,
                    },
                    {
                        $set: {
                            canBeDmed: !dmable,
                        },
                    }
                );
                UpdatedEndUserDmability!.save();

                const dmabilitySetEmbed = new EmbedBuilder()
                    .setColor("#00FF02")
                    .setDescription(
                        `Your dmability (whether you can be Direct Messaged by this bot) was set to \`${!dmable}\`!`
                    );

                return {
                    embeds: [dmabilitySetEmbed],
                };
        }
    },
} as CommandObject;
