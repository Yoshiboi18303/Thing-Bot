import Users, { ItemAmount } from "../schemas/UserSchema";
import { findOneUser, throwAndExit } from "../utils";

export default class Item {
    public name: string;
    public id: string;
    public description: string;
    public price: number;
    private userId: string = "";

    constructor(name: string, id: string, description: string, price: number) {
        this.name = name;
        this.id = id;
        this.description = description;
        this.price = price;
    }

    private async addItem(updateUser: boolean = true, quantity: number = 1) {
        const User = await findOneUser(this.userId);
        let item = User.items![this.id];

        const newItems: ItemAmount = {
            ...User.items!,
            [this.id]: (item || 0) + quantity,
        };

        if (updateUser) {
            const UpdatedUser = await Users.findOneAndUpdate(
                {
                    id: this.userId,
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
     * @returns Whether the purchase succeeded or failed (`boolean`)
     */
    public async buy(
        userId: string,
        quantity: number = 1,
        addToItemsObject: boolean = true
    ) {
        const User = await findOneUser(userId);
        const bonesCollected = User.bonesCollected!;
        const price = this.price * quantity;
        this.userId = userId;

        if (bonesCollected < price) return false;

        if (addToItemsObject) {
            const newItems = await this.addItem(false, quantity);

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
            ).catch((err) => {
                throwAndExit(
                    err,
                    "Failed to update, error logged above. User was not updated."
                );
            });

            UpdatedUser!.save();
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
            ).catch((err) => {
                throwAndExit(
                    err,
                    "Failed to update, error logged above. User was not updated."
                );
            });

            UpdatedUser!.save();
        }

        return true;
    }
}
