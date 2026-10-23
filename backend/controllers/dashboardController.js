import { Book, Member, Transaction } from "../models/index.js";
export async function getDashboardStats(req, res) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalBooks,
      totalMembers,
      issuedBooks,
      overdueBooks,
      recentTransactions,
      popularBooks,
    ] = await Promise.all([
      // Number of book titles, not the total physical copies
      Book.countDocuments(),

      Member.countDocuments(),

      // Transactions that have not been returned
      Transaction.countDocuments({
        returnedDate: null,
      }),

      // Unreturned transactions whose due date has passed
      Transaction.countDocuments({
        returnedDate: null,
        dueDate: { $lt: today },
      }),

      Transaction.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("bookId", "title author category")
        .populate("memberId", "name memberId")
        .lean(),

      // Count how often each book has been borrowed
      Transaction.aggregate([
        {
          $group: {
            _id: "$bookId",
            issued: { $sum: 1 },
          },
        },
        { $sort: { issued: -1 } },
        { $limit: 4 },
        {
          $lookup: {
            from: "books",
            localField: "_id",
            foreignField: "_id",
            as: "book",
          },
        },
        { $unwind: "$book" },
        {
          $project: {
            _id: 0,
            id: { $toString: "$book._id" },
            title: "$book.title",
            author: "$book.author",
            category: "$book.category",
            total: { $ifNull: ["$book.totalCopies", 0] },
            available: { $ifNull: ["$book.availableCopies", 0] },
            issued: 1,
          },
        },
      ]),
    ]);

    const formattedTransactions = recentTransactions.map((transaction) => {
      const dueDate = transaction.dueDate
        ? new Date(transaction.dueDate)
        : null;

      const isReturned = Boolean(transaction.returnedDate);

      const isOverdue =
        !isReturned && dueDate && dueDate < today;

      return {
        id: String(transaction._id),
        member: transaction.memberId?.name ?? "Unknown member",
        book: transaction.bookId?.title ?? "Unknown book",
        date: transaction.issueDate,
        status: isReturned
          ? "Completed"
          : isOverdue
            ? "Overdue"
            : "Active",
      };
    });

    res.json({
      success: true,
      data: {
        stats: [
          {
            label: "Total Books",
            value: totalBooks,
          },
          {
            label: "Total Members",
            value: totalMembers,
          },
          {
            label: "Books Issued",
            value: issuedBooks,
          },
          {
            label: "Overdue Books",
            value: overdueBooks,
          },
        ],
        recentTransactions: formattedTransactions,
        popularBooks,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data.",
    });
  }
}