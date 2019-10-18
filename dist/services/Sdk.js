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
const axios_1 = require("axios");
const bech32 = require("bech32");
const CryptoJS = require("crypto-js");
const config = require("config");
class Sdk {
    static bech32ify(address, prefix) {
        const words = bech32.toWords(Buffer.from(address, "hex"));
        return bech32.encode(prefix, words);
    }
    static getGenesis() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield axios_1.default.get(`${config.get("RPC")}/genesis`).then(response => {
                return response.data.result.genesis;
            });
        });
    }
    static getLastBlock() {
        return axios_1.default.get(config.get("RPC") + "/status").then(response => {
            return parseInt(response.data.result.sync_info.latest_block_height);
        });
    }
    static getValidators(blockHeight) {
        return __awaiter(this, void 0, void 0, function* () {
            const validators = yield axios_1.default
                .get(`${config.get("RPC")}/validators?height=${blockHeight}`)
                .then(res => JSON.parse(JSON.stringify(res.data.result)));
            return validators;
        });
    }
    static getValidatorSet() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all([
                axios_1.default.get(`${config.get("LCD")}/staking/validators`),
                axios_1.default.get(`${config.get("LCD")}/staking/validators?status=unbonded`),
                axios_1.default.get(`${config.get("LCD")}/staking/validators?status=unbonding`)
            ]).then(validatorGroups => [].concat(...validatorGroups[0].data.result, ...validatorGroups[1].data.result, ...validatorGroups[2].data.result));
        });
    }
    static getBalances(address) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all([
                axios_1.default.get(`${config.get("LCD")}/bank/balances/${address}`),
                axios_1.default.get(`${config.get("LCD")}/staking/delegators/${address}/delegations`),
                axios_1.default.get(`${config.get("LCD")}/staking/delegators/${address}/unbonding_delegations`),
                axios_1.default.get(`${config.get("LCD")}/distribution/delegators/${address}/rewards`)
            ]).then(balances => {
                let available_balance = 0;
                if (balances[0].data.result[0]) {
                    available_balance = parseFloat(balances[0].data.result[0].amount);
                }
                let delegations_balance = 0;
                const delegations = balances[1].data.result;
                delegations.forEach(delegation => {
                    delegations_balance += parseFloat(delegation.balance.amount);
                });
                let unbondig_balance = 0;
                const unbongings = balances[2].data.result;
                unbongings.forEach(unbondig_balance => {
                    unbondig_balance += parseFloat(unbondig_balance.balance.amount);
                });
                let rewards_balance = 0;
                if (balances[3].data.result.total !== null) {
                    if (balances[3].data.result.total.length > 0) {
                        rewards_balance = parseFloat(balances[3].data.result.total[0].amount);
                    }
                }
                const total_balance = available_balance +
                    delegations_balance +
                    unbondig_balance +
                    rewards_balance;
                return {
                    available: available_balance,
                    delegations: delegations_balance,
                    unbonding: unbondig_balance,
                    rewards: rewards_balance,
                    commissions: 0,
                    total: total_balance
                };
            });
        });
    }
    static getBlock(blockId) {
        return axios_1.default
            .get(config.get("RPC") + "/block?height=" + blockId)
            .then(response => {
            return response.data.result;
        });
    }
    static getTxsByBlock(blockId) {
        return axios_1.default
            .get(config.get("RPC") + '/tx_search?query="tx.height=' + blockId + '"')
            .then(response => {
            return response.data.result.txs;
        });
    }
    static getTxByHash(hash) {
        return axios_1.default.get(config.get("LCD") + "/txs/" + hash).then(response => {
            return response.data;
        });
    }
}
Sdk.pubkeyUserToBech32 = (pubkey, prefix) => {
    const message = CryptoJS.enc.Hex.parse(Buffer.from(pubkey, "base64").toString("hex"));
    const address = CryptoJS.RIPEMD160(CryptoJS.SHA256(message)).toString();
    return Sdk.bech32ify(address, prefix);
};
exports.Sdk = Sdk;
//# sourceMappingURL=Sdk.js.map