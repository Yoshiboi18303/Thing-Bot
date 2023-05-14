import { CommandObject, CommandType } from "wokcommands";
import Users from "../schemas/UserSchema";
import { ColorResolvable, EmbedBuilder } from "discord.js";
import { findOneUser } from "../utils";

const hexCodeRegex = /^#[0-9A-Fa-f]{6}$/;
type ColorChangeType = "skin" | "stomach" | "acid" | "preview";
const types = ["skin", "stomach", "acid", "preview"];

export default {
    description: "Change your skin, stomach or acid color",
    type: CommandType.LEGACY,
    minArgs: 1,
    maxArgs: 2,
    expectedArgs: `<${types.join(
        " | "
    )}> [hex color (required when not using preview)]`,
    reply: true,
    guildOnly: true,
    callback: async ({ message, args }) => {
        const author = message!.author;
        const typeToChange = args[0] as ColorChangeType;
        const hexCode = args[1];
        const User = await findOneUser(message!.author.id);

        if (typeToChange === "preview") {
            const skinColor = User.skinColor as ColorResolvable;
            const stomachColor = User.stomachColor as ColorResolvable;
            const acidColor = User.acidColor as ColorResolvable;

            const skinColorPreviewEmbed = new EmbedBuilder()
                .setColor(skinColor)
                .setTitle("Skin Color Preview")
                .setDescription(
                    `The color of your skin _(as well as your belly)_ is displayed on the left of this embed (\`${skinColor}\`).`
                );
            const stomachColorPreviewEmbed = new EmbedBuilder()
                .setColor(stomachColor)
                .setTitle("Stomach Color Preview")
                .setDescription(
                    `The color of your stomach walls are displayed on the left of this embed (\`${stomachColor}\`).`
                );
            const acidColorPreviewEmbed = new EmbedBuilder()
                .setColor(acidColor)
                .setTitle("Acid Color Preview")
                .setDescription(
                    `The color of your stomach acids are displayed on the left of this embed (\`${acidColor}\`).`
                );

            return {
                embeds: [
                    skinColorPreviewEmbed,
                    stomachColorPreviewEmbed,
                    acidColorPreviewEmbed,
                ],
            };
        }

        if (!hexCode) {
            const noHexCodeEmbed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(
                    "You haven't used the `preview` type, so you have to provide a hex code!"
                );

            return {
                embeds: [noHexCodeEmbed],
            };
        }

        if (!hexCodeRegex.test(hexCode)) {
            const embed = new EmbedBuilder()
                .setColor("#FF0000")
                .setDescription(
                    "That's not a valid hex code! A valid hex code would be: `#00ff02`"
                );

            return {
                embeds: [embed],
            };
        }

        const color = hexCode as ColorResolvable;
        const description = `Your ${typeToChange} color has been set to \`${hexCode}\`, a preview of this color is shown on the left of this embed.`;

        switch (typeToChange) {
            case "skin":
                const UpdatedEndUserSkinColor = await Users.findOneAndUpdate(
                    {
                        id: author.id,
                    },
                    {
                        $set: {
                            skinColor: hexCode,
                        },
                    }
                );

                UpdatedEndUserSkinColor?.save();

                const skinColorSetEmbed = new EmbedBuilder()
                    .setColor(color)
                    .setDescription(description);

                return {
                    embeds: [skinColorSetEmbed],
                };
            case "stomach":
                const UpdatedEndUserStomachColor = await Users.findOneAndUpdate(
                    {
                        id: author.id,
                    },
                    {
                        $set: {
                            stomachColor: hexCode,
                        },
                    }
                );

                UpdatedEndUserStomachColor?.save();

                const stomachColorUpdatedEmbed = new EmbedBuilder()
                    .setColor(color)
                    .setDescription(description);

                return {
                    embeds: [stomachColorUpdatedEmbed],
                };
            case "acid":
                const UpdatedEndUserAcidColor = await Users.findOneAndUpdate(
                    {
                        id: author.id,
                    },
                    {
                        $set: {
                            acidColor: hexCode,
                        },
                    }
                );

                UpdatedEndUserAcidColor?.save();

                const acidColorUpdatedEmbed = new EmbedBuilder()
                    .setColor(color)
                    .setDescription(description);

                return {
                    embeds: [acidColorUpdatedEmbed],
                };
            default:
                const errorEmbed = new EmbedBuilder()
                    .setColor("#FF0000")
                    .setDescription(
                        "Invalid type, the allowed types are: **`skin`**, **`stomach`** and **`acid`**!"
                    );

                return {
                    embeds: [errorEmbed],
                };
        }
    },
} as CommandObject;
