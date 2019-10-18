"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const Schema = mongoose.Schema;
/**
 * Model for a single validator.
 *
 * @type {"mongoose".Schema}
 */
const validatorUptimeSchema = new Schema({
    address: {
        type: String,
        required: true
    },
    misses: {
        type: Number,
        required: true,
        default: 0
    },
    period: {
        type: Number,
        required: true,
        default: 0
    }
});
exports.ValidatorUptime = mongoose.model("ValidatorUptime", validatorUptimeSchema);
//# sourceMappingURL=ValidatorUptimeModel.js.map