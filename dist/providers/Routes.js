"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Locals_1 = __importDefault(require("./Locals"));
const ApiRoutes_1 = __importDefault(require("../api/routes/ApiRoutes"));
const Log_1 = __importDefault(require("../api/middlewares/Log"));
class Routes {
    mountApi(_express) {
        const apiPrefix = Locals_1.default.config().apiPrefix;
        Log_1.default.info('Route :: Mounting API Routes...');
        return _express.use(`/${apiPrefix}`, ApiRoutes_1.default.router);
    }
}
exports.default = new Routes();
