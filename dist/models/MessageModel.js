"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const Schema = mongoose.Schema;
/**
 * Model for a single message.
 *
 * @type {"mongoose".Schema}
 */
const messageSchema = new Schema({
    tx_hash: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        index: true
    },
    value: {
        type: Object
    }
}, {
    id: false,
    versionKey: false,
    toObject: {
        virtuals: true
    },
    toJSON: {
        virtuals: true
    }
});
messageSchema.virtual("success").get(function () {
    if (this.hasOwnProperty("error")) {
        return this.error === "";
    }
});
messageSchema.plugin(mongoosePaginate);
exports.Message = mongoose.model("Message", messageSchema);
//# sourceMappingURL=MessageModel.js.map