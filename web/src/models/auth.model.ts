import mongoose, { Document, Model, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  createdOrganisationName: string
  createdOrganisationId: string
  organisations: [],
  departments: [],
  chiefOf: [],
  managerOf: [],
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
    createdOrganisationName: {
      type: String,
    },
    createdOrganisationId: {
      type: String,
    },
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
    chiefOf: [{
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

// Prevent model recompilation in Next.js hot reload environment
const UserModel: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export { UserModel };
export default UserModel;
