"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var magik = magikcraft.io;
var log = magik.dixit;
var KEY = 'mct1-demo';
function getState() {
    var state = magik.playerMap.get(KEY) || {};
    state.bgl = state.bgl !== undefined ? state.bgl : 5;
    state.insulin = state.insulin !== undefined ? state.insulin : 0;
    state.digestionQueue = state.digestionQueue ? state.digestionQueue.sort(function (a, b) { return a.timestamp - b.timestamp; }) : [];
    state.bglBar = state.bglBar || null;
    state.insulinBar = state.insulinBar || null;
    state.digestionBar0 = state.digestionBar0 || null;
    state.digestionBar1 = state.digestionBar1 || null;
    state.confusionEffect = state.confusionEffect ? true : false;
    state.blindnessEffect = state.blindnessEffect ? true : false;
    return state;
}
exports.getState = getState;
function setState(state) {
    state.bgl = state.bgl !== undefined ? state.bgl : 5;
    state.insulin = state.insulin !== undefined ? state.insulin : 0;
    state.digestionQueue = state.digestionQueue ? state.digestionQueue.sort(function (a, b) { return a.timestamp - b.timestamp; }) : [];
    state.bglBar = state.bglBar || null;
    state.insulinBar = state.insulinBar || null;
    state.digestionBar0 = state.digestionBar0 || null;
    state.digestionBar1 = state.digestionBar1 || null;
    state.confusionEffect = state.confusionEffect ? true : false;
    state.blindnessEffect = state.blindnessEffect ? true : false;
    magik.playerMap.put(KEY, state);
}
exports.setState = setState;
