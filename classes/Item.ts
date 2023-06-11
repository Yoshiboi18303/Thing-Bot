import Users from "../schemas/UserSchema";
import { findOneUser, HexCodeResolvable, ItemAmount } from "../utils";

export interface ItemPurchaseStatus {
    /**
     * Whether the purchase was successful.
     */
    success: boolean;
    /**
     * The message from the purchase (e.g. "{user} does not have enough bones to purchase {item}!")
     */
    message: string;
    /**
     * Whatever error that came from purchasing, if any.
     */
    error?: any;
}

export interface ItemUsage {
    command: string | "indirect";
    purpose: string;
}

/**
 * Represents an item in the shop.
 */
export default class Item {
    /**
     * The name of the item.
     */
    public name: string;
    /**
     * The ID (identifier) of the item.
     */
    public id: string;
    /**
     * The description of the item.
     */
    public description: string;
    /**
     * How much the item costs.
     */
    public price: number;
    /**
     * The color that best describes this item.
     */
    public color: HexCodeResolvable;
    public thumbnail: string | null;
    public usage: ItemUsage | ItemUsage[] | null;
    private _userId: string = "";
    private _linkRegex = /^(http[s]?:\/\/)?(www\.)?([\w-]+\.)+[\w]{2,}(\/.*)?$/;

    constructor(
        name: string,
        id: string,
        description: string,
        price: number,
        color: HexCodeResolvable,
        usage: ItemUsage | ItemUsage[] | null,
        thumbnail: string | null = null
    ) {
        this.name = name;
        this.id = id;
        this.description = description;
        this.price = price;
        this.color = color;
        this.usage = usage;

        if (thumbnail != null && !this._linkRegex.test(thumbnail))
            throw new Error(`${thumbnail} is not a link!`);

        this.thumbnail = thumbnail;
    }

    private async _addItem(quantity: number = 1, updateUser: boolean = true) {
        const User = await findOneUser(this._userId);
        let item = User.items![this.id];

        const newItems: ItemAmount = {
            ...User.items!, // Spread the current items from the user.
            [this.id]: (item || 0) + quantity, // Set item id to either 1 (if it doesn't exist already) or just add quantity to it.
        };

        if (updateUser) {
            const UpdatedUser = await Users.findOneAndUpdate(
                {
                    id: this._userId,
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

    /**
     * Attempts to purchase the item, can fail if the user does not have enough money.
     * @param userId The user ID of the person that is requesting the item (`string`)
     * @param quantity How many of this specific item should be bought (`number`); Default: 1
     * @param addToItemsObject Whether this item should be added to the user's `items` object; Default: `true`
     * @returns Whether the purchase succeeded or failed (`boolean`)
     */
    public async buy(
        userId: string,
        quantity: number = 1,
        addToItemsObject: boolean = true
    ): Promise<ItemPurchaseStatus> {
        const User = await findOneUser(userId);
        const bonesCollected = User.bonesCollected!;
        const price = this.price * quantity;
        this._userId = userId;

        if (bonesCollected < price)
            return {
                success: false,
                message: `User does not have enough bones collected to purchase ${quantity} of ${
                    this.name
                }!\n\nPrice: ${price}\n\nUser has ${bonesCollected} bones collected.\nUser needs ${
                    price - bonesCollected
                } more bones!`,
            };

        let hasErrorOccurred: boolean = false;
        let errorText: any;

        if (addToItemsObject) {
            const newItems = await this._addItem(quantity, false);

            const UpdatedUser = await Users.findOneAndUpdate(
                {
                    id: userId,
                },
                {
                    $set: {
                        bonesCollected: bonesCollected - price,
                        items: newItems,
                    },
                }
            ).catch((error) => {
                console.error(error);
                errorText = error;
                hasErrorOccurred = true;
            });

            UpdatedUser?.save();
        } else {
            const UpdatedUser = await Users.findOneAndUpdate(
                {
                    id: userId,
                },
                {
                    $set: {
                        bonesCollected: bonesCollected - price,
                    },
                }
            ).catch((error) => {
                console.error(error);
                errorText = error;
                hasErrorOccurred = true;
            });

            UpdatedUser?.save();
        }

        if (hasErrorOccurred)
            return {
                success: false,
                message:
                    "An error occurred while updating the user, user was not updated. The developer(s) have been notified of this error.",
                error: errorText,
            };

        return {
            success: true,
            message: "Item purchased!",
        };
    }
}
