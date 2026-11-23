import mongoose, { Document, Model, Schema } from "mongoose";

export type TaskStatus =
  | "todo"
  | "backlog"
  | "in_progress"
  | "in_review"
  | "completed"
  | "blocked";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export type TaskImpact = "low" | "medium" | "high" | "critical";

export interface ITask extends Document {
  taskname: string;
  orgId: mongoose.Types.ObjectId | string;
  streamId: mongoose.Types.ObjectId | string;
  userId: mongoose.Types.ObjectId | string;
  status: TaskStatus;
  priority: TaskPriority;
  impact: TaskImpact;
  date: Date;
  subtaskId: (mongoose.Types.ObjectId | string)[];
  description?: string;
  note?: string;
  assignedId?: mongoose.Types.ObjectId | string | null;
  dueDate?: Date | null;
  recurring: boolean;
  parentTask?: mongoose.Types.ObjectId | string | null;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    taskname: {
      type: String,
      required: [true, "Task name is required"],
      trim: true,
      index: true,
    },
    orgId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: [true, "Organization ID is required"],
      index: true,
    },
    streamId: {
      type: Schema.Types.ObjectId,
      ref: "Stream",
      required: [true, "Stream ID is required"],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    status: {
      type: String,
      enum: [
        "todo",
        "backlog",
        "in_progress",
        "in_review",
        "completed",
        "blocked",
      ],
      default: "todo",
      index: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
      index: true,
    },
    impact: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    subtaskId: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task",
        default: [],
      },
    ],
    description: {
      type: String,
      trim: true,
      default: "",
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    assignedId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    recurring: {
      type: Boolean,
      default: false,
    },
    parentTask: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

// Compound indexes for optimal query performance
TaskSchema.index({ orgId: 1, streamId: 1 });
TaskSchema.index({ streamId: 1, status: 1 });
TaskSchema.index({ assignedId: 1, status: 1 });
TaskSchema.index({ parentTask: 1 });

// Prevent model recompilation during Next.js hot reload
const TaskModel: Model<ITask> =
  (mongoose.models.Task as Model<ITask>) ||
  mongoose.model<ITask>("Task", TaskSchema);

export { TaskModel };
export default TaskModel;
