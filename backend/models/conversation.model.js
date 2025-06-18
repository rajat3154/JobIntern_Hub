import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
      {
            participants: {
                  type: [mongoose.Schema.Types.ObjectId],
                  required: true,
                  validate: [arrayLimit, "{PATH} must have exactly two participants"],
            },
            messages: [
                  {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Message",
                  },
            ],
      },
      { timestamps: true }
);

// Validator to ensure exactly two participants
function arrayLimit(val) {
      return val.length === 2;
}

// Compound unique index on ordered participants array to prevent duplicates
conversationSchema.index(
      { "participants.0": 1, "participants.1": 1 },
      { unique: true }
);

export const Conversation = mongoose.model("Conversation", conversationSchema);
