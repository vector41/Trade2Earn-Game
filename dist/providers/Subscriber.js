"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const Log_1 = __importDefault(require("../api/middlewares/Log"));
class Subscriber {
    constructor(wssUrl) {
        this.wssUrl = wssUrl;
        this.ws = null;
        this.lastData = '';
        this.reconnect();
    }
    static createInstance(wssUrl) {
        return new Subscriber(wssUrl);
    }
    reconnect() {
        this.connect();
        setTimeout(() => this.reconnect(), 1000 * 60 * 15);
    }
    connect() {
        this.ws = new ws_1.default(this.wssUrl);
        // Event: WebSocket connection is established
        this.ws.on('open', () => {
            Log_1.default.info('Subscriber :: WebSocket Client connection established');
        });
        this.ws.onclose = (event) => {
            // Abnormal closure, attempt to reconnect
            setTimeout(() => this.connect(), 2000); // Adjust delay as needed
        };
        // Event: Received a message from the server
        this.ws.on('message', (data) => {
            this.lastData = data.toString();
        });
        this.ws.onerror = (error) => {
            // Handle errors
            Log_1.default.error(`Subscriber :: WebSocket Error: ${error.message}`);
        };
    }
}
exports.default = Subscriber;
