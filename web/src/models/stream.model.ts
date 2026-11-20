import mongoose, { Document, Model, Schema } from "mongoose";

export type StreamType = "project" | "department" | "empTracker";

export interface IStreamMember {
  memberId: string | mongoose.Types.ObjectId;
  memberName?: string;
  assigneeId?: string | mongoose.Types.ObjectId;
  assigneeName?: string;
}

export interface ISubStream {
  streamId: string | mongoose.Types.ObjectId;
  streamName?: string;
  creatorId?: string | mongoose.Types.ObjectId;
  creatorName?: string;
}

export interface IParentStream {
  parentStreamId: string | mongoose.Types.ObjectId;
  parentStreamName?: string;
}

export interface IStreamCreator {
  userId: string | mongoose.Types.ObjectId;
  name?: string;
}

export interface IStreamManager {
  id: string | mongoose.Types.ObjectId;
  name?: string;
}

export interface IStreamLead {
  id: string | mongoose.Types.ObjectId;
  name?: string;
}

export interface IStream extends Document {
  name: string;
  type: StreamType;
  creator: IStreamCreator[];
  members: IStreamMember[];
  substream: ISubStream[];
  description?: string;
  manager: IStreamManager[];
  lead: IStreamLead[];
  parentStream: IParentStream[];
  organisationId: mongoose.Types.ObjectId | string;
  organisationName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StreamMemberSchema = new Schema<IStreamMember>(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: false }
);

const SubStreamSchema = new Schema<ISubStream>(
  {
    streamId: {
      type: Schema.Types.ObjectId,
      ref: "Stream",
      required: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { _id: false }
);

const ParentStreamSchema = new Schema<IParentStream>(
  {
    parentStreamId: {
      type: Schema.Types.ObjectId,
      ref: "Stream",
      required: true,
    },
  },
  { _id: false }
);

const StreamCreatorSchema = new Schema<IStreamCreator>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { _id: false }
);

const StreamManagerSchema = new Schema<IStreamManager>(
  {
    id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { _id: false }
);

const StreamLeadSchema = new Schema<IStreamLead>(
  {
    id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { _id: false }
);

const StreamSchema = new Schema<IStream>(
  {
    name: {
      type: String,
      required: [true, "Stream name is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["project", "department", "empTracker"],
      required: [true, "Stream type is required"],
    },
    creator: {
      type: [StreamCreatorSchema],
      default: [],
    },
    members: {
      type: [StreamMemberSchema],
      default: [],
    },
    substream: {
      type: [SubStreamSchema],
      default: [],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    manager: {
      type: [StreamManagerSchema],
      default: [],
    },
    lead: {
      type: [StreamLeadSchema],
      default: [],
    },
    parentStream: {
      type: [ParentStreamSchema],
      default: [],
    },
    organisationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organisation ID is required"],
      index: true,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

// Prevent model recompilation in Next.js hot-reload environment and ensure schema updates
if (
  mongoose.models.Stream &&
  mongoose.models.Stream.schema.paths["organisationName"]
) {
  delete (mongoose.models as Record<string, unknown>).Stream;
}

const StreamModel: Model<IStream> =
  (mongoose.models.Stream as Model<IStream>) ||
  mongoose.model<IStream>("Stream", StreamSchema);

export { StreamModel };
export default StreamModel;
