"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BlockModel_1 = require("../models/BlockModel");
class BlockParser {
    parseBlocks(blocks) {
        if (blocks.length === 0)
            return Promise.resolve();
        const extractedBlocks = blocks.flatMap((block) => {
            return new BlockModel_1.Block(this.extractBlockData(block));
        });
        const bulkBlocks = BlockModel_1.Block.collection.initializeUnorderedBulkOp();
        extractedBlocks.forEach((block) => {
            bulkBlocks
                .find({ height: block.height })
                .upsert()
                .replaceOne(block);
        });
        if (bulkBlocks.length === 0)
            return Promise.resolve();
        return bulkBlocks.execute().then((bulkResult) => {
            return Promise.resolve(extractedBlocks);
        });
    }
    extractBlockData(block) {
        return {
            height: Number(block.block_meta.header.height),
            hash: String(block.block_meta.block_id.hash),
            time: block.block_meta.header.time,
            num_txs: Number(block.block_meta.header.num_txs),
            proposer: String(block.block_meta.header.proposer_address)
        };
    }
}
exports.BlockParser = BlockParser;
//# sourceMappingURL=BlockParser.js.map