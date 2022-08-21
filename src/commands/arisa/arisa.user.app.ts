import axios from 'axios';
import auth from 'configs/auth';
import FormData from 'form-data';
import { AppCommand, AppFunc, BaseSession } from 'kbotify';
import * as bandori from './bandori.js'
import * as linkmap from './linkmap'

class FetchUser extends AppCommand {
    code = 'user';
    trigger = 'user';
    help = '`.arisa user`';
    intro = 'Arisa user';
    func: AppFunc<BaseSession> = async (session) => {
        console.log("user")
        if (session.args.length == 0) {
            return session.replyTemp("Please specificate a user ID");
        } else {
            const args = session.args[0];
            if (isNaN(parseInt(args))) {
                return session.replyTemp("User ID must be a number!");
            }
            if (linkmap.isInDatabase(args)) {
                return session.sendCard([
                    {
                        "type": "card",
                        "theme": "info",
                        "size": "lg",
                        "modules": [
                            {
                                "type": "container",
                                "elements": [
                                    {
                                        "type": "image",
                                        "src": linkmap.getLink(args)
                                    }
                                ]
                            }
                        ]
                    }
                ]);
            }
            const userid = parseInt(args);
            axios({
                url: `https://bestdori.com/api/player/jp/${userid}?mode=2`,
                method: "GET",
            }).then(async (res) => {
                console.log("get user detail success")
                const data = res.data;
                if (data.result) {
                    const lastUpdatedTime = data.data.time;
                    const isCache = data.data.cache;
                    var profile: bandori.bestdoriUser = data.data.profile;
                    profile.userId = userid.toString();
                    var bodyFormData = new FormData();
                    bodyFormData.append('file', await bandori.generateProfilePicure(profile), "img.jpg");
                    var imgLink: string = linkmap.akarin;
                    await axios({
                        method: "post",
                        url: "https://www.kookapp.cn/api/v3/asset/create",
                        data: bodyFormData,
                        headers: {
                            'Authorization': `Bot ${auth.khltoken} `,
                            ...bodyFormData.getHeaders()
                        }
                    }).then((res) => {
                        if (res.data.code == 0) {
                            console.log("upload success")
                            imgLink = res.data.data.url
                            linkmap.addMap(args, imgLink);
                        }
                    }).catch((e) => {
                        console.log("upload failed")
                        if (e) {
                            console.error(e);
                        }
                    })
                    return session.sendCard([
                        {
                            "type": "card",
                            "theme": "info",
                            "size": "lg",
                            "modules": [
                                {
                                    "type": "container",
                                    "elements": [
                                        {
                                            "type": "image",
                                            "src": imgLink
                                        }
                                    ]
                                }
                            ]
                        }
                    ]);
                }
            })
        }
    };
}

export const fetchUser = new FetchUser();