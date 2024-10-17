"use strict";
/**
 * Defines all the requisites in HTTP
 *
 * @author Isom D. <isom19901122@gmail.com>
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import flash from 'express-flash';
const compression_1 = __importDefault(require("compression"));
const bodyParser = __importStar(require("body-parser"));
const Log_1 = __importDefault(require("./Log"));
const Locals_1 = __importDefault(require("../../providers/Locals"));
class Http {
    static mount(_express) {
        Log_1.default.info("Booting the 'HTTP' middleware...");
        // Enables the request body parser
        _express.use(bodyParser.json({
            limit: Locals_1.default.config().maxUploadLimit,
        }));
        _express.use(bodyParser.urlencoded({
            limit: Locals_1.default.config().maxUploadLimit,
            parameterLimit: Locals_1.default.config().maxParameterLimit,
            extended: false,
        }));
        // Disable the x-powered-by header in response
        _express.disable('x-powered-by');
        // Enables the CORS
        // _express.use(cors());
        // Enables the "gzip" / "deflate" compression for response
        _express.use((0, compression_1.default)());
        return _express;
    }
}
exports.default = Http;
