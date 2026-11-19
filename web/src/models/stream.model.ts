import mongoose, { Document, Model, Schema } from "mongoose";

export type StreamType = "project" | "department" | "empTracker";

export interface IStreamMember {
  memberId: string;
  memberName: string;
  assigneeId?: string;
  assigneeName?: string;
}

export interface ISubStream {
  streamId: string;
  streamName: string;
  creatorId?: string;
  creatorName?: string;
}

export interface IParentStream {
  parentStreamId: string;
  parentStreamName: string;
}

export interface IStreamCreator {
  userId: string;
  name: string;
}

export interface IStreamManager {
  id: string;
  name: string;
}

export interface IStreamLead {
  id: string;
  name: string;
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
  createdAt: Date;
  updatedAt: Date;
}

const StreamMemberSchema = new Schema<IStreamMember>(
  {
    memberId: {
      type: String,
      required: true,
      trim: true,
    },
    memberName: {
      type: String,
      required: true,
      trim: true,
    },
    assigneeId: {
      type: String,
      trim: true,
    },
    assigneeName: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const SubStreamSchema = new Schema<ISubStream>(
  {
    streamId: {
      type: String,
      required: true,
      trim: true,
    },
    streamName: {
      type: String,
      required: true,
      trim: true,
    },
    creatorId: {
      type: String,
      trim: true,
    },
    creatorName: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const ParentStreamSchema = new Schema<IParentStream>(
  {
    parentStreamId: {
      type: String,
      required: true,
      trim: true,
    },
    parentStreamName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const StreamCreatorSchema = new Schema<IStreamCreator>(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const StreamManagerSchema = new Schema<IStreamManager>(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const StreamLeadSchema = new Schema<IStreamLead>(
  {
    id: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in Next.js hot-reload environment
const StreamModel: Model<IStream> =
  (mongoose.models.Stream as Model<IStream>) ||
  mongoose.model<IStream>("Stream", StreamSchema);

export { StreamModel };
export default StreamModel;
