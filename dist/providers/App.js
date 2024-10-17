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
const Express_1 = __importDefault(require("./Express"));
const GameRound_1 = __importDefault(require("./GameRound"));
const Publisher_1 = __importDefault(require("./Publisher"));
const Subscriber_1 = __importDefault(require("./Subscriber"));
const Locals_1 = __importDefault(require("./Locals"));
const MongoDBConnection_1 = __importDefault(require("./MongoDBConnection"));
const EventSchedule_1 = require("./EventSchedule");
const Dashboard_1 = require("./Dashboard");
const Log_1 = __importDefault(require("../api/middlewares/Log"));
const GlobalState_1 = require("./GlobalState");
const Initalilize_1 = require("./Initalilize");
class App {
    // Loads your Server
    loadServer() {
        return __awaiter(this, void 0, void 0, function* () {
            Log_1.default.info('Server:: Initialzing...');
            Express_1.default.init();
            // Create an instance of MongoDBConnection with the MongoDB URI
            const mongoConnection = MongoDBConnection_1.default.createInstance(Locals_1.default.config().mongodbURI);
            // Connect to MongoDB
            yield mongoConnection.connectToMongoDB();
            console.log("Connected to mongodb successfully!");
            // Initialize
            yield (0, Initalilize_1.initialize)();
            // Start Schedule Events
            EventSchedule_1.EventSchedule.createInstance().start();
            Dashboard_1.Dashboard.loadAllTimeWinsPaidFile();
            require("./Challenges");
            require("./DailyEvent");
            const publisher = Publisher_1.default.createInstance(Express_1.default.server);
            const subscriber = Subscriber_1.default.createInstance(Locals_1.default.config().binanceWss);
            GlobalState_1.GlobalState.gameRound = GameRound_1.default.createInstance(publisher, subscriber);
            GlobalState_1.GlobalState.gameRound.start();
        });
    }
}
exports.default = new App();
