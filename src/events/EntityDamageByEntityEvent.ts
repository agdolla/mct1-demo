// https://hub.spigotmc.org/javadocs/bukkit/org/bukkit/event/player/PlayerInteractEntityEvent.html

import Emitter from './Emitter';
const magik = magikcraft.io;
const log = magik.dixit;
declare const Java: any;

const EventPriority = Java.type("org.bukkit.event.EventPriority");
const EventCallback = Java.type("io.magikcraft.EventCallback");

const EntityDamageByEntityEvent = () => {
    magik.getPlugin().registerEvent(
        Java.type("org.bukkit.event.entity.EntityDamageByEntityEvent").class,
        EventPriority.MONITOR,
        true,
        new EventCallback({
            callback: function (event: any) {
                Emitter.emit('EntityDamageByEntityEvent', event);
            }
        }));	
}

export default EntityDamageByEntityEvent;