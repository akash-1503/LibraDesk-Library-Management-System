
import { Router } from "express";
import mongoose from "mongoose";
import { Counter, Member, Transaction } from "../models/index.js";

const router = Router();

const isValidId = (id) => mongoose.isValidObjectId(id);

const sendError = (res, error) => {
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];

    return res.status(409).json({
      success: false,
      message:
        field === "email"
          ? "A member with this email already exists."
          : "A duplicate record was detected.",
    });
  }

  if (error.name === "ValidationError" || error.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  console.error("Member API error:", error);
  return res.status(500).json({
    success: false,
    message: "An unexpected server error occurred.",
  });
};

const parseMemberInput = (body, existing = {}) => {
  const name =
    typeof body.name === "string" ? body.name.trim() : existing.name || "";
  const email =
    typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : existing.email || "";
  const phone =
    typeof body.phone === "string"
      ? body.phone.trim()
      : existing.phone || "";
  const status = body.status ?? existing.status ?? "Active";

  if (!name || !email) {
    throw new Error("Member name and email are required.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error("Enter a valid email address.");
}

  if (!["Active", "Inactive"].includes(status)) {
    throw new Error("Status must be Active or Inactive.");
  }

  return { name, email, phone, status };
};

const nextDisplayId = async () => {
  const counter = await Counter.findByIdAndUpdate(
    "member",
    { $inc: { sequence: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }
  );

  return `MEM-${counter.sequence}`;
};

// GET /api/members?search=aarav&status=Active
router.get("/", async (req, res) => {
  try {
    const filter = {};
    const search =
      typeof req.query.search === "string" ? req.query.search.trim() : "";
    const status =
      typeof req.query.status === "string" ? req.query.status.trim() : "";

    if (search) {
   const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");

      filter.$or = [
        { memberId: regex },
        { name: regex },
        { email: regex },
        { phone: regex },
      ];
    }

    if (status) {
      if (!["Active", "Inactive"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid member status filter.",
        });
      }

      filter.status = status;
    }

    const members = await Member.find(filter).sort({ createdAt: -1 }).lean();

    // Count current loans per member for the borrowedBooks UI field.
    const borrowedCounts = await Transaction.aggregate([
      { $match: { status: "Issued" } },
      { $group: { _id: "$memberId", count: { $sum: 1 } } },
    ]);

    const borrowedMap = new Map(
      borrowedCounts.map((item) => [String(item._id), item.count])
    );

    const data = members.map((member) => ({
      ...member,
      borrowedBooks: borrowedMap.get(String(member._id)) || 0,
    }));

    return res.json({ success: true, data });
  } catch (error) {
    return sendError(res, error);
  }
});

// GET /api/members/:id
router.get("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid member ID.",
      });
    }

    const member = await Member.findById(req.params.id).lean();

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    const borrowedBooks = await Transaction.countDocuments({
      memberId: member._id,
      status: "Issued",
    });

    return res.json({
      success: true,
      data: { ...member, borrowedBooks },
    });
  } catch (error) {
    return sendError(res, error);
  }
});

// POST /api/members
router.post("/", async (req, res) => {
  try {
    const input = parseMemberInput(req.body);

    const existing = await Member.findOne({ email: input.email });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A member with this email already exists.",
      });
    }

    const memberId = await nextDisplayId();
    const member = await Member.create({ ...input, memberId });

    return res.status(201).json({
      success: true,
      message: "Member created successfully.",
      data: { ...member.toObject(), borrowedBooks: 0 },
    });
  } catch (error) {
    if (
      error.message.includes("required") ||
      error.message.includes("valid email") ||
      error.message.includes("Status must")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return sendError(res, error);
  }
});

// PATCH /api/members/:id
router.patch("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid member ID.",
      });
    }

    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    const input = parseMemberInput(req.body, member.toObject());

    const duplicate = await Member.findOne({
      email: input.email,
      _id: { $ne: member._id },
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: "Another member already uses this email.",
      });
    }

    Object.assign(member, input);
    await member.save();

    const borrowedBooks = await Transaction.countDocuments({
      memberId: member._id,
      status: "Issued",
    });

    return res.json({
      success: true,
      message: "Member updated successfully.",
      data: { ...member.toObject(), borrowedBooks },
    });
  } catch (error) {
    if (
      error.message.includes("required") ||
      error.message.includes("valid email") ||
      error.message.includes("Status must")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return sendError(res, error);
  }
});

// DELETE /api/members/:id
router.delete("/:id", async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid member ID.",
      });
    }

    const member = await Member.findById(req.params.id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found.",
      });
    }

    const activeLoans = await Transaction.countDocuments({
      memberId: member._id,
      status: "Issued",
    });

    if (activeLoans > 0) {
      return res.status(409).json({
        success: false,
        message: "This member cannot be deleted while books are issued.",
      });
    }

    await member.deleteOne();

    return res.json({
      success: true,
      message: "Member deleted successfully.",
    });
  } catch (error) {
    return sendError(res, error);
  }
});

export default router;
