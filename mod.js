"use strict";

// The rewritten structure of this mod was mostly adapted from the original codebase to fit a structure similar to AK12-AK15 by Dueleus

let mydb;

class Mod {
    postDBLoad(container) {
        const modLoader = container.resolve("PreAkiModLoader");
        const importerUtil = container.resolve("ImporterUtil");
        const db = container.resolve("DatabaseServer").getTables();
        const locales = db.locales.global;
        const items = db.templates.items;
        const handbook = db.templates.handbook.Items;
        const mechanic = db.traders["5a7c2eca46aef81a7ca2145d"];
        const tables = db;
        const traderID = "5a7c2eca46aef81a7ca2145d";

        mydb = importerUtil.loadRecursive(`${modLoader.getModPath("AWM")}database/`);

        for (const item in mydb.templates.items) {
            items[item] = mydb.templates.items[item];
        }

        for (const item of mydb.templates.handbook.Items) {
            handbook.push(item);
        }

        for (const item of mydb.traders.assort.assorts.items) {
            mechanic.assort.items.push(item);
        }

        for (const bc in mydb.traders.assort.assorts.barter_scheme) {
            mechanic.assort.barter_scheme[bc] = mydb.traders.assort.assorts.barter_scheme[bc];
        }

        for (const level in mydb.traders.assort.assorts.loyal_level_items) {
            mechanic.assort.loyal_level_items[level] = mydb.traders.assort.assorts.loyal_level_items[level];
        }

        for (const localeID in locales) {
            if (localeID == "en") {
                for (const [itemId, template] of Object.entries(mydb.locales.en.templates)) {
                    for (const [key, value] of Object.entries(template)) {
                        locales[localeID][`${itemId} ${key}`] = value;
                    }
                }
                for (const [itemId, template] of Object.entries(mydb.locales.en.preset)) {
                    for (const value of Object.values(template)) {
                        locales[localeID][`${itemId}`] = value;
                    }
                }
            }
            if (localeID == "ru") {
                for (const [itemId, template] of Object.entries(mydb.locales.ru.templates)) {
                    for (const [key, value] of Object.entries(template)) {
                        locales[localeID][`${itemId} ${key}`] = value;
                    }
                }
                for (const [itemId, template] of Object.entries(mydb.locales.ru.preset)) {
                    for (const value of Object.values(template)) {
                        locales[localeID][`${itemId}`] = value;
                    }
                }
            }
        }

        // START AddToMastery
        db.globals.config.Mastering.push({
            "Name": "AWM",
            "Templates": [
                "weapon_ai_awm_338lm"
            ],
            "Level2": 500,
            "Level3": 1000
        })
        // END AddToMastery

        // START FixQuests

        const questIDs = [
            "5bc4776586f774512d07cf05",
            "5bc479e586f7747f376c7da3",
            "5bc47dbf86f7741ee74e93b9",
            "5bc4826c86f774106d22d88b",
            "5bc4836986f7740c0152911c",
            "5bc4856986f77454c317bea7",
            "5bc4893c86f774626f5ebf3e" 
        ]

        // START createPresetThing
        const item = JSON.parse(JSON.stringify(tables.globals.ItemPresets["5ddbbeac582ed30a6134e577"])); // Hacky hack since I don't have the patience to test with deepclone
        tables.globals.ItemPresets["awm_defaultID"] = item;
        
        item._id = "awm_defaultID";
        item._type = "Preset";
        item._changeWeaponName = false;
        item._name = "Standard";
        item._encyclopedia = "weapon_ai_awm_338lm"

        item._items = [];
        item._parent = "awm_defaultID_parentID";

        item._items.push(
            {
                "_id": "awm_defaultID_parentID", // this objects uniqueParentID
                "_tpl": "weapon_ai_awm_338lm" // weapon base
            },
            {
                "_id": "awm_presetparent_st", // this objects unique ID
                "_tpl": "stock_awm_ai_awm", // AWM stock
                "parentId": "awm_defaultID_parentID", // parent of this item
                "slotId": "mod_stock" // slotName see "mod_slotId.txt"
            },
            {
                "_id": "awm_presetparent_mag", // this objects unique ID
                "_tpl": "magazine_awm_ai_86x70_5", // 5-round AWM magazine
                "parentId": "awm_defaultID_parentID", // parent of this item
                "slotId": "mod_magazine" // slotName see "mod_slotId.txt"
            },
            {
                "_id": "awm_presetparent_mnt", // this objects unique ID
                "_tpl": "mount_awm_ai_top_picatinny_rail", // AWM Top rail
                "parentId": "awm_defaultID_parentID", // parent of this item
                "slotId": "mod_mount" // slotName see "mod_slotId.txt"
            },
            {
                "_id": "awm_presetparent_bar", // this objects unique ID
                "_tpl": "barrel_awm_ai_std_686mm", // 686mm barrel
                "parentId": "awm_defaultID_parentID", // parent of this item
                "slotId": "mod_barrel" // slotName see "mod_slotId.txt"
            },
            {
                "_id": "awm_presetparent_mb", // this objects unique ID
                "_tpl": "muzzle_awm_ai_mb_86x70", // AWM muzzle brake
                "parentId": "awm_presetparent_bar", // parent of this item
                "slotId": "mod_muzzle" // slotName see "mod_slotId.txt"
            }
        );

        const WeaponPresetItems = item._items;
        // END createPresetThing


        questIDs.forEach((questID) =>
        {
            const finishes = tables.templates.quests[questID].conditions.AvailableForFinish;
            for (const finish of finishes)
            {
                const conditions = finish._props.counter.conditions
                for (const condition of conditions)
                {
                    if (condition._parent == "Kills" || condition._parent == "Shots")
                    {
                        condition._props.weapon.push("weapon_ai_awm_338lm");
                    }
                }
            }
        });

        // fix punisher part 2 suppressor for awm
        const conditions = tables.templates.quests["59c50c8886f7745fed3193bf"].conditions.AvailableForFinish[0]._props.counter.conditions;
        for (const condition of conditions)
        {
            if (condition._parent === "Kills")
            {
                condition._props.weaponModsInclusive.push(["62811fa609427b40ab14e765"]);
            }
        }
        // END FixQuests
    }
}

module.exports = { mod: new Mod() };