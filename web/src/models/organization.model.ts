import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMember {
  memberId: string | mongoose.Types.ObjectId;
  name?: string;
}

export interface IStreamRef {
  streamId: string | mongoose.Types.ObjectId;
}

// Deprecated legacy alias for streams
export interface IDepartment {
  departmentId?: string | mongoose.Types.ObjectId;
  streamId?: string | mongoose.Types.ObjectId;
  departmentName?: string;
  head?: string;
}

export interface IProject {
  projectId: string | mongoose.Types.ObjectId;
  name?: string;
  lead?: string;
}

export interface IOrganization extends Document {
  ownerId: mongoose.Types.ObjectId | string;
  members: IMember[];
  streams: IStreamRef[];
  departments?: (IStreamRef | IDepartment)[]; // Legacy alias
  projects: IProject[];
  organizationName: string;
  gstNo: string;
  establishedYear: number;
  teamSize: number;
  arr: number;
  mrr: number;
  employees?: unknown[]; // Deprecated, removed from schema
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { _id: false }
);

const StreamRefSchema = new Schema<IStreamRef>(
  {
    streamId: {
      type: Schema.Types.ObjectId,
      ref: "Stream",
      required: true,
    },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Stream",
      required: true,
    },
  },
  { _id: false }
);

const OrganizationSchema = new Schema<IOrganization>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner ID is required"],
    },
    members: {
      type: [MemberSchema],
      default: [],
    },
    streams: {
      type: [StreamRefSchema],
      default: [],
    },
    projects: {
      type: [ProjectSchema],
      default: [],
    },
    organizationName: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
    },
    gstNo: {
      type: String,
      required: [true, "GST number is required"],
      trim: true,
      uppercase: true,
    },
    establishedYear: {
      type: Number,
      required: [true, "Established year is required"],
    },
    teamSize: {
      type: Number,
      default: 1,
    },
    arr: {
      type: Number,
      default: 0,
    },
    mrr: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

// Prevent model recompilation in Next.js hot-reload environment and ensure schema updates
if (
  mongoose.models.Organization &&
  (!mongoose.models.Organization.schema.paths["streams"] ||
    mongoose.models.Organization.schema.paths["employees"])
) {
  delete (mongoose.models as Record<string, unknown>).Organization;
}

const OrganizationModel: Model<IOrganization> =
  (mongoose.models.Organization as Model<IOrganization>) ||
  mongoose.model<IOrganization>("Organization", OrganizationSchema);

export { OrganizationModel };
export default OrganizationModel;
