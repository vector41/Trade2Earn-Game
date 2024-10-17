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
exports.getNonce = exports.addNonce = void 0;
const Log_1 = __importDefault(require("../middlewares/Log"));
const Nonce_1 = __importDefault(require("../../models/Nonce"));
const addNonce = (address, nonce) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingItem = yield Nonce_1.default.findOne({ address });
        if (existingItem) {
            // Address exists, update the nonce field
            existingItem.nonce = nonce;
            yield existingItem.save();
        }
        else {
            // Address does not exist, add a new item
            yield Nonce_1.default.create({ address, nonce });
        }
        return { success: true };
    }
    catch (error) {
        Log_1.default.error(`NonceService :: Error adding nonce: ${error}`);
        return { success: false };
    }
});
exports.addNonce = addNonce;
const getNonce = (address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield Nonce_1.default.findOne({ address }).select('nonce');
        if (item) {
            return { success: true, data: item };
        }
        else {
            return { success: false, error: 'Not exist' };
        }
    }
    catch (error) {
        Log_1.default.error(`NonceService :: Error getting nonce: ${error}`);
        return { success: false };
    }
});
exports.getNonce = getNonce;
