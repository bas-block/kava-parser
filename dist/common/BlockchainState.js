"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LastParsedBlockModel_1 = require("../models/LastParsedBlockModel");
const Sdk_1 = require("../services/Sdk");
class BlockchainState {
    getState() {
        return BlockchainState.getBlockState().then(([blockInChain, blockInDb]) => {
            if (!blockInDb) {
                return new LastParsedBlockModel_1.LastParsedBlock({
                    lastBlock: blockInChain,
                    lastParsedBlock: 0
                }).save();
            }
            if (blockInDb.lastBlock < blockInChain) {
                blockInDb.lastBlock = blockInChain;
            }
            return blockInDb.save();
        });
    }
    static getBlockState() {
        const latestBlockOnChain = Sdk_1.Sdk.getLastBlock();
        const latestBlockInDB = LastParsedBlockModel_1.LastParsedBlock.findOne();
        return Promise.all([latestBlockOnChain, latestBlockInDB]);
    }
}
exports.BlockchainState = BlockchainState;
//# sourceMappingURL=BlockchainState.js.map