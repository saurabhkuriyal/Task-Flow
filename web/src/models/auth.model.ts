import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICreatedOrganisation {
  createdOrganisationId: string;
}

export interface IUserOrganisation {
  organisationId: string;
}

export interface IUserStream {
  streamId: string;
}

export interface IUserLedOf {
  streamId?: string;
  organisationId?: string;
}

export interface IUserManagerOf {
  organisationId: string;
  streamId: string;
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
  streams?: IUserStream[];
  departments?: IUserStream[]; // Optional legacy alias for streams
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
        _id: false,
        createdOrganisationId: {
          type: Schema.Types.ObjectId,
          ref: "Organization",
        },
      },
    ],
    organisations: [
      {
        _id: false,
        organisationId: {
          type: Schema.Types.ObjectId,
          ref: "Organization",
        },
      },
    ],
    streams: [
      {
        _id: false,
        streamId: {
          type: Schema.Types.ObjectId,
          ref: "Stream",
        },
      },
    ],
    ledOf: [
      {
        _id: false,
        streamId: {
          type: Schema.Types.ObjectId,
          ref: "Stream",
        },
        organisationId: {
          type: Schema.Types.ObjectId,
          ref: "Organization",
        },
      },
    ],
    managerOf: [
      {
        _id: false,
        organisationId: {
          type: Schema.Types.ObjectId,
          ref: "Organization",
        },
        streamId: {
          type: Schema.Types.ObjectId,
          ref: "Stream",
        },
      },
    ],
  },
  {
    timestamps: true,
    strict: false,
  }
);

// Prevent model recompilation in Next.js hot reload environment, while ensuring schema updates take effect
if (
  mongoose.models.User &&
  (!mongoose.models.User.schema.paths["createdOrganisations"] ||
    !mongoose.models.User.schema.paths["streams"] ||
    !mongoose.models.User.schema.paths["ledOf"] ||
    !mongoose.models.User.schema.paths["managerOf"] ||
    !mongoose.models.User.schema.paths["role"])
) {
  delete (mongoose.models as Record<string, unknown>).User;
}

const UserModel: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export { UserModel };
export default UserModel;
