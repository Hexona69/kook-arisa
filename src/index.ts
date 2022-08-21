import { fetchUser } from 'commands/arisa/arisa.user.app';
import { bot } from 'init/client';
import { echoMenu } from './commands/arisa/arisa.menu';

bot.messageSource.on('message', (e) => {
    bot.logger.debug(`received:`, e);
    // 如果想要在console里查看收到信息也可以用
    //console.log(e);
});

bot.addCommands(echoMenu);
bot.addAlias(fetchUser, "查询用户");

bot.connect();

bot.logger.debug('system init success');
