"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const lastParsedBlockSchema = new Schema({
    lastBlock: {
        type: Number,
        required: true
    },
    lastParsedBlock: {
        type: Number,
        default: 0
    }
}, {
    versionKey: false,
});
exports.LastParsedBlock = mongoose.model("LastParsedBlock", lastParsedBlockSchema);
//# sourceMappingURL=LastParsedBlockModel.js.map