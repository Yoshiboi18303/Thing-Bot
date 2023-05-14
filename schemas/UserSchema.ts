import { Schema, model } from "mongoose";

type HexCodeResolvable = `#${string}`;
export type ItemAmount = {
    [name: string]: number;
};

/**
 * Represents a User document on MongoDB
 */
export interface IUser {
    /**
     * The ID of the user
     */
    id: string;
    /**
     * The user ids of everyone inside of this user
     */
    peopleInStomach?: string[];
    /**
     * How many people are in this user
     */
    amountOfPeopleInStomach?: number;
    /**
     * How many bones are inside of this user
     */
    bonesInStomach?: number;
    /**
     * How many bones this user has safely removed from their stomach
     */
    bonesCollected?: number;
    /**
     * How many people can be inside of this user at one time
     */
    stomachCapacity?: number;
    /**
     * The skin color of the user (also applies to their belly)
     */
    skinColor?: HexCodeResolvable;
    /**
     * The color of the user's stomach walls
     */
    stomachColor?: HexCodeResolvable;
    /**
     * The color of the user's stomach acids
     */
    acidColor?: HexCodeResolvable;
    /**
     * Whether the user is inside of someone or not
     */
    inStomach?: boolean;
    /**
     * How soft the user is inside of someone
     */
    softness?: number;
    /**
     * Whether the bot can DM the user
     */
    canBeDmed?: boolean;
    /**
     * All the items the user has
     */
    items?: ItemAmount;
    /**
     * Whether the user can be eaten or not
     */
    usable?: boolean;
}

const OptionalNumber = {
    type: Number,
    default: 0,
};

const userSchema = new Schema<IUser>({
    id: {
        type: String,
        required: true,
    },
    peopleInStomach: Array<string>,
    amountOfPeopleInStomach: OptionalNumber,
    bonesInStomach: OptionalNumber,
    bonesCollected: OptionalNumber,
    stomachCapacity: {
        type: Number,
        default: 1,
    },
    skinColor: {
        type: String,
        default: "#000000",
    },
    stomachColor: {
        type: String,
        default: "#FFC0CB",
    },
    acidColor: {
        type: String,
        default: "#336933",
    },
    inStomach: {
        type: Boolean,
        default: false,
    },
    softness: {
        type: Number,
        default: 0,
    },
    canBeDmed: {
        type: Boolean,
        default: true,
    },
    items: {
        type: Object,
        default: {},
    },
    usable: {
        type: Boolean,
        default: true,
    },
});

export default model<IUser>("users", userSchema);
