import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICreatedOrganisation {
  createdOrganisationId: string;
  createdOrganisationName: string;
}

export interface IUserOrganisation {
  organisationId: string;
  organisationName: string;
}

export interface IUserDepartment {
  departmentId: string;
  departmentName: string;
}

export interface IUserLedOf {
  organisationId: string;
  organisationName: string;
}

export interface IUserManagerOf {
  organisationId: string;
  organisationName: string;
  departmentId: string;
  departmentName: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role?: "owner" | "chief" | "employee" | "employees";
  status?: "active" | "inactive" | string;
  createdOrganisations?: ICreatedOrganisation[];
  organisations?: IUserOrganisation[];
  departments?: IUserDepartment[];
  ledOf?: IUserLedOf[];
  managerOf?: IUserManagerOf[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },
    role: {
      type: String,
      enum: ["owner", "chief", "employee", "employees"],
      default: "owner",
    },
    status: {
      type: String,
      default: "active",
      trim: true,
    },
    createdOrganisations: [
      {
        createdOrganisationId: {
          type: String,
        },
        createdOrganisationName: {
          type: String,
        },
      },
    ],
    organisations: [{
      organisationId: {
        type: String,
      },
      organisationName: {
        type: String,
      },
    }],
    departments: [{
      departmentId: {
        type: String,
      },
      departmentName: {
        type: String,
      },
    }],
    ledOf: [{
      organisationId: {
        type: String,
      },
      organisationName: {
        type: String,
      },
    }],
    managerOf: [{
      organisationId: {
        type: String,
      },
      organisationName: {
        type: String,
      },
      departmentId: {
        type: String,
      },
      departmentName: {
        type: String,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in Next.js hot reload environment, while ensuring schema updates take effect
if (
  mongoose.models.User &&
  (!mongoose.models.User.schema.paths["createdOrganisations"] ||
    !mongoose.models.User.schema.paths["LedOf"] ||
    !mongoose.models.User.schema.paths["role"])
) {
  delete (mongoose.models as Record<string, unknown>).User;
}

const UserModel: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export { UserModel };
export default UserModel;
