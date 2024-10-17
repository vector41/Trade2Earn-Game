"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ably_1 = __importDefault(require("ably"));
const Locals_1 = __importDefault(require("./Locals"));
const Log_1 = __importDefault(require("../api/middlewares/Log"));
class AblyWss {
    constructor() {
        this.ablyPublishApiKey = Locals_1.default.config().ablyPublishApiKey;
        this.ablyChannelName = Locals_1.default.config().ablyChannelName;
        this.ably = new ably_1.default.Realtime.Promise(this.ablyPublishApiKey);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ably.connection.once('connected');
            Log_1.default.info('Ably :: Connected!');
            return this.ably.channels.get(this.ablyChannelName);
        });
    }
}
exports.default = new AblyWss();
