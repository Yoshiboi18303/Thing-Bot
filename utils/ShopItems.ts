import Item from "../classes/Item";
import { IterationCallback } from "./";

export const ShopItems: Item[] = [
    new Item(
        "Eating Competition",
        "competition",
        "Engage in an eating competition to increase your stomach capacity!",
        450,
        "#e3976f",
        null
    ),
    new Item(
        "Lube",
        "lube",
        "Apply it all over yourself to make it easier to crawl out of someone!",
        550,
        "#ffffff",
        {
            command: "escape",
            purpose: "Lowers the chance of failing to escape",
        }
    ),
    new Item(
        "Digestion Medicine",
        "medicine",
        "Use this to make your stomach digest bone slower than anything else!",
        750,
        "#fa239a",
        {
            command: "extract",
            purpose:
                "Removes the chance of you losing any bones during extraction.",
        }
    ),
    new Item(
        "Acid Spit",
        "acid",
        "Use this to melt someone's skin clean off (it'll grow back eventually)!",
        1250,
        "#336933",
        {
            command: "spit",
            purpose: "Turns your spit into some of your stomach acids.",
        },
        "https://cdn.discordapp.com/attachments/1028104425371340851/1114304046736625734/acid.png"
    ),
    new Item(
        "Rat Poison",
        "poison",
        "Use this to protect yourself from a predator!",
        2250,
        "#4db560",
        {
            command: "indirect",
            purpose:
                "Makes you impossible to eat and gives you a chance to steal all the predator's bones!",
        }
    ),
];

export function getItem(id: string) {
    return ShopItems.find((item) => item.id === id);
}

export function forEach(callback: IterationCallback<Item>) {
    ShopItems.forEach(callback);
}
