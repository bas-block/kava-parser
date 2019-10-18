"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const Schema = mongoose.Schema;
const accountSchema = new Schema({
    address: {
        type: String,
        required: true,
        index: true
    },
    balances: {
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
accountSchema.virtual("success").get(function () {
    if (this.hasOwnProperty("error")) {
        return this.error === "";
    }
});
accountSchema.plugin(mongoosePaginate);
exports.Account = mongoose.model("Account", accountSchema);
//# sourceMappingURL=AccountModel.js.map