const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const Schema = mongoose.Schema;

/**
 * Model for a single validator.
 *
 * @type {"mongoose".Schema}
 */
const validatorSchema = new Schema(
  {
    address: {
      type: String,
      index: true
    },
    details: {
      operatorAddress: {
        type: String,
        required: true
      },
      delegatorAddress: {
        type: String,
        required: true
      },
      consensusPubkey: {
        type: String,
        required: true
      },
      jailed: {
        type: Boolean,
        required: true,
        default: false
      },
      status: {
        type: String
      },
      description: {
        moniker: {
          type: String,
          required: true
        },
        identity: {
          type: String
        },
        website: {
          type: String
        },
        security_contact: {
          type: String
        },
        details: {
          type: String
        }
      },
      commission: {
        rate: {
          type: String
        },
        maxRate: {
          type: String
        },
        maxChangeRate: {
          type: String
        }
      }
    }
  },
  {
    versionKey: false
  }
);

// indices
validatorSchema.index({ address: 1 }, { name: "validatorAddressIndex" });

validatorSchema.plugin(mongoosePaginate);

export const Validator = mongoose.model("Validator", validatorSchema);
