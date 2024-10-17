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
exports.FutureBTCChallengeController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const FutureBTCChallenge_1 = __importDefault(require("../../models/FutureBTCChallenge"));
const GlobalState_1 = require("../../providers/GlobalState");
const Balance_1 = __importDefault(require("../../models/Balance"));
class FutureBTCChallengeController {
    static futureBTCChallenge(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const { user, position } = req.body;
                const perPosition = 500;
                // Validate required fields
                if (position === undefined || position === null || typeof position !== 'number' || isNaN(position) || position <= 0) {
                    return res.status(400).json({ error: 'Position is required and must be a positive number.' });
                }
                // Find the BTCChallengePool document
                if (!GlobalState_1.GlobalState.nextChallengeRound) {
                    return res.status(404).json({ error: 'Next BTC Challenge Pool not found.' });
                }
                // Find the user's balance
                const userBalance = yield Balance_1.default.findOne({ User: user._id }).session(session);
                if (!userBalance || userBalance.Coin < perPosition) {
                    yield session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({ error: 'Insufficient coin balance.' });
                }
                // Reduce the user's balance by the specified amount
                const updatedBalance = yield Balance_1.default.findOneAndUpdate({ User: user._id, Coin: { $gte: perPosition } }, // Query condition to find the balance document for the user
                { $inc: { Coin: -perPosition } }, // Reduce the balance by the specified amount
                { new: true, session } // Return the updated document and use the session
                );
                // Create a new FutureBTCChallenge document
                const newPosition = new FutureBTCChallenge_1.default({
                    User: user._id,
                    Position: position,
                    BTCChallengePool: (_a = GlobalState_1.GlobalState.nextChallengeRound) === null || _a === void 0 ? void 0 : _a._id,
                });
                // Save the document to the database
                yield newPosition.save({ session });
                // Commit the transaction
                yield session.commitTransaction();
                session.endSession();
                // Respond with the saved document and updated balance
                return res.status(201).json({ coin: updatedBalance === null || updatedBalance === void 0 ? void 0 : updatedBalance.Coin, newPosition });
            }
            catch (error) {
                // Abort the transaction in case of error
                yield session.abortTransaction();
                session.endSession();
                console.error('Error occurred while creating future BTC challenge:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
        });
    }
    static getPositions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const populateOptions = { path: 'User', select: 'Username Avatar CountryCode' };
                const expiredPositions = GlobalState_1.GlobalState.lastExpredChallengeRound
                    ? yield FutureBTCChallenge_1.default.find({ BTCChallengePool: GlobalState_1.GlobalState.lastExpredChallengeRound._id }).populate(populateOptions)
                    : null;
                const livePositions = GlobalState_1.GlobalState.currentChallengeRound
                    ? yield FutureBTCChallenge_1.default.find({ BTCChallengePool: GlobalState_1.GlobalState.currentChallengeRound._id }).populate(populateOptions)
                    : null;
                const nextPositions = GlobalState_1.GlobalState.nextChallengeRound
                    ? yield FutureBTCChallenge_1.default.find({ BTCChallengePool: GlobalState_1.GlobalState.nextChallengeRound._id }).populate(populateOptions)
                    : null;
                console.log(nextPositions);
                return res.json({
                    expiredChallengeStatus: {
                        positions: expiredPositions,
                        status: GlobalState_1.GlobalState.lastExpredChallengeRound,
                    },
                    liveChallengeStatus: {
                        positions: livePositions,
                        status: GlobalState_1.GlobalState.currentChallengeRound,
                    },
                    nextChallengeStatus: {
                        positions: nextPositions,
                        status: GlobalState_1.GlobalState.nextChallengeRound,
                    }
                });
            }
            catch (error) {
                console.error("Error retrieving challenge positions:", error);
                return res.status(500).json({ error: "Internal server error" });
            }
        });
    }
}
exports.FutureBTCChallengeController = FutureBTCChallengeController;
