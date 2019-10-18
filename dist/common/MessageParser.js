"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
const MessageModel_1 = require("../models/MessageModel");
const TransactionModel_1 = require("../models/TransactionModel");
const ValidatorModel_1 = require("../models/ValidatorModel");
class MessageParser {
    parseMessages(transactions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof transactions === "undefined")
                return Promise.resolve();
            if (transactions.length === 0)
                return Promise.resolve();
            transactions.forEach((transaction) => {
                const messages = transaction.msgs;
                if (messages.length === 0)
                    return Promise.resolve();
                messages.forEach((message) => {
                    MessageModel_1.Message.findOneAndUpdate({ tx_hash: transaction.hash }, message, {
                        upsert: true,
                        new: true
                    })
                        .then((message) => __awaiter(this, void 0, void 0, function* () {
                        if (message.type === "cosmos-sdk/MsgDelegate") {
                            try {
                                const validator = yield ValidatorModel_1.Validator.findOneAndUpdate({
                                    "details.delegatorAddress": message.value.delegator_address
                                }, {
                                    $inc: {
                                        "details.selfDelegated": parseFloat(message.value.amount.amount)
                                    }
                                }).exec();
                            }
                            catch (error) {
                                winston.error(`Could not update message to validator shares with error: ${error}`);
                            }
                        }
                        if (message.type === "cosmos-sdk/MsgUndelegate") {
                            try {
                                const validator = yield ValidatorModel_1.Validator.findOneAndUpdate({
                                    "details.delegatorAddress": message.value.delegator_address
                                }, {
                                    $inc: {
                                        "details.selfDelegated": -parseFloat(message.value.amount.amount)
                                    }
                                }).exec();
                                console.log(validator);
                            }
                            catch (error) {
                                winston.error(`Could not update message to validator shares with error: ${error}`);
                            }
                        }
                        return TransactionModel_1.Transaction.findOneAndUpdate({ hash: transaction.hash }, { $push: { msgs: message._id } }).catch((error) => {
                            winston.error(`Could not update message to transaction hash ${transaction.hash} with error: ${error}`);
                        });
                    }))
                        .catch((error) => {
                        winston.error(`Could not save message with error: ${error}`);
                    });
                });
                winston.info("Processed " + messages.length + " messages.");
            });
            return Promise.resolve(transactions);
        });
    }
}
exports.MessageParser = MessageParser;
//# sourceMappingURL=MessageParser.js.map