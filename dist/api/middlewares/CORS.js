"use strict";
/**
 * Enables the CORS
 *
 * @author Isom D. <isom19901122@gmail.com>
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const Log_1 = __importDefault(require("./Log"));
const Locals_1 = __importDefault(require("../../providers/Locals"));
class CORS {
    mount(_express) {
        Log_1.default.info("Booting the 'CORS' middleware...");
        const apiPrefix = Locals_1.default.config().apiPrefix;
        const corsOptions = {
            origin: '*',
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
            credentials: true,
            optionsSuccessStatus: 204,
        };
        _express.use(`/${apiPrefix}`, (0, cors_1.default)(corsOptions));
        return _express;
    }
}
exports.default = new CORS();
