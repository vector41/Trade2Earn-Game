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
const mongoose_1 = __importDefault(require("mongoose"));
const GlobalState_1 = require("./GlobalState");
const Log_1 = __importDefault(require("../api/middlewares/Log"));
class MongoDBConnection {
    constructor(uri) {
        this.uri = uri;
    }
    connectToMongoDB() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield mongoose_1.default.connect(this.uri);
                Log_1.default.info('MongoDBConnection :: Connected to MongoDB');
            }
            catch (error) {
                Log_1.default.error(`MongoDBConnection :: Error connecting to MongoDB:${error}`);
                GlobalState_1.GlobalState.stop = false;
            }
        });
    }
    static createInstance(uri) {
        return new MongoDBConnection(uri);
    }
}
exports.default = MongoDBConnection;
