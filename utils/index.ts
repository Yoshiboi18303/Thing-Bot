import { Document } from "mongoose";
import Users from "../schemas/UserSchema";
import { ActivityType, Client, User } from "discord.js";
import { promisify } from "util";
import ShopItems from "./ShopItems";

interface IPerson {
    document: Document | undefined;
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
    user: Document,
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
                ? getDiscordUser(personWithUser.id, client)
                : null,
        };
    else
        return {
            document: personWithUser,
        };
}

function getDiscordUser(id: string, client: Client): User | undefined {
    return client.users.cache.get(id);
}

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
    const item = ShopItems.find((shopItem) => shopItem.id === itemId);

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
