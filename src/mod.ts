import { DependencyContainer } from "tsyringe";
import { IPreAkiLoadMod } from "@spt-aki/models/external/IPreAkiLoadMod";
import { IPostDBLoadMod } from "@spt-aki/models/external/IPostDBLoadMod";
import { JsonUtil } from "@spt-aki/utils/JsonUtil";
import { VFS } from "@spt-aki/utils/VFS";
import { DatabaseServer } from "@spt-aki/servers/DatabaseServer";
import { DatabaseImporter } from "@spt-aki/utils/DatabaseImporter";
import path from "path";

class Mod implements IPostDBLoadMod
{
    WeaponPresetItems: Item[]
    private cfg = require("../config.json")

    postDBLoad(container: DependencyContainer): void 
    {
        // get the logger from the server container
        const db = container.resolve<DatabaseServer>("DatabaseServer").getTables();
        const modLoader = container.resolve<IPreAkiLoadMod>("PreAkiModLoader");
        const databaseImporter = container.resolve<DatabaseImporter>("DatabaseImporter");
        const JsonUtil = container.resolve<JsonUtil>("JsonUtil");
        const VFS = container.resolve<VFS>("VFS");
        const locales = db.locales.global;
        const tables = db;
        const items = db.templates.items;
        const handbook = db.templates.handbook.Items;
        const modPath = path.resolve(__dirname.toString()).split(path.sep).join("/")+"/";

        const traderID = "5a7c2eca46aef81a7ca2145d";
        const mydb = databaseImporter.loadRecursive(`${modPath}../db/`);

        // START doTheManualCreationThingy
        for (const itemKey in mydb.templates.items)
        {
            const item = JsonUtil.deserialize(VFS.readFile(`${modPath}../db/items/${itemKey}.json`));
            items[item._id] = item;
        }

        for (const itemKey in mydb.templates.handbook)
        {
            const item = JsonUtil.deserialize(VFS.readFile(`${modPath}../db/templates/handbook/${itemKey}.json`));
            handbook.push(item);
        }
        
        for (const localeID in locales)
        {
            for (const langKey in mydb.locales.en.templates)
            {
                const lang = mydb.locales.en.templates[langKey];
                locales[localeID].templates[langKey] = lang;
            }
        }

        
        for (const language in mydb.locales)
        {
            for (const langKey in mydb.locales[language].templates)
            {
                const lang = mydb.locales[language].templates[langKey];
                locales[language].templates[langKey] = lang;
            }
        }
        // END doTheManualCreationThingy

        // START traderFunctionForOrganizationsSake
        
        for (const itemKey in mydb.assort[traderID].items)
        {
            const item = mydb.assort[traderID].items[itemKey];
            db.traders[traderID].assort.items.push(item);
        }

        for (const itemKey in mydb.assort[traderID].loyal_level_items)
        {
            const item = mydb.assort[traderID].loyal_level_items[itemKey];
            db.traders[traderID].assort.loyal_level_items[itemKey] = item;    
        }

        for (const itemKey in mydb.assort[traderID].barter_scheme)
        {
            const item = mydb.assort[traderID].barter_scheme[itemKey];
            db.traders[traderID].assort.barter_scheme[itemKey] = item;    
        }
        // END traderFunctionForOrganizationsSake

        // START addToMastery
        db.globals.config.Mastering.push({
            "Name": "AWM",
            "Templates": [
                "weapon_ai_awm_338lm"
            ],
            "Level2": 500,
            "Level3": 1000
        })
        // END addToMastery

        // START createPresetThing
        
        const item = JsonUtil.clone(tables.globals.ItemPresets["5ddbbeac582ed30a6134e577"]);
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

        // START addFullRifleToMechanic
        const traderWeaponPreset = WeaponPresetItems;
        traderWeaponPreset[0] = ({
            "_id": "awm_defaultID_parentID", // unique itemID
            "_tpl": "weapon_ai_awm_338lm", // itemID template to use e.g "5447a9cd4bdc2dbd208b4567" == "Colt M4A1 5.56x45 Assault Rifle"
            "parentId": "hideout", // not sure what do?
            "slotId": "hideout", // not sure what do?
            "upd":
            {
                "UnlimitedCount": false, // is unlimited? ...obviously
                "StackObjectsCount": 10 // how many trader has
            }
        })

        tables.traders[traderID].assort.items.push(...traderWeaponPreset);

        tables.traders[traderID].assort.barter_scheme["awm_defaultID_parentID"] = [
            [{
                "count": 154127, // quantity needed
                "_tpl": "5449016a4bdc2d6f028b456f" // item needed, in this case roubles
            }]
        ];

        tables.traders[traderID].assort.loyal_level_items["awm_defaultID_parentID"] = this.cfg.mechanic_level;
        
        // END addFullRifleToMechanic

        // START addFullRifleToRagfair

        const ragfair = "ragfair";
        const ragfairWeaponPreset = WeaponPresetItems;
        // update ragfairWeaponPreset for use with trader
        ragfairWeaponPreset[0] = ({
            "_id": "awm_defaultID_parentID", // unique itemID
            "_tpl": "weapon_ai_awm_338lm", // itemID template to use e.g "5447a9cd4bdc2dbd208b4567" == "Colt M4A1 5.56x45 Assault Rifle"
            "parentId": "hideout", // not sure what do?
            "slotId": "hideout", // not sure what do?
            "upd":
            {
                "UnlimitedCount": true, // is unlimited? ...obviously
                "StackObjectsCount": 99999999 // how many trader has
            }
        });

        tables.traders[ragfair].assort.items.push(...ragfairWeaponPreset);

        tables.traders[ragfair].assort.barter_scheme["awm_defaultID_parentID"] = [
            [{
                "count": 204158, // quantity needed
                "_tpl": "5449016a4bdc2d6f028b456f" // item needed, in this case roubles
            }]
        ];

        tables.traders[ragfair].assort.loyal_level_items["awm_defaultID_parentID"] = 1;

        // END addFullRifleToRagfair

        // START FixQuests

        const questIDs = [
            "5bc4776586f774512d07cf05",
            "5bc479e586f7747f376c7da3",
            "5bc47dbf86f7741ee74e93b9",
            "5bc4826c86f774106d22d88b",
            "5bc4836986f7740c0152911c",
            "5bc4856986f77454c317bea7",
            "5bc4893c86f774626f5ebf3e"
        ];

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

module.exports = { mod: new Mod() }