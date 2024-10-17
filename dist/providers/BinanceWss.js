"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const Locals_1 = __importDefault(require("./Locals"));
class BinanceWss {
    constructor() {
        this.lastPrice = 0;
        this.binanceUrl = Locals_1.default.config().binanceWss;
        this.binanceWss = new ws_1.WebSocket(this.binanceUrl);
    }
    init() {
        this.binanceWss.on('message', (message) => {
            const data = JSON.parse(message);
            const lastPrice = parseFloat(data.p);
            this.lastPrice = lastPrice > 0 ? lastPrice : this.lastPrice;
        });
    }
}
exports.default = BinanceWss;
