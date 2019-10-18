"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BlockchainParser_1 = require("./BlockchainParser");
const BlockchainState_1 = require("./BlockchainState");
const Utils_1 = require("./Utils");
const parser = new BlockchainParser_1.BlockchainParser();
const blockchainState = new BlockchainState_1.BlockchainState();
class ParseStarter {
    start() {
        blockchainState.getState().then(() => {
            this.startParsers();
        }).catch(() => {
            Utils_1.setDelay(5000).then(() => {
                this.start();
            });
        });
    }
    startParsers() {
        parser.start();
    }
}
exports.ParseStarter = ParseStarter;
//# sourceMappingURL=ParseStarter.js.map