"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Player_1 = require("./Player");
exports.spells = {
    _default: function (isUSA) {
        if (isUSA === void 0) { isUSA = false; }
        return Player_1.default.init(isUSA);
    },
    // Below: Utility functions only, not required for MCT1 operation.
    countdown: function (secs) { return Player_1.default.doCountdown(secs); },
};
