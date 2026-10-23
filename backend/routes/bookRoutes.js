
import { Router } from "express";
import mongoose from "mongoose";
import { Book, Transaction } from "../models/index.js";

const router = Router();

const isValidId = (id) => mongoose.isValidObjectId(id);

const sendError = (res, error) => {
  if (error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "A book with this ISBN already exists.",
    });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  console.error("Book API error:", error);
  return res.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
  });
};

const parseBookInput = (body) => {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const author = typeof body.author === "string" ? body.author.trim() : "";
  const isbn = typeof body.isbn === "string" ? body.isbn.trim() : "";
  const category =
    typeof body.category === "string" ? body.category.trim() : "";

  const totalCopies = Number(body.totalCopies);

  if (!title || !author || !isbn || !category) {
    throw new Error("Title, author, ISBN, and category are required.");
  }

if (!Number.isInteger(totalCopies) || totalCopies < 1) {
  throw new Error("Total copies must be a whole number of at least 1.");
}

  const result = { title, author, isbn, category, totalCopies };

  if (body.publishedYear !== undefined && body.publishedYear !== "") {
    const publishedYear = Number(body.publishedYear);

    if (
      !Number.isInteger(publishedYear) ||
      publishedYear < 0 ||
      publishedYear > new Date().getFullYear() + 1
    ) {
      throw new Error("Published year is invalid.");
    }

    result.publishedYear = publishedYear;
  }

  return result;
};

// GET /api/books?search=clean&category=Programming
router.get("/", async (req, res) => {
  try {
    const filter = {};
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const category =
      typeof req.query.category === "string"
        ? req.query.category.trim()
        : "";

    if (search) {
const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");

      filter.$or = [
        { title: regex },
        { author: regex },
        { isbn: regex },
        { category: regex },
      ];
    }

    if (category) filter.category = category;

    const books = await Book.find(filter).sort({ createdAt: -1 }).lean();

    const issuedCounts = await Transaction.aggregate([
      { $match: { status: "Issued" } },
     { $group: { _id: "$bookId", count: { $sum: 1 } } }
    ]);

    const issuedMap = new Map(
      issuedCounts.map((item) => [String(item._id), item.count])
    );

    const result = books.map((book) => ({
      ...book,
      issuedCopies: issuedMap.get(String(book._id)) || 0,
      availableCopies: Math.max(
        0,
        book.totalCopies - (issuedMap.get(String(book._id)) || 0)
      ),
    }));

    return res.json({ success: true, data: result });
  } catch (error) {
    return sendError(res, error);
  }
});

// GET /api/books/:id
router.get("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID.",
      });
    }

    const book = await Book.findById(req.params.id).lean();

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    const issuedCopies = await Transaction.countDocuments({
      bookId: book._id,
      status: "Issued",
    });

    return res.json({
      success: true,
      data: {
        ...book,
        issuedCopies,
        availableCopies: Math.max(0, book.totalCopies - issuedCopies),
      },
    });
  } catch (error) {
    return sendError(res, error);
  }
});

// POST /api/books
router.post("/", async (req, res) => {
  try {
    const input = parseBookInput(req.body);

    const existing = await Book.findOne({ isbn: input.isbn });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A book with this ISBN already exists.",
      });
    }

    const book = await Book.create({
      ...input,
      availableCopies: input.totalCopies,
    });

    return res.status(201).json({
      success: true,
      message: "Book created successfully.",
      data: book,
    });
  } catch (error) {
    if (error.message.includes("required") ||
        error.message.includes("copies must") ||
        error.message.includes("year is invalid")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return sendError(res, error);
  }
});

// PATCH /api/books/:id
router.patch("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID.",
      });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    const input = parseBookInput({
      title: req.body.title ?? book.title,
      author: req.body.author ?? book.author,
      isbn: req.body.isbn ?? book.isbn,
      category: req.body.category ?? book.category,
      totalCopies: req.body.totalCopies ?? book.totalCopies,
      publishedYear: req.body.publishedYear ?? book.publishedYear,
    });

    const duplicate = await Book.findOne({
      isbn: input.isbn,
      _id: { $ne: book._id },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Another book already uses this ISBN.",
      });
    }

    const issuedCopies = await Transaction.countDocuments({
      bookId: book._id,
      status: "Issued",
    });

    if (input.totalCopies < issuedCopies) {
      return res.status(400).json({
        success: false,
        message: `Cannot set total copies below ${issuedCopies}; those copies are currently issued.`,
      });
    }

    Object.assign(book, input);
    book.availableCopies = input.totalCopies - issuedCopies;

    await book.save();

    return res.json({
      success: true,
      message: "Book updated successfully.",
      data: book,
    });
  } catch (error) {
    if (error.message.includes("required") ||
        error.message.includes("copies must") ||
        error.message.includes("year is invalid")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return sendError(res, error);
  }
});

// DELETE /api/books/:id
router.delete("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID.",
      });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found.",
      });
    }

    const activeLoans = await Transaction.countDocuments({
      bookId: book._id,
      status: "Issued",
    });

    if (activeLoans > 0) {
      return res.status(409).json({
        success: false,
        message: "This book cannot be deleted while copies are issued.",
      });
    }

    await book.deleteOne();

    return res.json({
      success: true,
      message: "Book deleted successfully.",
    });
  } catch (error) {
    return sendError(res, error);
  }
});

export default router;
