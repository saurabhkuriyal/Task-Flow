import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMember {
  memberId: string;
  name: string;
}

export interface IDepartment {
  departmentId: string;
  departmentName: string;
  head?: string;
}

export interface IProject {
  projectId: string;
  name: string;
  lead?: string;
}

export interface IEmployee {
  empId: string;
  name: string;
}

export interface IOrganization extends Document {
  ownerId: mongoose.Types.ObjectId | string;
  members: IMember[];
  departments: IDepartment[];
  projects: IProject[];
  organizationName: string;
  gstNo: string;
  establishedYear: number;
  teamSize: number;
  arr: number;
  mrr: number;
  employees: IEmployee[];
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    memberId: {
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

const DepartmentSchema = new Schema<IDepartment>(
  {
    departmentId: {
      type: String,
      required: true,
      trim: true,
    },
    departmentName: {
      type: String,
      required: true,
      trim: true,
    },
    head: {
      type: String,
      trim: true,
      default: "",
    },
    // project: {
    //   type: String,
    //   trim: true,
    //   default: "",
    // },
  },
  { _id: false }
);

const ProjectSchema = new Schema<IProject>(
  {
    projectId: {
      type: String,
      required: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    lead: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const EmployeeSchema = new Schema<IEmployee>(
  {
    empId: {
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

const OrganizationSchema = new Schema<IOrganization>(
  {
    ownerId: {
      type: Schema.Types.Mixed,
      required: [true, "Owner ID is required"],
    },
    members: {
      type: [MemberSchema],
      default: [],
    },
    departments: {
      type: [DepartmentSchema],
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
      // required: [true, "Team size is required"],
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
    employees: {
      type: [EmployeeSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in Next.js hot-reload environment
const OrganizationModel: Model<IOrganization> =
  (mongoose.models.Organization as Model<IOrganization>) ||
  mongoose.model<IOrganization>("Organization", OrganizationSchema);

export { OrganizationModel };
export default OrganizationModel;

