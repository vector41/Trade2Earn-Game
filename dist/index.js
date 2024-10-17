"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Import the App class from './providers/App'
const App_1 = __importDefault(require("./providers/App"));
// import "./providers/Challenges"
// Call the loadServer method of the App class
App_1.default.loadServer();
