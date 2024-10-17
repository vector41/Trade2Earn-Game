"use strict";
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
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const Locals_1 = __importDefault(require("../../providers/Locals"));
const Log_1 = __importDefault(require("./Log"));
const User_1 = __importDefault(require("../../models/User"));
class AuthJwtToken {
    static authorization(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            // Get the auth token from the request headers
            const token = req.headers.authorization;
            // Check if token is present
            if (!token) {
                // Token is missing, send response asking for login
                return res
                    .status(401)
                    .json({ message: 'Unauthorized. Please log in.' });
            }
            try {
                // Convert JWT token to user object
                const user = yield AuthJwtToken.jwtToken2User(token);
                // Attach the decoded user information to the request object
                req.body.user = user;
                next();
            }
            catch (error) {
                if (error instanceof Error) {
                    Log_1.default.error(`Auth :: verify jwt token: ${error.message}`);
                    return res.status(500).json({ message: error.message });
                }
                else {
                    return res
                        .status(500)
                        .json({ message: 'Internal server error' });
                }
            }
        });
    }
    static isAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user } = req.body;
            if (user.Role === 'admin')
                next();
            else
                return res.status(401).json({ message: 'Admin role is required!' });
        });
    }
    static jwtToken2User(token) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                // Verify the token
                jsonwebtoken_1.default.verify(token.split(' ')[1], Locals_1.default.config().secretKey, (err, decoded) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        if (err instanceof jsonwebtoken_1.TokenExpiredError) {
                            // Token has expired
                            return reject(new Error('Token has expired'));
                        }
                        // Invalid token
                        return reject(new Error('Invalid token'));
                    }
                    // Token is valid, but let's also check if it's expired
                    const { exp, userId } = decoded;
                    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
                    if (currentTime > exp) {
                        // Token has expired, send response asking for login
                        return reject(new Error('Token has expired. Please log in again.'));
                    }
                    try {
                        // Fetch user data from the database using the userId stored in the token
                        const user = yield User_1.default.findById(userId);
                        if (!user) {
                            return reject(new Error('User not found'));
                        }
                        resolve(user);
                    }
                    catch (error) {
                        reject(error);
                    }
                }));
            });
        });
    }
}
exports.default = AuthJwtToken;
