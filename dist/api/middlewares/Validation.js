"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.depositValidation = void 0;
const depositValidation = (req, res, next) => {
    const { chain } = req.body;
    if (!chain) {
        return res.status(400).json({ error: 'Chain is required' });
    }
    next();
};
exports.depositValidation = depositValidation;
