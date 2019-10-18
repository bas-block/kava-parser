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
const BlockchainState_1 = require("./BlockchainState");
const LastParsedBlockModel_1 = require("../models/LastParsedBlockModel");
const BlockParser_1 = require("./BlockParser");
const ValidatorParser_1 = require("./ValidatorParser");
const TransactionParser_1 = require("./TransactionParser");
const MessageParser_1 = require("./MessageParser");
const AccountParser_1 = require("./AccountParser");
const Sdk_1 = require("../services/Sdk");
const Utils_1 = require("./Utils");
const config = require("config");
class BlockchainParser {
    constructor() {
        this.maxConcurrentBlocks = parseInt(config.get("PARSER.MAX_CONCURRENT_BLOCKS")) || 2;
        this.forwardParsedDelay = parseInt(config.get("PARSER.DELAYS.FORWARD")) || 100;
        this.blockParser = new BlockParser_1.BlockParser();
        this.validatorParser = new ValidatorParser_1.ValidatorParser();
        this.transactionParser = new TransactionParser_1.TransactionParser();
        this.messageParser = new MessageParser_1.MessageParser();
        this.accountParser = new AccountParser_1.AccountParser();
    }
    start() {
        this.startForwardParsing();
    }
    startForwardParsing() {
        return BlockchainState_1.BlockchainState.getBlockState()
            .then(([blockInChain, blockInDb]) => __awaiter(this, void 0, void 0, function* () {
            const startBlock = blockInDb.lastParsedBlock;
            const nextBlock = startBlock + 1;
            if (startBlock === 0) {
                yield this.accountParser.parseGenesisAccounts();
                winston.info("Genesis parsed successfully!");
            }
            if (nextBlock <= blockInChain) {
                winston.info(`Forward ==> parsing blocks range ${nextBlock} - ${blockInChain}. Difference ${blockInChain -
                    startBlock}`);
                const lastBlock = blockInChain;
                this.parse(nextBlock, blockInChain, true)
                    .then((endBlock) => {
                    return this.saveLastParsedBlock(endBlock, blockInChain);
                })
                    .then((saved) => {
                    this.scheduleForwardParsing(this.forwardParsedDelay);
                })
                    .catch((err) => {
                    winston.error(`Forward parsing failed for blocks ${nextBlock} to ${lastBlock} with error: ${err}. \nRestarting parsing for those blocks...`);
                    this.scheduleForwardParsing();
                });
            }
            else {
                winston.info("Last block is parsed on the blockchain, waiting for new blocks");
                this.scheduleForwardParsing();
            }
        }))
            .catch((err) => {
            winston.error("Failed to load initial block state in startForwardParsing: " + err);
            this.scheduleForwardParsing();
        });
    }
    scheduleForwardParsing(delay = 1000) {
        Utils_1.setDelay(delay).then(() => {
            this.startForwardParsing();
        });
    }
    getBlocksRange(start, end) {
        return Array.from(Array(end - start + 1).keys()).map((i) => i + start);
    }
    getBlocksToParse(startBlock, endBlock, concurrentBlocks) {
        const blocksDiff = endBlock - startBlock;
        return endBlock - startBlock <= 0
            ? 1
            : blocksDiff > concurrentBlocks
                ? concurrentBlocks
                : blocksDiff;
    }
    getNumberBlocks(startBlock, lastBlock, ascending) {
        const blocksToProcess = this.getBlocksToParse(startBlock, lastBlock, this.maxConcurrentBlocks);
        const startBlockRange = ascending
            ? startBlock
            : Math.max(startBlock - blocksToProcess + 1, 0);
        const endBlockRange = startBlockRange + blocksToProcess - 1;
        const numberBlocks = this.getBlocksRange(startBlockRange, endBlockRange);
        return numberBlocks;
    }
    parse(startBlock, lastBlock, ascending = true) {
        if (startBlock % 20 === 0) {
            winston.info(`Currently processing blocks range ${startBlock} - ${lastBlock} in ascending ${ascending} mode`);
        }
        const numberBlocks = this.getNumberBlocks(startBlock, lastBlock, ascending);
        const promises = numberBlocks.map((number, i) => {
            winston.info(`${ascending ? `Forward` : `Backward`} processing block ${ascending ? number : numberBlocks[i]}`);
            return Sdk_1.Sdk.getBlock(number);
        });
        return (Promise.all(promises)
            .then((blocks) => {
            const hasNullBlocks = blocks.filter((block) => block === null);
            if (hasNullBlocks.length > 0) {
                return Promise.reject("Has null blocks. Wait for RPC to build a block");
            }
            this.blockParser.parseBlocks(blocks);
            return blocks;
        })
            .then((blocks) => {
            return this.transactionParser.parseTransactions(this.flatBlocksWithMissingTransactions(blocks));
        })
            // .then((transactions: any) => {
            //   return this.accountParser.parseSigners(transactions);
            // })
            // .then((transactions: any) => {
            //   return this.messageParser.parseMessages(transactions);
            // })
            // .then((transactions: any) => {
            //   //return this.coinParser.parseCoins(transactions);
            // })
            .then(() => {
            const endBlock = ascending
                ? numberBlocks[numberBlocks.length - 1]
                : numberBlocks[0];
            return endBlock
                ? Promise.resolve(endBlock)
                : Promise.reject(endBlock);
        }));
    }
    saveLastParsedBlock(block, lastBlock) {
        return LastParsedBlockModel_1.LastParsedBlock.findOneAndUpdate({}, { lastParsedBlock: block, lastBlock: lastBlock }, { upsert: true, new: true }).catch((err) => {
            winston.error(`Could not save last parsed block to DB with error: ${err}`);
        });
    }
    flatBlocksWithMissingTransactions(blocks) {
        return blocks
            .map((block) => block !== null && block.block.data.txs !== null ? [block] : [])
            .reduce((a, b) => a.concat(b), []);
    }
}
exports.BlockchainParser = BlockchainParser;
//# sourceMappingURL=BlockchainParser.js.map