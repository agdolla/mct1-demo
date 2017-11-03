import * as Bar from './Bar';
import Utils from './Utils';
import { getState, setState, resetState } from './State';
// import * as fs from 'fs-extra'; 

import Events from './Events';

// Read the file, and pass it to your callback

const magik = magikcraft.io;
const log = magik.dixit;

const player = magik.getSender();
let state = getState();

import InventoryList from './InventoryList';
import FoodList from './FoodList';
const Food:any = {};
FoodList.forEach(item => Food[item.type] = item);

// TODO:
// * Use XP bar for lightning
// * BGL going down due to insulin = get health
// * See in dark when in range
// * All super powers only when in range
// * don't allow them to below 2, or above 20 (blind at 15)
// * high GI go top top of queue, digest faster, effect BGL positively, even if insulin in system
// * low GI, digest slower, BGL still goes down in Insulin in system

const Player = {
	init() {
		this.reset();
		this.setFood(2);

		if (!state.digesting) {
			this.doDigestion();
			state.digesting = true;
			setState(state);
			log('digesting');
		}

		if (!state.listening) {
			log('listening');
			this.enableEventListeners();
			state.listening = true;
			setState(state);
		}
	},

	reset() {
		// Reset State
		resetState(state);

		this.clearNegativeEffects();
		this.clearSuperPowers();
		this.clearInventory();

		this.setupInventory();
		this.renderBars();
		// Super Powers!
		this.makeSuperPowers();
	},

	enableEventListeners() {
		Events.registerAll();
		Events.on('ProjectileHitEvent', (event) => { 
			log('ProjectileHitEvent'); 
			this.onProjectileHit(event) 
		});
		Events.on('PlayerItemConsumeEvent', (event) => { 
			log('PlayerItemConsumeEvent'); 
			this.onConsume(event) 
		});
		Events.on('PlayerDeathEvent', (event) => {
			log('PlayerDeathEvent: ' + event.getDeathMessage());
			state.dead = true;
			setState(state);
			// this.reset();
		});
		Events.on('PlayerRespawnEvent', (event) => {
			log('PlayerRespawnEvent: ' + event.getRespawnLocation())
			state.dead = false;
			setState(state);
			this.reset();
		});
		Events.on('EntityDamageByEntityEvent', (event) => { 
			log('EntityDamageByEntityEvent: ' + event.getCause());
			const entityType = event.getEntityType(); // EntityType
			const cause = event.getCause(); // LIGHTNING STARVATION FIRE FALL ENTITY_ATTACK
			const damagerType = event.getDamager().getType();
			if (damagerType == 'PLAYER') {
				if (cause == 'ENTITY_ATTACK') {
					magik.dixit('set fire to '+ entityType + '!!!');
					event.getEntity().setFireTicks(200);
					const loc = event.getEntity().getLocation();
					const location = `${loc.getX()} ${loc.getY()} ${loc.getZ()}`;
					const server = magik.getPlugin().getServer();
					const cmd = `execute ${event.getDamager().getName()} ~ ~ ~ summon lightning_bolt ${location}`;
					server.dispatchCommand(server.getConsoleSender(), cmd);
				}
			}
		});
		Events.on('EntityDamageEvent', (event) => {
			// log('EntityDamageEvent: ' + event.getCause());
			const entityType = event.getEntityType(); // EntityType
			const cause = event.getCause(); // LIGHTNING STARVATION FIRE FALL ENTITY_ATTACK
			if (entityType == 'PLAYER') {
				if (cause == 'LIGHTNING' || cause == 'FIRE' || cause == 'FIRE_TICK') {
					magik.dixit('set LIGHTNING damage to 0 for ' + event.getEntity().getName());
					event.setDamage(0);
					event.setCancelled(true);
				}
			}
		});
	},

	setFood(num: number) {
		player.setFoodLevel(num);
	},

	setHealth(num: number) {
		player['setHealth'](num);
	},

	setInsulin(num: number = 0) {
		state.insulin = num;
		setState(state);
	},

	setBGL(num: number = 0) {
		state.bgl = num;
		setState(state);
	},

	renderBars() {
		// First, clear all bars.... 
		if (state.bglBar) state.bglBar.destroy();
		if (state.insulinBar) state.insulinBar.destroy();
		if (state.digestionBar0) state.digestionBar0.destroy();
		if (state.digestionBar1) state.digestionBar1.destroy();
		
		// Minecraft supports upto 4 bars onscreen at once.

		// bglBar color
		let color  = 'GREEN';
		if (state.bgl >= 4 && state.bgl <= 8) {
			color = 'GREEN';
		} else if ((state.bgl < 4 && state.bgl >= 2) || (state.bgl > 8 && state.bgl <= 12)) {
			color = 'YELLOW';
		} else {
			color = 'RED';
		}
		// bglBar
		state.bglBar = Bar.bar()
			.text(`BGL: ${Math.round(state.bgl*10)/10}`) // round to 1 decimal
			.color(Bar.color[color])
			.style(Bar.style.NOTCHED_20)
			.progress((state.bgl/20)*100)
			.show();

		// insulinBar
		state.insulinBar = Bar.bar()
			.text(`Insulin: ${Math.round(state.insulin*10)/10}`) // round to 1 decimal
			.color(Bar.color.BLUE)
			.style(Bar.style.NOTCHED_20)
			.progress((state.insulin/20)*100) // insulin as percentage, rounded to 1 decimal
			.show();

		// digestionBar(s)
		state.digestionQueue.slice(0, 2).map((item, i) => {
			const food = Food[item.type];
			state[`digestionBar${i}`] = Bar.bar()
				.text(`Digesting: ${food.type} (${food.carbs} carbs)`)
				.color((food.GI === 'high') ? Bar.color.PURPLE : Bar.color.PINK)
				.style(Bar.style.NOTCHED_20)
				.progress(100 - item.percentDigested)
				.show();
		});

		// SetState
		setState(state);
	},

	doDigestion(tickCount = 0) {
		// log('digesting...');
		const that = this;
		magik.setTimeout(function() {
			// Skip if dead!
			if (state.dead) {
				that.doDigestion(tickCount);
				return;
			}

			// Every 10 ticks...
			if (tickCount % 10 === 0) {
				// Reduce food level.
				player.setFoodLevel(Math.max((player.getFoodLevel()-1), 0));
			}

			// handle insulin in system
			if (state.insulin > 0) {
				state.insulin -= 0.1;
				state.bgl -= 0.3;
				if (state.bgl < 2 && player.getFoodLevel() >= 20) {
					player.setFoodLevel(15);
				}
			}

			// handle digestionQueue
			if (state.digestionQueue[0]) {
				state.digestionQueue[0].percentDigested += 5;
				state.bgl += 0.2;
				if (player['getHealth']() < 20) {
					player['setHealth'](Math.min((player['getHealth']()+0.5), 20))
				}
				if (state.digestionQueue[0].percentDigested >= 100) {
					// finished digesting... remove from queue...
					state.digestionQueue.splice(0,1);
				}
			}

			
			state.inHealthyRange = (state.bgl >= 4 && state.bgl <= 8);
			setState(state);
			that.renderBars();
			that.doEffects();

			// Never allow player to be full!
			if (player.getFoodLevel() >= 20) {
				player.setFoodLevel(19.5);
			}

			// repeat ongoingly!
			tickCount++;
			that.doDigestion(tickCount);
		}, 1000);
	},

	onConsume(event) {
		log('onConsume!');
		const consumer = event.getPlayer();
		if (consumer.getName() !== player.getName()) {
			return;
		}	
		const type = event.getItem().getType();
		if (Food[type]) {
			log(`You ate a ${type}!`);
			const item = {
				timestamp: Utils.makeTimestamp(),
				type: type,
				percentDigested: 0,
			};
			state.digestionQueue.push(item);
			setState(state);
			this.renderBars();
			// event.setCancelled(true);
		}
		else if (type == 'POTION') { // important! use double arrow (not triple)
			log(`You drank an INSULIN POTION!`);
			state.insulin += 2;
			setState(state);
			this.renderBars();
		}
	},

	onProjectileHit(event) {
		// Identify shooter.
		const shooter = event.getEntity().getShooter();
		if (!shooter || shooter.getName() !== player.getName()) {
			return;
		}
		
		// Get loc
		let loc:any = null;
		if (event.getHitEntity()) {
			loc = event.getHitEntity().getLocation();
		} else if (event.getHitBlock()) {
			loc = event.getHitBlock().getLocation();
		}

		if (!loc) return;
		
		const location = `${loc.getX()} ${loc.getY()} ${loc.getZ()}`;
		const server = magik.getPlugin().getServer();
		const cmd = `execute ${player.getName()} ~ ~ ~ summon lightning_bolt ${location}`;
		server.dispatchCommand(server.getConsoleSender(), cmd);

		// Food or Health cost...
		if (player.getFoodLevel() > 0) {
			player.setFoodLevel(Math.max(player.getFoodLevel()-1, 0));
		}
		// else {
		// 	player['setHealth'](player['getHealth']() - 1);
		// }
	},

	doEffects() {
		if ((state.bgl >= 4 && state.bgl <= 8)) {
			// Super powers!
			this.makeSuperPowers();
		}
		else {
			// Negative Effects!
			this.clearSuperPowers();
			// Confusion!
			if ((state.bgl < 4 && state.bgl >= 3) || (state.bgl > 8 && state.bgl <= 12)) {
				this.doConfusion(2500);
			}
			// More Confusion!
			else if (state.bgl < 3 || state.bgl > 16) {
				this.doConfusion(5000);
			}
			// Layer additional effects.
			if (state.bgl < 2 || state.bgl >= 16) {
				this.doBlindness(5000);
				this.doPoison(5000);
			}
		}
	},

	clearNegativeEffects() {
		const PotionEffectType = magik.type("potion.PotionEffectType");
		if (player['hasPotionEffect'](PotionEffectType.CONFUSION) == true) {
			player['removePotionEffect'](PotionEffectType.CONFUSION);
		}
		if (player['hasPotionEffect'](PotionEffectType.BLINDNESS) == true) {
			player['removePotionEffect'](PotionEffectType.BLINDNESS);
		}
		if (player['hasPotionEffect'](PotionEffectType.POISON) == true) {
			player['removePotionEffect'](PotionEffectType.POISON);
		}
	},

	doConfusion(milliseconds) {
		if (!state.confusionEffect) {
			this._makeEffect('CONFUSION', milliseconds);
			state.confusionEffect = true;
			setState(state);
			magik.setTimeout(() => {
				state.confusionEffect = false;
				setState(state);
			}, milliseconds);
		}
	},

	doBlindness(milliseconds) {
		if (!state.blindnessEffect) {
			this._makeEffect('BLINDNESS', milliseconds);
			state.blindnessEffect = true;
			setState(state);
			magik.setTimeout(() => {
				state.blindnessEffect = false;
				setState(state);
			}, milliseconds);
		}
	},

	doPoison(milliseconds) {
		if (!state.poisonEffect) {
			this._makeEffect('POISON', milliseconds);
			state.poisonEffect = true;
			setState(state);
			magik.setTimeout(() => {
				state.poisonEffect = false;
				setState(state);
			}, milliseconds);
		}
	},

	makeSuperPowers() {
		this._makeEffect('SPEED', 10000000, 'WHITE', 3);
		this._makeEffect('JUMP', 10000000, 'WHITE', 3);
		this._makeEffect('GLOWING', 10000000, 'WHITE');
		this._makeEffect('NIGHT_VISION', 10000000, 'WHITE');
	},

	clearSuperPowers() {
		const PotionEffectType = magik.type("potion.PotionEffectType");
		if (player['hasPotionEffect'](PotionEffectType.SPEED) == true) {
			player['removePotionEffect'](PotionEffectType.SPEED);
		}
		if (player['hasPotionEffect'](PotionEffectType.JUMP) == true) {
			player['removePotionEffect'](PotionEffectType.JUMP);
		}
		if (player['hasPotionEffect'](PotionEffectType.GLOWING) == true) {
			player['removePotionEffect'](PotionEffectType.GLOWING);
		}
		if (player['hasPotionEffect'](PotionEffectType.NIGHT_VISION) == true) {
			player['removePotionEffect'](PotionEffectType.NIGHT_VISION);
		}
	},

	_makeEffect(type, milliseconds, color = 'GREEN', amplifier = 1) {
		const PotionEffect = magik.type("potion.PotionEffect");
		const PotionEffectType = magik.type("potion.PotionEffectType");
		const Color = magik.type("Color");
		const duration = milliseconds/1000*40; // 20 tick. 1 tick = 0.05 seconds
		const c = Color[color];
		const l = PotionEffectType[type];
		const effect = new PotionEffect(l, duration, amplifier, true, true, c);
		player.addPotionEffect(effect);
	},

	getInventory() {
        const inventory = player.getInventory(); //Contents of player inventory
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
	},

	refreshInventory() {
		// const MATERIAL = Java.type("org.bukkit.Material");
        // const ItemStack = Java.type("org.bukkit.inventory.ItemStack");
		const server = magik.getPlugin().getServer();

		// event.getPlayer().getInventory().setItem(37, new ItemStack(Material.CHEESE, 1));
		// const thing = new ItemStack(MATERIAL[item]);
		// canon.sender.getInventory().addItem(thing);
		
		InventoryList.map(item => {
			// const stack = new ItemStack(MATERIAL[item.type], item.quantity);
			// player.getInventory()['setItem'](item.slot, stack);
			const slot = (item.slot <= 8) ? `slot.hotbar.${item.slot}` : `slot.inventory.${item.slot-1}`
			const cmd = `replaceitem entity ${player.getName()} ${slot} ${item.type} ${item.quantity}`;
			magik.dixit(cmd);
			server.dispatchCommand(server.getConsoleSender(), cmd);
			// magik.dixit(`server.dispatchCommand(give ${player.getName()} ${item.type} ${item.amount})`);
		});
	},

	setupInventory() {
		const items = [
			{ type: 'SNOWBALL', amount: 128 },
			{ type: 'APPLE', amount: 64 },
			{ type: 'BREAD', amount: 64 },
			{ type: 'COOKED_FISH', amount: 64 },
			{ type: 'POTION', amount: 128 },
		];

		const server = magik.getPlugin().getServer();

		items.map(item => {
			server.dispatchCommand(server.getConsoleSender(), `give ${player.getName()} ${item.type} ${item.amount}`);
			magik.dixit(`server.dispatchCommand(give ${player.getName()} ${item.type} ${item.amount})`);
		});
	},

	clearInventory() {
		player.getInventory()['clear']();
	},
}

export default Player;