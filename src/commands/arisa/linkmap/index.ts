import axios from 'axios';
import auth from 'configs/auth';
import fs from 'fs';
import upath from 'upath';

var map: {
    [key: string]: linkmap
} = {};
type linkmap = {
    kookLink: string
}

export const akarin = "https://img.kookapp.cn/assets/2022-07/vlOSxPNReJ0dw0dw.jpg";
export async function init() {
    load();
}
export async function load() {
    if (fs.existsSync(upath.join(__dirname, "map.json"))) {
        map = JSON.parse(fs.readFileSync(upath.join(__dirname, "map.json"), { encoding: "utf-8", flag: "r" }));
        console.log(`Loaded linkmap from local`);
    } else {
        save();
        console.log(`Linkmap not found, creating new`);
    }
}

export function isInDatabase(id: string): boolean {
    if (map.hasOwnProperty(id)) {
        return true;
    } else {
        return false;
    }
}

export function getLink(id: string): string {
    if (isInDatabase(id)) {
        return map[id].kookLink;
    } else {
        return "";
    }
}

export function addMap(id: string, link: string): void {
    map = {
        ...map,
        [id]: {
            kookLink: link
        }
    }
}

export function save() {
    fs.writeFile(upath.join(__dirname, "map.json"), JSON.stringify(map), (err) => {
        if (err) {
            console.error(`Saving linkmap failed, error message: `);
            console.error(err);
        }
        else {
            console.log(`Saved linkmap`);
        }
    });
}