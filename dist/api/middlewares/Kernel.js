"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const CORS_1 = __importDefault(require("./CORS"));
const Middleware_1 = __importDefault(require("./Middleware"));
class Kernel {
    static init(_express) {
        _express = CORS_1.default.mount(_express);
        _express = Middleware_1.default.mount(_express);
        return _express;
    }
}
exports.default = Kernel;
