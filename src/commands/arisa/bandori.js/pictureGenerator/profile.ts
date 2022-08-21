import * as fs from 'fs';
import sharp from 'sharp';
import upath from 'upath';
import axios from 'axios';

//==============================Types===================================//\

export interface bestdoriUser {
    userId: string,
    userName: string,
    introduction: string,
    rank: number,
    userProfileDegreeMap: userProfileDegreeMap,
    bandRankMap?: bandRankMap
};
export interface userProfileDegreeMap {
    entries: {
        first: {
            userId: string,
            profileDegreeType: "first",
            degreeId: number,
        },
        second?: {
            userId: string,
            profileDegreeType: "second",
            degreeId: number,
        }
    }
}
export interface bandRankMap {
    entries: {
        [key: number]: number
    }
}

//=============================Methods==================================//

const degrees = JSON.parse(fs.readFileSync(upath.join(__dirname, "assets", "degrees.json"), { encoding: "utf-8", flag: "r" }));

function textSVG(input: string | number, textSize: number, textColor: string, imageWidth: number, backgroundColor: string) {
    return Buffer.from(`
    <svg width="${imageWidth}" height="${textSize + 10}">
        <rect width="100%" height="${textSize + 10}" fill="${backgroundColor}" />
        <text x="0" y="${textSize}" font-family="TT-Shin Go" font-size="${textSize}" fill="${textColor}">
            ${input}
        </text>
    </svg>`);
}

function textCenterSVG(input: string | number, textSize: number, textColor: string, imageWidth: number, backgroundColor: string) {
    return Buffer.from(`
    <svg width="${imageWidth}" height="${textSize + 6}">
        <rect width="100%" height="100%" fill="${backgroundColor}" />
        <text x="50%" y="${(textSize + 6) / 2 + textSize / 4}" dominant-baseline="middle" text-anchor="middle" font-family="TT-Shin Go" font-size="${textSize}" fill="${textColor}">
            ${input}
        </text>
    </svg>`);
}

function playerNameSVG(input: string): Buffer {
    return textSVG(input, 48, "#676767", 430, "#dddddd")
}

function playerBioSVG(input: string): Buffer {
    return textSVG(input, 32, "#676767", 430, "#dddddd")
}

function playerIDSVG(input: string): Buffer {
    return textSVG(input, 32, "#676767", 234, "#ffffff")
}

function playerRankNumberSVG(input: number): Buffer {
    // return textSVG(input, 52, "#676767", 122, "#ffffff")
    return textCenterSVG(input, 52, "#676767", 122, "#ffffff");
}


const bandRankPosMap = {
    1: { x: 1165, y: 1208 },
    2: { x: 1383, y: 1208 },
    3: { x: 1591, y: 1208 },
    4: { x: 1797, y: 1208 },
    5: { x: 2012, y: 1208 },
    18: { x: 1166, y: 1334 },
    21: { x: 1383, y: 1334 },
}
function bandRankSVG(bandId: number, profile: bestdoriUser): Buffer {
    if (profile.bandRankMap && profile.bandRankMap.entries) {
        return textCenterSVG(profile.bandRankMap.entries[bandId], 37, "#676767", 62, "#ffffff");
    } else {
        return textCenterSVG(0, 37, "#676767", 62, "#ffffff");
    }
}

async function playerDegree(degree: number): Promise<Buffer> {
    var degreeImg: Buffer = textSVG("", 48, "#ffffff", 410, "#ffffff");
    degrees[degree.toString()].baseImageName
    await axios({
        method: "get",
        url: `https://bestdori.com/assets/jp/thumb/degree_rip/${degrees[degree].baseImageName[0]}.png`,
        responseType: "arraybuffer"
    }).then(async (res) => {
        if (res.headers["content-type"] && res.headers["content-type"].includes("image")) {
            console.log("get degree sucess")
            degreeImg = await sharp(Buffer.from(res.data)).flatten({ background: "#ffffff" }).resize(404, 89).png().toBuffer()
            console.log("degree processing success")
        }
    }).catch((e) => {
        console.log("get degree failed")
        if (e) {
            console.error(e);
        }
    })
    return degreeImg;
}

function isObjKey<T>(key: PropertyKey, obj: T): key is keyof T {
    return key in obj;
}

export async function generateProfilePicure(profile: bestdoriUser): Promise<Buffer> {
    const base = fs.readFileSync(upath.join(__dirname, "assets", "playerProfileBase.png"), { flag: "r" });

    // var buff = await sharp(svg).png().toBuffer();
    var buff = await sharp(base).composite([
        // Player name
        {
            input: playerNameSVG(profile.userName),
            top: 433,
            left: 1433,
        },
        // Player description
        {
            input: playerBioSVG(profile.introduction),
            top: 669,
            left: 1365,
        },
        // Player ID
        {
            input: playerIDSVG(profile.userId),
            top: 1317,
            left: 548,
        },
        // Player rank number
        {
            input: playerRankNumberSVG(profile.rank),
            top: 88,
            left: 1270,
        },
        // Stars number
        {
            input: textSVG(114514, 35, "#676767", 218, "#ffffff"),
            top: 115,
            left: 1595,
        },
        // Coins number
        {
            input: textSVG(1919810, 32, "#676767", 222, "#ffffff"),
            top: 113,
            left: 1951,
        },
        // Player tags
        {
            input: await playerDegree(profile.userProfileDegreeMap.entries.first.degreeId),
            top: 543,
            left: 1119
        },
        // Second player tags (optional)
        {
            input: profile.userProfileDegreeMap.entries.second ? await playerDegree(profile.userProfileDegreeMap.entries.second.degreeId) : textSVG("", 90, "#ffffff", 410, "#ffffff"),
            top: 542,
            left: 1536
        },
        // Band rank number
        ...(() => {
            var res: any[] = [];
            for (const val of [1, 2, 3, 4, 5, 18, 21]) {
                if (isObjKey(val, bandRankPosMap))
                    res.push({
                        input: bandRankSVG(val, profile),
                        top: bandRankPosMap[val].y,
                        left: bandRankPosMap[val].x,
                    });
            }
            console.log("bandRank success");
            return res;
        })()
    ]).png().toBuffer();
    buff = await sharp(buff).resize(1920).png().toBuffer();
    console.log("image done");
    return buff;
}