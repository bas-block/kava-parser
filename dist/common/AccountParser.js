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
const AccountModel_1 = require("../models/AccountModel");
const Sdk_1 = require("../services/Sdk");
class AccountParser {
    parseGenesisAccounts() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const genesis = yield Sdk_1.Sdk.getGenesis();
                const accounts = genesis.app_state.accounts.map((account) => {
                    return {
                        address: account.address,
                        coins: account.coins
                    };
                });
                // const gentxs = genesis.app_state.genutil.gentxs.map((gentx: any) => {
                //   if (gentx.value.msg[0].type === "cosmos-sdk/MsgCreateValidator") {
                //     return {
                //       address: gentx.value.msg[0].value.delegator_address,
                //       consensusPubkey: gentx.value.msg[0].value.pubkey,
                //       coins: gentx.value.msg[0].value.value
                //     };
                //   }
                // });
                for (let account of accounts) {
                    //   const balances = {
                    //     available: parseFloat(account.coins[0].amount),
                    //     delegations: 0,
                    //     unbonding: 0,
                    //     rewards: 0,
                    //     commissions: 0,
                    //     total: parseFloat(account.coins[0].amount),
                    //     height: 0
                    //   };
                    //   const gentx = gentxs.filter(v => v.address === account.address);
                    //   if (gentx.length > 0) {
                    //     balances.available -= parseFloat(gentx[0].coins.amount);
                    //     balances.delegations += parseFloat(gentx[0].coins.amount);
                    //     await Validator.findOneAndUpdate(
                    //       {
                    //         "details.consensusPubkey": gentx[0].consensusPubkey
                    //       },
                    //       {
                    //         $inc: {
                    //           "details.selfDelegated": parseFloat(gentx[0].coins.amount)
                    //         }
                    //       },
                    //       { upsert: true }
                    //     ).exec();
                    //   }
                    yield AccountModel_1.Account.findOneAndUpdate({ address: account.address }, { $set: { address: account.address } }, { upsert: true, new: true }).exec();
                }
                winston.info("Processed " + accounts.length + " accounts from genesis.");
            }
            catch (error) {
                winston.error(`Could not parse genesis accounts with error: ${error}`);
            }
        });
    }
    parseSigners(transactions) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof transactions === "undefined")
                return Promise.resolve();
            if (transactions.length === 0)
                return Promise.resolve();
            for (const transaction of transactions) {
                const signatures = transaction.signatures;
                if (signatures.length === 0)
                    return Promise.resolve();
                for (const signature of signatures) {
                    return yield AccountModel_1.Account.findOneAndUpdate({ address: signature }, { $set: { address: signature } }, {
                        upsert: true,
                        new: true
                    });
                }
                winston.info("Processed " + signatures.length + " signers.");
            }
            return Promise.resolve(transactions);
        });
    }
}
exports.AccountParser = AccountParser;
//# sourceMappingURL=AccountParser.js.map