import * as winston from "winston";
import { Block } from "../models/BlockModel";
import { IBlock } from "./CommonInterfaces";
import { Sdk } from "../services/Sdk";
import { Config } from "./Config";
import * as Bluebird from "bluebird";

const config = require("config");

export class BlockParser {
  public async parseBlocks(blocks: any) {
    if (blocks.length === 0) return Promise.resolve();

    const extractedBlocks = blocks.flatMap((block: any) => {
      return new Block(this.extractBlockData(block));
    });

    const bulkBlocks = Block.collection.initializeUnorderedBulkOp();

    extractedBlocks.forEach((block: IBlock) => {
      bulkBlocks
        .find({ height: block.height })
        .upsert()
        .replaceOne(block);
    });

    // Update missing validators
    for (const block of blocks) {
      if (block.block_meta.header.height > 1) {
        let activeValidators = await Sdk.getValidators(
          block.block_meta.header.height
        );
        const precommits = block.block.last_commit.precommits;

        activeValidators.validators.map(validator => {
          const precommit = precommits.find(
            p => p && p.validator_address === validator.address
          );
          if (precommit === undefined) {
            // height: block.block_meta.header.height
            // proposer:
            // missed_validator: validator.address
            console.log("address", validator.address);
            console.log("pub_key type", validator.pub_key.type);
            console.log("pub_key", validator.pub_key.value);

            // const valconspub = Sdk.pubkeyUserToBech32(
            //   validator.pub_key.value,
            //   config.get("bech32PrefixConsPub")
            // );

            const valconspub = Sdk.pubkeyToBech32(
              validator.pub_key,
              config.get("bech32PrefixConsPub")
            );

            console.log("valconspub", valconspub);

            /*const test1 = Sdk.operatorAddrToAccoutAddr(valconspub, "kava");
            const test2 = Sdk.operatorAddrToAccoutAddr(validator.address, "kava");
            console.log(test1);
            console.log(test2);*/
          }
        });

        // for (const validator of activeValidators) {
        //
        // }
      }
    }

    if (bulkBlocks.length === 0) return Promise.resolve();

    return bulkBlocks.execute().then((bulkResult: any) => {
      return Promise.resolve(extractedBlocks);
    });
  }

  extractBlockData(block: any) {
    return {
      height: Number(block.block_meta.header.height),
      hash: String(block.block_meta.block_id.hash),
      time: block.block_meta.header.time,
      num_txs: Number(block.block_meta.header.num_txs),
      proposer: String(block.block_meta.header.proposer_address)
    };
  }
}
