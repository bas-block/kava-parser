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
const TransactionModel_1 = require("../models/TransactionModel");
const MessageModel_1 = require("../models/MessageModel");
const AccountModel_1 = require("../models/AccountModel");
const Sdk_1 = require("../services/Sdk");
const js_sha256_1 = require("js-sha256");
const util_1 = require("util");
const config = require("config");
class TransactionParser {
    extractHash(blocks) {
        return blocks.flatMap((block) => {
            return block.block.data.txs.flatMap((tx) => {
                return js_sha256_1.sha256(Buffer.from(tx, "base64")).toUpperCase();
            });
        });
    }
    extractTransactions(hashes) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all(hashes.map((hash) => __awaiter(this, void 0, void 0, function* () {
                return yield Sdk_1.Sdk.getTxByHash(hash).then((transaction) => {
                    return this.extractTransactionData(transaction);
                });
            })));
        });
    }
    parseMessages(transaction) {
        return __awaiter(this, void 0, void 0, function* () {
            const msgs = [];
            debugger;
            for (const msg of transaction.msgs) {
                const doc = new MessageModel_1.Message(Object.assign({}, msg, { tx_hash: transaction.hash }));
                yield doc.save();
                msgs.push(doc._id);
            }
            return msgs;
        });
    }
    parseTransactions(blocks) {
        return __awaiter(this, void 0, void 0, function* () {
            if (blocks.length === 0)
                return Promise.resolve();
            const bulkTransactions = TransactionModel_1.Transaction.collection.initializeUnorderedBulkOp();
            const extractedHashes = this.extractHash(blocks);
            const extractedTransactions = yield this.extractTransactions(extractedHashes);
            for (let transaction of extractedTransactions) {
                const signatures = transaction.signatures;
                transaction.signatures = [];
                for (const signature of signatures) {
                    const account = yield AccountModel_1.Account.findOneAndUpdate({ address: signature }, { $set: { address: signature } }, {
                        upsert: true,
                        new: true
                    });
                    debugger;
                    transaction.signatures.push(account._id);
                }
                const msgs = yield this.parseMessages(transaction);
                transaction.msgs = msgs;
                debugger;
                bulkTransactions
                    .find({ hash: transaction.hash })
                    .upsert()
                    .replaceOne(transaction);
            }
            if (bulkTransactions.length === 0)
                return Promise.resolve();
            return bulkTransactions.execute().then((bulkResult) => {
                winston.info("Processed " + extractedTransactions.length + " transactions.");
                return Promise.resolve(extractedTransactions);
            });
        });
    }
    extractTransactionData(transaction) {
        // TODO: add parser for MultiSig
        // { pub_key:
        //   { type: 'tendermint/PubKeyMultisigThreshold',
        //     value: { threshold: '2', pubkeys: [Array] } },
        //  signature:
        //   'CgUIAxIBwBJAaRfaaBTAj7nWR+WAO599B2/NzowdRUeATh+c7tiKqotxDs+GB8+aYME9LY2zo3igIiTujHKkXFBtpZl0I4mpbxJAdU55ivyI1Yb4t+kzJ7vXVXGeiHsJhCFkZVh3nwcKpdMtvK6aMhH42j0BZfGS/rvUTHGgzckkVbYgNo1lugeBeA==' }
        const signatures = transaction.tx.value.signatures.map((signature) => {
            // Multisig check
            if (signature.pub_key.type === "tendermint/PubKeyMultisigThreshold") {
                const keys = signature.pub_key.value.pubkeys.map((key) => {
                    return Sdk_1.Sdk.pubkeyUserToBech32(key.value, config.get("bech32PrefixAccAddr"));
                });
                return keys;
            }
            else {
                return Sdk_1.Sdk.pubkeyUserToBech32(signature.pub_key.value, config.get("bech32PrefixAccAddr"));
            }
        });
        return {
            hash: String(transaction.txhash),
            height: Number(transaction.height),
            status: transaction.logs ? Boolean(transaction.logs[0].success) : false,
            msgs: transaction.tx.value.msg,
            signatures: util_1.isArray(signatures[0]) ? signatures[0] : signatures,
            gas_wanted: Number(transaction.gas_wanted),
            gas_used: Number(transaction.gas_used),
            fee_amount: transaction.tx.value.fee.amount,
            time: String(transaction.timestamp)
        };
    }
}
exports.TransactionParser = TransactionParser;
//# sourceMappingURL=TransactionParser.js.map