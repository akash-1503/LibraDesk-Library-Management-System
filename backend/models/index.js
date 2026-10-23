
import mongoose from "mongoose";

const { Schema } = mongoose;

// --------------------------------------------------
// BOOK MODEL
// --------------------------------------------------

const bookSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
      maxlength: [150, "Author cannot exceed 150 characters"],
    },
    isbn: {
      type: String,
      required: [true, "ISBN is required"],
      unique: true,
      trim: true,
      maxlength: 20,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: 100,
    },
    totalCopies: {
      type: Number,
      required: true,
     min: [1, "Total copies must be at least 1"],
      validate: {
        validator: Number.isInteger,
        message: "Total copies must be a whole number",
      },
    },
    availableCopies: {
      type: Number,
      required: true,
      min: [0, "Available copies cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Available copies must be a whole number",
      },
    },
    publishedYear: {
      type: Number,
      min: 0,
      max: new Date().getFullYear() + 1,
      validate: {
        validator: (value) =>
          value == null || Number.isInteger(value),
        message: "Published year must be a whole number",
      },
    },
  },
  { timestamps: true }
);

bookSchema.pre("validate", function () {
  if (this.availableCopies > this.totalCopies) {
    this.invalidate(
      "availableCopies",
      "Available copies cannot exceed total copies"
    );
  }
});

// --------------------------------------------------
// MEMBER MODEL
// --------------------------------------------------

const memberSchema = new Schema(
  {
    memberId: {
      type: String,
      unique: true,
      immutable: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Member name is required"],
      trim: true,
      maxlength: 150,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
     match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email"],
    },
    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: 30,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// --------------------------------------------------
// TRANSACTION MODEL
// --------------------------------------------------

const transactionSchema = new Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      immutable: true,
      trim: true,
    },
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
      index: true,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
      validate: {
        validator(value) {
          return !this.issueDate || value >= this.issueDate;
        },
        message: "Due date cannot be before issue date",
      },
    },
    returnedDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["Issued", "Returned"],
      default: "Issued",
      index: true,
    },
  },
  { timestamps: true }
);


const counterSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    sequence: {
      type: Number,
      default: 1000,
    },
  },
  {
    versionKey: false,
  }
);

export const Counter =
  mongoose.models.Counter ||
  mongoose.model("Counter", counterSchema);


// --------------------------------------------------
// EXPORT MODELS
// --------------------------------------------------

export const Book =
  mongoose.models.Book || mongoose.model("Book", bookSchema);

export const Member =
  mongoose.models.Member || mongoose.model("Member", memberSchema);

export const Transaction =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);
