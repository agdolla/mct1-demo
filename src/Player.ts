// import { IBar } from 'magikcraft-lore-ui-bar/dst';
// import * as log from './old/util/log';
import * as Bar from './Bar';
import Utils from './Utils';
import Food from './Food';

const magik = magikcraft.io;
const log = magik.dixit;

const INSULIN_BAR_KEY = 'mct1.bar.insulin';
const BGL_BAR_KEY = 'mct1.bar.BGL';
const DIGESTION_BAR_KEY = 'mct1.bar.digestiom';

class PlayerClass {
	name: string;
	player: any;
	insulin: number;
	BGL: number;
	digestionQueue: Array<any>;

	constructor(name) {
		this.name = name;
		this.player = magik.getSender();
		this.insulin = 0;
		this.BGL = 4;
		this.digestionQueue = [];
		this.doDigestion();
		magik.Events.on('PlayerItemConsumeEvent', this._onConsume);
	}

	setFood = (num: number) => {
		this.player.setFoodLevel(num);
	}

	setHealth = (num: number) => {
		this.player.setHealth(num);
	} 

	setInsulin(num: number = 0) {
		this.insulin = num;
	}

	setBGL(num: number = 0) {
		this.BGL = num;
	}

	renderBars = () => {
		// BGLBar
		const BGLBar = Bar.bar()
			.text(`BGL: ${this.insulin}`)
			.color(Bar.color[this._BGLBarColor()])
			.style(Bar.style.NOTCHED_20)
			.progress((this.BGL / 20) * 100)
			.show();
		magik.playerMap.get(BGL_BAR_KEY).destroy();
		magik.playerMap.put(BGL_BAR_KEY, BGLBar);
		
		// insulinBar
		const insulinBar = Bar.bar()
			.text(`BGL: ${this.insulin}`)
			.color(Bar.color[this._BGLBarColor()])
			.style(Bar.style.NOTCHED_20)
			.progress((this.BGL / 20) * 100)
			.show();
		magik.playerMap.get(INSULIN_BAR_KEY).destroy();
		magik.playerMap.put(INSULIN_BAR_KEY, insulinBar);

		this.digestionQueue.slice(0, 3).map((item, i) => {
			// digestionBar
			const digestionBar = Bar.bar()
				.text(`Digesting: ${item.type}`)
				.color(Bar.color.RED)
				.style(Bar.style.NOTCHED_20)
				.progress(item.percentDigested)
				.show();
			magik.playerMap.get(`${DIGESTION_BAR_KEY}-${i}`).destroy();
			magik.playerMap.put(`${DIGESTION_BAR_KEY}-${i}`, digestionBar);
		});
	}

	doDigestion() {
		log('digesting...');
		magik.setTimeout(function() {
			if (this.digestionQueue[0]) {
				this.digestionQueue[0].percentDigested += 20;
				if (this.digestionQueue[0].percentDigested >= 100) {
					// finished digesting, remove from queue...
					this.digestionQueue.splice(0, 1);
				}
				this.renderBars();
			}
			// repeat!
			this.doDigestion();
		}, 1000);
	}

	_onConsume = (event) => {
		const type = event.getItem().getType();
		const amount = event.getItem().getAmount();
		log(`You consumed ${amount} ${type}!`);
		if (Food[type]) {
			event.setCancelled(true);
			const digestionQueueItem = {
				type: Food[type],
				percentDigested: 0,
			};
			this.digestionQueue.push(digestionQueueItem);
		}
	}

	_BGLBarColor = () => {
		let color = 'GREEN';
		if (this.BGL >= 4 && this.BGL <= 8) {
			color = 'GREEN';
		}
		else if ((this.BGL < 4 && this.BGL >= 2) || (this.BGL > 8 && this.BGL <= 10)) {
			color = 'ORANGE';
		}
		else {
			color = 'RED';
		}
		return color;
	}

	getInventory() {
        const inventory = this.player.getInventory(); //Contents of player inventory
        for (let i = 0; i <= 35; i++) {
            const item = inventory['getItem'](i);
            if (item) {
                const type = item.getType();
                const amount = item.getAmount();
                log('i: ' + i);
                log('type: ' + type);
                log('amount: ' + amount);
            }
        }
	}
	
}


const playerName = magik.getSender().getName();
const Player = new PlayerClass(playerName);
export default Player;
