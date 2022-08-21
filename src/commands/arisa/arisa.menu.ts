import { Card, MenuCommand } from 'kbotify';
import { fetchUser } from './arisa.user.app';

class EchoMenu extends MenuCommand {
    code = 'arisa';
    trigger = 'arisa';
    help = 'Arisa Bot';

    intro = 'Arisa Bot';
    menu = new Card().addText("Arisa Bot").toString();
    useCardMenu = true;
}

export const echoMenu = new EchoMenu(fetchUser);
