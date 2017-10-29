import BGL from './BGL';
import Insulin from './Insulin';
import Food from './Food';
import * as log from './old/util/log';

const magik = magikcraft.io;

export function init() {
    log.info(`init()`);
    BGL.set(4);
    Insulin.set(0);
    listenConsume();
    setInventory();
    setHeatlh(10);
    setFood(10);
    //getInventory();
}



export const Player = {
    getInventory() {
        magik.dixit('Player.getInventory()');
        const sender = magik.getSender();
        const inventory = sender.getInventory(); //Contents of player inventory
        
        for (let i = 0; i <= 35; i++) {
            magik.dixit('i: ' + i);
            const item = inventory['getItem'](i);
            const type = item.getType();
            magik.dixit('type: ' + type);
        }
        
        // const contents = inventory['getContents']();
        // contents.map(stack => {
        //     const type = stack.getType();
        //     magik.dixit('type: ', type);
        // })
        
        // const contentsStr = JSON.stringify(contents);
        // log.info('inventory[getContents]()', inventory['getContents']());
        // magik.dixit(`Inventory contents: ${contentsStr}`);
    }
}

export function getInventory() {
    log.info(`getContents()`);
    Player.getInventory();
}

export function setInventory() {
    const sender = magik.getSender();
    const playerName = sender.getName();
    const plugin = magik.getPlugin();
    const server = plugin.getServer();
    const consoleSender = server.getConsoleSender();
    
    const items = [
        { type: 'CAKE', amount: 2 },
        { type: 'APPLE', amount: 10 },
        { type: 'BREAD', amount: 5 },
        { type: 'COOKED_FISH', amount: 5 },
    ];

    items.map(item => {
        server.dispatchCommand(consoleSender, `give ${playerName} ${item.type} ${item.amount}`);
        magik.dixit(`server.dispatchCommand(give ${playerName} ${item.type} ${item.amount})`);
    });
}

export function setBGL(num: number = 0) {
    log.info(`setBGL(${num})`);
    BGL.set(num);
}

export function setFood(num: number = 10) {
    log.info(`setFood(${num})`);
    const sender = magik.getSender();
    sender.setFoodLevel(num);
}

export function setHeatlh(num: number = 20) {
    log.info(`setHeatlh(${num})`);
    const sender = magik.getSender();
    sender['setHealth'](num);
}

export function setInsulin(num: number = 0) {
    log.info(`setInsulin(${num})`);
    Insulin.set(num);
}

export function listenConsume()  {
    magik.dixit('listening to PlayerItemConsumeEvent...');
    magik.Events.on('PlayerItemConsumeEvent', (event) => {;
        const foodType = event.getItem().getType();
        magik.dixit(`you ate a ${foodType}!`);
        // magik.dixit('event: ' + JSON.stringify(event));
        const player = event.getPlayer();
        const playerName = player.getName();
        magik.dixit('playerName: ' + playerName);
        magik.dixit('player.getHealth(): ' + player.getHealth());
        magik.dixit('player.getFoodLevel(): ' + player.getFoodLevel());
        event.setCancelled(true);
    });
}

const _default = init;
export const spells = {
    _default,
    init,
    setBGL,
    setInsulin,
    listenConsume,
    setInventory,
    setHeatlh,
    setFood,
    getInventory,
}
