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
const bech32 = require("bech32");
const axios_1 = require("axios");
const ValidatorModel_1 = require("../models/ValidatorModel");
const AccountModel_1 = require("../models/AccountModel");
const Sdk_1 = require("../services/Sdk");
const js_sha256_1 = require("js-sha256");
const config = require("config");
class ValidatorParser {
    pubkeyToBech32(pubkey, prefix) {
        // '1624DE6420' is ed25519 pubkey prefix
        let pubkeyAminoPrefix = Buffer.from("1624DE6420", "hex");
        let buffer = Buffer.alloc(37);
        pubkeyAminoPrefix.copy(buffer, 0);
        Buffer.from(pubkey.value, "base64").copy(buffer, pubkeyAminoPrefix.length);
        return bech32.encode(prefix, bech32.toWords(buffer));
    }
    bech32PubkeyToAddress(pubkey) {
        // '1624DE6420' is ed25519 pubkey prefix
        let pubkeyAminoPrefix = Buffer.from("1624DE6420", "hex");
        let buffer = Buffer.from(bech32.fromWords(bech32.decode(pubkey).words));
        let test = buffer.slice(pubkeyAminoPrefix.length).toString("base64");
        return js_sha256_1.sha256(Buffer.from(test, "base64"))
            .substring(0, 40)
            .toUpperCase();
    }
    bech32ToPubKey(pubkey) {
        // '1624DE6420' is ed25519 pubkey prefix
        let pubkeyAminoPrefix = Buffer.from("1624DE6420", "hex");
        let buffer = Buffer.from(bech32.fromWords(bech32.decode(pubkey).words));
        return buffer.slice(pubkeyAminoPrefix.length).toString("base64");
    }
    getDelegatorAddress(operatorAddr, prefix) {
        const address = bech32.decode(operatorAddr);
        return bech32.encode(prefix, address.words);
    }
    getValidatorProfileUrl(identity) {
        if (identity.length == 16) {
            return axios_1.default
                .get(`https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${identity}&fields=pictures`)
                .then(response => {
                if (response.status === 200) {
                    let them = response.data.them;
                    return (them &&
                        them.length &&
                        them[0].pictures &&
                        them[0].pictures.primary &&
                        them[0].pictures.primary.url);
                }
            });
        }
        return null;
    }
    parseBlock(block) {
        return __awaiter(this, void 0, void 0, function* () {
            if (block < 1)
                return Promise.resolve();
            try {
                const bulkValidators = ValidatorModel_1.Validator.collection.initializeUnorderedBulkOp();
                const bulkAccounts = AccountModel_1.Account.collection.initializeUnorderedBulkOp();
                const validatorList = yield Sdk_1.Sdk.getValidators(block);
                // if (
                //   block %
                //     parseInt(config.get("PARSER.FORCE_BALANCE_UPDATES_EACH_BLOCKS")) ===
                //   0
                // ) {
                //   const lte_height =
                //     block -
                //     parseInt(config.get("PARSER.FORCE_BALANCE_UPDATES_EACH_BLOCKS"));
                //   const accounts = await Account.find({
                //     "balances.height": { $lte: lte_height }
                //   });
                //   for (const account of accounts) {
                //     let balances = await Sdk.getBalances(account.address);
                //     balances.height = parseInt(block);
                //     bulkAccounts
                //       .find({ address: account.address })
                //       .updateOne({ $set: { balances: balances } });
                //   }
                //   if (bulkAccounts.length > 0) {
                //     await bulkAccounts.execute();
                //     winston.info(`Updated ${bulkAccounts.length} balances.`);
                //   }
                // }
                for (var i in validatorList.validators) {
                    validatorList.validators[i].pub_key.bech32 = this.pubkeyToBech32(validatorList.validators[i].pub_key, config.get("bech32PrefixConsPub"));
                }
                const validatorSet = yield Sdk_1.Sdk.getValidatorSet();
                for (const validatorRawData of validatorSet) {
                    const validatorRaw = validatorList.validators.find(v => v.pub_key.bech32 === validatorRawData.consensus_pubkey);
                    const validator = this.extractValidatorData(validatorRaw, validatorRawData);
                    if (block % parseInt(config.get("PARSER.UPDATE_VALIDATOR_PIC_DELAY")) ===
                        0) {
                        if (validator.details.description.identity) {
                            winston.info("Processing profile url validators");
                            const profileurl = yield this.getValidatorProfileUrl(validator.details.description.identity);
                            bulkValidators
                                .find({
                                "details.consensusPubkey": validator.details.consensusPubkey
                            })
                                .updateOne({
                                $set: { "details.description.profile_url": profileurl }
                            });
                        }
                    }
                    bulkValidators
                        .find({
                        "details.consensusPubkey": validator.details.consensusPubkey
                    })
                        .upsert()
                        .updateOne({
                        $set: {
                            address: validator.address,
                            voting_power: validator.voting_power,
                            proposer_priority: validator.proposer_priority,
                            "details.operatorAddress": validator.details.operatorAddress,
                            "details.delegatorAddress": validator.details.delegatorAddress,
                            "details.consensusPubkey": validator.details.consensusPubkey,
                            "details.jailed": validator.details.jailed,
                            "details.status": validator.details.status,
                            "details.tokens": validator.details.tokens,
                            "details.delegatorShares": validator.details.delegatorShares,
                            "details.description.moniker": validator.details.description.moniker,
                            "details.description.identity": validator.details.description.identity,
                            "details.description.website": validator.details.description.website,
                            "details.description.details": validator.details.description.details,
                            "details.commission.rate": validator.details.commission.rate,
                            "details.commission.maxRate": validator.details.commission.maxRate,
                            "details.commission.maxChangeRate": validator.details.commission.maxChangeRate,
                            "details.commission.updateTime": validator.details.commission.updateTime
                        }
                    });
                }
                if (bulkValidators.length === 0)
                    return Promise.reject(`error in validators`);
                return yield bulkValidators.execute();
            }
            catch (err) {
                throw err;
            }
        });
    }
    extractValidatorData(validatorRaw, validatorData) {
        return {
            address: typeof validatorRaw !== "undefined"
                ? validatorRaw.address
                : this.bech32PubkeyToAddress(validatorData.consensus_pubkey),
            voting_power: typeof validatorRaw !== "undefined"
                ? parseInt(validatorRaw.voting_power)
                : 0,
            proposer_priority: typeof validatorRaw !== "undefined"
                ? parseInt(validatorRaw.proposer_priority)
                : 0,
            details: {
                operatorAddress: validatorData.operator_address,
                delegatorAddress: this.getDelegatorAddress(validatorData.operator_address, config.get("bech32PrefixAccAddr")),
                consensusPubkey: validatorData.consensus_pubkey,
                jailed: validatorData.jailed,
                status: validatorData.status,
                tokens: validatorData.tokens,
                delegatorShares: validatorData.delegator_shares,
                description: {
                    moniker: validatorData.description.moniker,
                    identity: validatorData.description.identity,
                    website: validatorData.description.website,
                    details: validatorData.description.details
                },
                commission: {
                    rate: validatorData.commission.commission_rates.rate,
                    maxRate: validatorData.commission.commission_rates.max_rate,
                    maxChangeRate: validatorData.commission.commission_rates.max_change_rate,
                    updateTime: validatorData.commission.update_time
                }
            }
        };
    }
    parseValidators(blocks) {
        return __awaiter(this, void 0, void 0, function* () {
            if (blocks.length === 0)
                return Promise.resolve();
            const promises = blocks.map((block, i) => {
                const blockHeight = block.block.header.height;
                return this.parseBlock(blockHeight);
            });
            return Promise.all(promises).then((res) => {
                return blocks;
            });
        });
    }
}
exports.ValidatorParser = ValidatorParser;
//# sourceMappingURL=ValidatorParser.js.map