import { Schema, model } from "mongoose";

interface IGuild {
    escapeChance: number;
    useLanguageFilter: boolean;
}

const guildSchema = new Schema<IGuild>({
    escapeChance: {
        type: Number,
        default: 0.8,
    },
    useLanguageFilter: {
        type: Boolean,
        default: false,
    },
});

export default model("guilds", guildSchema);
