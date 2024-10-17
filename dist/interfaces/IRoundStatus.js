"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoundPosition = void 0;
var RoundPosition;
(function (RoundPosition) {
    RoundPosition[RoundPosition["NONE"] = 0] = "NONE";
    RoundPosition[RoundPosition["LOCKING"] = 1] = "LOCKING";
    RoundPosition[RoundPosition["LOCKED"] = 2] = "LOCKED";
    RoundPosition[RoundPosition["DISTRIBUTING"] = 3] = "DISTRIBUTING";
    RoundPosition[RoundPosition["DISTRIBUTED"] = 4] = "DISTRIBUTED";
})(RoundPosition || (exports.RoundPosition = RoundPosition = {}));
