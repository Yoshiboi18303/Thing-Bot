import { Document } from "mongoose";
import Users, { IUser } from "../schemas/UserSchema";
import { APIEmbedField, ActivityType, Client, User } from "discord.js";
import { promisify } from "util";
import { getItem } from "./ShopItems";
import { EmbedBuilder, EmbedFooterOptions } from "discord.js";

export type IterationCallback<T> = (value: T, index: number, self: T[]) => void;
export type IterationCallbackWithReturn<T, R> = (
    value: T,
    index: number,
    self: T[]
) => R;

export type HexCodeResolvable = `#${string}`;
export type ItemAmount = {
    [name: string]: number;
};
export type UserDocument<T = any, TQueryHelpers = any> = Document<
    T,
    TQueryHelpers,
    IUser
>;

interface DailyStreakResult {
    hasLostStreak: boolean;
}

interface IPerson {
    document: UserDocument | undefined;
    discordUser?: User | null;
}

interface IActivity {
    /**
     * The text of the activity
     */
    text: string;
    /**
     * The type of the activity
     */
    type:
        | ActivityType.Playing
        | ActivityType.Listening
        | ActivityType.Watching
        | ActivityType.Competing
        | ActivityType.Streaming;
}
export const ACTIVITIES: IActivity[] = [
    {
        text: "a stomach",
        type: ActivityType.Listening,
    },
    {
        text: "a stomach",
        type: ActivityType.Watching,
    },
    {
        text: "with a stomach",
        type: ActivityType.Playing,
    },
    {
        text: "with bones",
        type: ActivityType.Playing,
    },
    {
        text: "Probably a unique economy bot",
        type: ActivityType.Playing,
    },
];
export const wait = promisify(setTimeout);

export async function getPersonWithUser(
    user: UserDocument,
    client: Client | null = null
): Promise<IPerson> {
    const allUsers = (await Users.find()).filter(
        (user) => user.peopleInStomach!.length > 0
    );
    const personWithUser = allUsers.find((person) =>
        person.peopleInStomach!.includes(user.id)
    );

    if (client)
        return {
            document: personWithUser,
            discordUser: personWithUser
                ? client.users.cache.get(personWithUser.id)
                : null,
        };
    else
        return {
            document: personWithUser,
        };
}

/**
 * Tries to find the user with the provided `id`, or adds them to the database if they don't exist.
 * @param id The ID of the user to look for.
 * @returns A document that contains all the user data.
 */
export async function findOneUser(id: string) {
    let UserFound = await Users.findOne({
        id,
    }).catch((err) =>
        throwAndExit(err, "Failed to get user, error logged above.")
    );

    if (!UserFound) {
        UserFound = new Users({
            id,
        });

        UserFound.save();
    }

    return UserFound;
}

export function throwAndExit(err: any, message: string): never {
    console.error(err);
    throw new Error(message);
}

export async function activityLoop(client: Client) {
    if (ACTIVITIES.length === 0)
        throw new Error("There are no activities defined!");

    const activity = ACTIVITIES[Math.floor(Math.random() * ACTIVITIES.length)];

    if (!client.user) throw new Error("The client is not logged in!");

    client.user.setActivity({
        name: activity.text,
        type: activity.type,
    });

    await wait(15000);

    await activityLoop(client);
}

export async function removeOneItem(
    itemId: string,
    userId: string,
    updateUser: boolean = true
) {
    const item = getItem(itemId);

    if (!item) throw new Error(`Item ${itemId} not found`);

    const User = await findOneUser(userId);

    const newItems = User.items!;

    if (newItems[itemId] <= 0)
        throw new Error(`That user doesn't have any of ${itemId}!`);

    newItems[itemId] -= 1;

    if (updateUser) {
        const UpdatedUser = await Users.findOneAndUpdate(
            {
                id: userId,
            },
            {
                $set: {
                    items: newItems,
                },
            }
        );

        UpdatedUser!.save();
    } else return newItems;
}

export async function getRandomColor(userId: string) {
    const randomNumber = Math.random();
    const User = await findOneUser(userId);

    if (randomNumber < 0.5) return User.skinColor!;
    else return User.stomachColor!;
}

export function prependString(
    original: string,
    toPrepend: string,
    addSpace: boolean = true
): string {
    return `${toPrepend}${addSpace ? " " : ""}${original}`;
}

export function failCommand(
    description: string,
    cancelCooldown: Function,
    footer: EmbedFooterOptions | null = null,
    useTitle: boolean = true
) {
    const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle(useTitle ? "Error" : null)
        .setDescription(description)
        .setFooter(footer);

    cancelCooldown();

    return {
        embeds: [embed],
    };
}

export async function getDailyStreak(
    userId: string
): Promise<DailyStreakResult> {
    const user = await findOneUser(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
        user.lastDailyReward &&
        user.streakExpirationDate &&
        user.lastDailyReward.getTime() >= today.getTime() &&
        user.streakExpirationDate.getTime() > today.getTime()
    )
        return {
            hasLostStreak: false,
        };
    else
        return {
            hasLostStreak: true,
        };
}

export function makeField(
    name: string,
    value: string,
    inline = false
): APIEmbedField {
    return {
        name,
        value,
        inline,
    };
}
