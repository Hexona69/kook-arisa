import { KBotify } from 'kbotify';
import auth from '../configs/auth';

export const bot = new KBotify({
    mode: 'websocket', //确保和开黑啦应用的后台设置一样。如果使用webhook，请详细阅读开发者手册关于"?compress=0"的部分。
    token: auth.khltoken,
    port: auth.khlport,
    verifyToken: auth.khlverify,
    key: auth.khlkey,
    ignoreDecryptError: true,
});
