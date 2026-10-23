
import { Router } from "express";
import mongoose from "mongoose";
import {
  Book,
  Counter,
  Member,
  Transaction,
} from "../models/index.js";

const router = Router();

const isValidId = (id) => mongoose.isValidObjectId(id);

const sendError = (res, error) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A duplicate identifier was detected. Please retry.",
    });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  console.error("Transaction API error:", error);
  return res.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
  });
};

const getDisplayStatus = (transaction) => {
  if (transaction.status === "Returned") return "Returned";

  return new Date(transaction.dueDate) < new Date()
    ? "Overdue"
    : "Issued";
};

const nextTransactionId = async (session) => {
  const counter = await Counter.findByIdAndUpdate(
    "transaction",
    { $inc: { sequence: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      session,
    }
  );

  return `TXN-${counter.sequence}`;
};

const parseDate = (value, fieldName) => {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} is required.`);
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} is invalid.`);
  }

  return date;
};

// GET /api/transactions?search=atomic&status=Overdue
router.get("/", async (req, res) => {
  try {
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const status =
      typeof req.query.status === "string" ? req.query.status.trim() : "";

    if (
      status &&
      !["Issued", "Returned", "Overdue", "Active", "Completed"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction status filter.",
      });
    }

    const transactions = await Transaction.find()
      .populate("bookId", "title author isbn category totalCopies availableCopies")
      .populate("memberId", "memberId name email phone status")
      .sort({ createdAt: -1 })
      .lean();

    const searchLower = search.toLowerCase();

    const data = transactions
      .map((transaction) => ({
        ...transaction,
        displayStatus: getDisplayStatus(transaction),
      }))
      .filter((transaction) => {
        const displayStatus = transaction.displayStatus;

        const statusMatches =
          !status ||
          displayStatus === status ||
          (status === "Active" && displayStatus === "Issued") ||
          (status === "Completed" && displayStatus === "Returned");

        const searchMatches =
          !search ||
          [
            transaction.transactionId,
            transaction.bookId?.title,
            transaction.bookId?.isbn,
            transaction.memberId?.memberId,
            transaction.memberId?.name,
            transaction.memberId?.email,
          ].some((value) =>
            String(value || "").toLowerCase().includes(searchLower)
          );

        return statusMatches && searchMatches;
      });

    return res.json({ success: true, data });
  } catch (error) {
    return sendError(res, error);
  }
});

// GET /api/transactions/:id
router.get("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID.",
      });
    }

    const transaction = await Transaction.findById(req.params.id)
      .populate("bookId", "title author isbn")
      .populate("memberId", "memberId name email")
      .lean();

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found.",
      });
    }

    return res.json({
      success: true,
      data: {
        ...transaction,
        displayStatus: getDisplayStatus(transaction),
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
});

// POST /api/transactions
// Body: { bookId, memberId, issueDate, dueDate }
router.post("/", async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { bookId, memberId } = req.body;

    if (!isValidId(bookId) || !isValidId(memberId)) {
      return res.status(400).json({
        success: false,
        message: "Valid bookId and memberId are required.",
      });
    }

    const issueDate = parseDate(req.body.issueDate, "Issue date");
    const dueDate = parseDate(req.body.dueDate, "Due date");

    if (dueDate < issueDate) {
      return res.status(400).json({
        success: false,
        message: "Due date cannot be before the issue date.",
      });
    }

    let createdTransaction;

    await session.withTransaction(async () => {
      const book = await Book.findById(bookId).session(session);
      const member = await Member.findById(memberId).session(session);

      if (!book) {
        const error = new Error("Book not found.");
        error.statusCode = 404;
        throw error;
      }

      if (!member) {
        const error = new Error("Member not found.");
        error.statusCode = 404;
        throw error;
      }

      if (member.status !== "Active") {
        const error = new Error("Inactive members cannot borrow books.");
        error.statusCode = 400;
        throw error;
      }

      // Count actual open loans rather than trusting a potentially stale
      // availableCopies field.
      const issuedCount = await Transaction.countDocuments({
        bookId: book._id,
        status: "Issued",
      }).session(session);

      if (issuedCount >= book.totalCopies) {
        const error = new Error("No copies of this book are available.");
        error.statusCode = 409;
        throw error;
      }

      // Conditional update protects against issuing beyond totalCopies.
      const updatedBook = await Book.findOneAndUpdate(
        {
          _id: book._id,
          totalCopies: { $gt: issuedCount },
        },
        {
          $set: { availableCopies: book.totalCopies - issuedCount - 1 },
        },
        {
          new: true,
          session,
          runValidators: true,
        }
      );

      if (!updatedBook) {
        const error = new Error("Book availability changed. Please retry.");
        error.statusCode = 409;
        throw error;
      }

      const transactionId = await nextTransactionId(session);

      const [transaction] = await Transaction.create(
        [
          {
            transactionId,
            bookId: book._id,
            memberId: member._id,
            issueDate,
            dueDate,
            returnedDate: null,
            status: "Issued",
          },
        ],
        { session }
      );

      createdTransaction = transaction;
    });

    const populated = await Transaction.findById(createdTransaction._id)
      .populate("bookId", "title author isbn")
      .populate("memberId", "memberId name email")
      .lean();

    return res.status(201).json({
      success: true,
      message: "Book issued successfully.",
      data: {
        ...populated,
        displayStatus: getDisplayStatus(populated),
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("date is required") ||
        error.message.includes("date is invalid")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return sendError(res, error);
  } finally {
    await session.endSession();
  }
});

// PATCH /api/transactions/:id/return
router.patch("/:id/return", async (req, res) => {
  const session = await mongoose.startSession();

  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID.",
      });
    }

    let returnedTransaction;

    await session.withTransaction(async () => {
      const transaction = await Transaction.findById(req.params.id).session(
        session
      );

      if (!transaction) {
        const error = new Error("Transaction not found.");
        error.statusCode = 404;
        throw error;
      }

      if (transaction.status === "Returned") {
        const error = new Error("This book has already been returned.");
        error.statusCode = 409;
        throw error;
      }

      const book = await Book.findById(transaction.bookId).session(session);

      if (!book) {
        const error = new Error("The book linked to this transaction was not found.");
        error.statusCode = 409;
        throw error;
      }

      transaction.status = "Returned";
      transaction.returnedDate = new Date();
      await transaction.save({ session });

      const issuedCount = await Transaction.countDocuments({
        bookId: book._id,
        status: "Issued",
      }).session(session);

      // After marking this transaction returned, issuedCount excludes it.
      await Book.updateOne(
        { _id: book._id },
        {
          $set: {
            availableCopies: Math.max(0, book.totalCopies - issuedCount),
          },
        },
        { session, runValidators: true }
      );

      returnedTransaction = transaction;
    });

    const populated = await Transaction.findById(returnedTransaction._id)
      .populate("bookId", "title author isbn")
      .populate("memberId", "memberId name email")
      .lean();

    return res.json({
      success: true,
      message: "Book returned successfully.",
      data: {
        ...populated,
        displayStatus: getDisplayStatus(populated),
      },
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return sendError(res, error);
  } finally {
    await session.endSession();
  }
});

export default router;
