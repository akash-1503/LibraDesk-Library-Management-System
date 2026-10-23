"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";


function dateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}



function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(value) {
  if (!value) return "—";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function getStatus(transaction, today) {
  if (transaction.displayStatus) {
    return transaction.displayStatus;
  }

  if (transaction.status === "Returned") {
    return "Returned";
  }

  if (!today) return "Issued";

  return transaction.dueDate < today ? "Overdue" : "Issued";
}

function StatusBadge({ status }) {
  const styles = {
    Issued: "bg-blue-50 text-blue-700",
    Returned: "bg-emerald-50 text-emerald-700",
    Overdue: "bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      <span
        className={`mr-1.5 mt-1 h-1.5 w-1.5 rounded-full ${
          status === "Issued"
            ? "bg-blue-500"
            : status === "Overdue"
              ? "bg-rose-500"
              : "bg-emerald-500"
        }`}
      />
      {status}
    </span>
  );
}

function TransactionModal({
  
  books,
  members,
  onClose,
  onIssue,
  saving,
  apiError,
}) {
  const availableBooks = books.filter((book) => book.available > 0);
  const activeMembers = members.filter((member) => member.status === "Active");

  const [bookId, setBookId] = useState(
    availableBooks[0]?.id || ""
  );

  const [memberId, setMemberId] = useState(
    activeMembers[0]?.id || ""
  );
 const [issueDate, setIssueDate] = useState("");
const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
  const today = new Date();

  setIssueDate(dateString(today));
  setDueDate(dateString(addDays(today, 14)));
}, []);

  useEffect(() => {
  if (!availableBooks.some((book) => book.id === bookId)) {
    setBookId(availableBooks[0]?.id || "");
  }
}, [availableBooks, bookId]);

useEffect(() => {
  if (!activeMembers.some((member) => member.id === memberId)) {
    setMemberId(activeMembers[0]?.id || "");
  }
}, [activeMembers, memberId]);

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const selectedBook = books.find(
      (book) => book.id === bookId
    );

    const selectedMember = members.find(
      (member) => member.id === memberId
    );

    if (!selectedBook || !selectedMember) {
      setError("Select a valid book and member.");
      return;
    }

    if (selectedMember.status !== "Active") {
      setError("Only active members can borrow books.");
      return;
    }

    if (selectedBook.available < 1) {
      setError("This book is currently unavailable.");
      return;
    }

    if (!issueDate || !dueDate || dueDate < issueDate) {
      setError("The due date must be on or after the issue date.");
      return;
    }

    onIssue({
      bookId: selectedBook.id,
      memberId: selectedMember.id,
      issueDate,
      dueDate,
    });
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-modal-title"
        className="my-auto w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              Circulation desk
            </p>
            <h2 id="issue-modal-title" className="mt-2 text-2xl font-bold text-slate-900">
              Issue a book
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Select a book, member, and return deadline.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-600 hover:bg-slate-200"
          >
            ×
          </button>
        </div>

        {availableBooks.length === 0 || activeMembers.length === 0 ? (
          <div className="rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
            {availableBooks.length === 0
              ? "There are no available books to issue."
              : "There are no active members eligible to borrow books."}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="issue-book" className="mb-2 block text-sm font-semibold text-slate-700">
                Book *
              </label>
              <select
                id="issue-book"
                value={bookId}
                onChange={(event) => setBookId(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              >
                {availableBooks.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} — {book.available} available
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="issue-member" className="mb-2 block text-sm font-semibold text-slate-700">
                Active member *
              </label>
              <select
                id="issue-member"
                value={memberId}
                onChange={(event) => setMemberId(event.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              >
                {activeMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.memberId})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="issue-date" className="mb-2 block text-sm font-semibold text-slate-700">
                  Issue date *
                </label>
                <input
                  id="issue-date"
                  type="date"
                  value={issueDate}
                  onChange={(event) => setIssueDate(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div>
                <label htmlFor="due-date" className="mb-2 block text-sm font-semibold text-slate-700">
                  Due date *
                </label>
                <input
                  id="due-date"
                  type="date"
                  min={issueDate}
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </p>
            )}

            {apiError && (
              <p
                role="alert"
                className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                {apiError}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Issuing..." : "Confirm issue"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

export default function TransactionsPage() {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [issueError, setIssueError] = useState("");

  const [today, setToday] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All transactions");
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [returnTransaction, setReturnTransaction] = useState(null);
  const [notice, setNotice] = useState("");

  async function loadTransactionsPage() {
    setLoading(true);
    setError("");

    try {
      const [bookResult, memberResult, transactionResult] =
        await Promise.all([
          apiRequest("/books"),
          apiRequest("/members"),
          apiRequest("/transactions"),
        ]);

      const bookRecords = Array.isArray(bookResult.data)
        ? bookResult.data
        : [];

      const memberRecords = Array.isArray(memberResult.data)
        ? memberResult.data
        : [];

      const transactionRecords = Array.isArray(transactionResult.data)
        ? transactionResult.data
        : [];

      setBooks(
        bookRecords.map((book) => ({
          ...book,
          id: String(book._id),
          total: Number(book.totalCopies ?? book.total ?? 0),
          available: Number(
            book.availableCopies ?? book.available ?? 0
          ),
        }))
      );

      setMembers(
        memberRecords.map((member) => ({
          ...member,
          id: String(member._id),
        }))
      );

      setTransactions(
        transactionRecords.map((transaction) => ({
          ...transaction,
          id: String(transaction._id),
          bookId: String(transaction.bookId?._id ?? transaction.bookId),
          memberId: String(
            transaction.memberId?._id ?? transaction.memberId
          ),
          transactionId: transaction.transactionId,
          issueDate: transaction.issueDate
            ? String(transaction.issueDate).slice(0, 10)
            : "",
          dueDate: transaction.dueDate
            ? String(transaction.dueDate).slice(0, 10)
            : "",
          returnedDate: transaction.returnedDate
            ? String(transaction.returnedDate).slice(0, 10)
            : null,
          status: transaction.status,
          displayStatus: transaction.displayStatus,
        }))
      );
  } catch (err) {
  setError(err.message || "Unable to load transaction data.");
  throw err;
} finally {
  setLoading(false);
}
  }

  useEffect(() => {
    setToday(dateString(new Date()));
    loadTransactionsPage();
  }, []);

  const bookById = useMemo(
    () => new Map(books.map((book) => [book.id, book])),
    [books]
  );

  const memberById = useMemo(
    () => new Map(members.map((member) => [member.id, member])),
    [members]
  );

  const enrichedTransactions = useMemo(
    () =>
      transactions.map((transaction) => ({
        ...transaction,
        book: bookById.get(transaction.bookId),
        member: memberById.get(transaction.memberId),
      })),
    [transactions, bookById, memberById]
  );

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return enrichedTransactions.filter((transaction) => {
      const status = getStatus(transaction, today);

      const matchesSearch =
        !query ||
        [
          transaction.transactionId || "",
          transaction.book?.title || "",
          transaction.member?.name || "",
          transaction.member?.memberId || "",
        ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All transactions" ||
        (statusFilter === "Issued" && status === "Issued") ||
        (statusFilter === "Overdue" && status === "Overdue") ||
        (statusFilter === "Returned" && status === "Returned");

      return matchesSearch && matchesStatus;
    });
  }, [enrichedTransactions, search, statusFilter, today]);

  const issuedCount = transactions.filter(
    (transaction) => getStatus(transaction, today) === "Issued"
  ).length;

  const overdueCount = transactions.filter(
    (transaction) => getStatus(transaction, today) === "Overdue"
  ).length;

  const returnedCount = transactions.filter(
    (transaction) => getStatus(transaction, today) === "Returned"
  ).length;


async function handleIssue({ bookId, memberId, issueDate, dueDate }) {
  setSaving(true);
  setIssueError("");
  setError("");
  setNotice("");

  try {
    const result = await apiRequest("/transactions", {
      method: "POST",
      body: JSON.stringify({
        bookId,
        memberId,
        issueDate,
        dueDate,
      }),
    });

    await loadTransactionsPage();

    setIssueModalOpen(false);
    setNotice(result.message || "Book issued successfully.");
  } catch (err) {
    setIssueError(err.message || "Unable to issue the book.");
  } finally {
    setSaving(false);
  }
}


  async function confirmReturn() {
    if (!returnTransaction) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const result = await apiRequest(
        `/transactions/${returnTransaction.id}/return`,
        {
          method: "PATCH",
        }
      );

      await loadTransactionsPage();

      setReturnTransaction(null);
      setNotice(result.message || "Book returned successfully.");
    } catch (err) {
      setError(err.message || "Unable to return the book.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-emerald-700">Transactions</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Book transactions
          </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Issue books, process returns, and monitor due dates from one place.
          </p>
        </div>

     <button
  type="button"
  disabled={loading || saving}
onClick={() => {
  setIssueError("");
  setError("");
  setNotice("");
  setIssueModalOpen(true);
}}
  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
>
  <span className="text-lg leading-none">+</span>
  Issue a book
</button>
      </section>

      {notice && (
        <div
          role="status"
          className="flex items-start justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <p>{notice}</p>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
            className="text-lg leading-none"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total transactions",
            value: transactions.length,
            hint: "All recorded issue and return entries",
            icon: "⇄",
            color: "bg-slate-100 text-slate-700",
          },
          {
            label: "Currently issued",
            value: issuedCount,
            hint: "Active loans within their due date",
            icon: "↗",
            color: "bg-blue-50 text-blue-700",
          },
          {
            label: "Overdue",
            value: overdueCount,
            hint: "Loans past their due date",
            icon: "!",
            color: "bg-rose-50 text-rose-700",
          },
          {
            label: "Returned",
            value: returnedCount,
            hint: "Completed return transactions",
            icon: "✓",
            color: "bg-emerald-50 text-emerald-700",
          },
        ].map((stat) => (
          <article
            key={stat.label}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${stat.color}`}
              >
                {stat.icon}
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
              {stat.value}
            </p>
            <p className="mt-2 text-xs text-slate-500">{stat.hint}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Transaction history{" "}
                <span className="ml-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                  {filteredTransactions.length}
                </span>
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Find a loan by book, member, or transaction ID.
              </p>
            </div>
          </div>
        </div>

        {loading && (
          <p className="px-6 py-8 text-center text-sm text-slate-500">
            Loading transactions...
          </p>
        )}

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-slate-50/80">
              <tr className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Book / Transaction</th>
                <th className="px-4 py-4">Member</th>
                <th className="px-4 py-4">Issue date</th>
                <th className="px-4 py-4">Due date</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((transaction, index) => {
                const status = getStatus(transaction, today);

                return (
                  <tr
                    key={transaction.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${
                            [
                              "bg-emerald-50 text-emerald-800",
                              "bg-blue-50 text-blue-800",
                              "bg-violet-50 text-violet-800",
                              "bg-amber-50 text-amber-800",
                            ][index % 4]
                          }`}
                        >
                          ▤
                        </div>
                        <div>
                          <p className="max-w-[210px] truncate text-sm font-bold text-slate-800">
                            {transaction.book?.title || "Unknown book"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {transaction.transactionId || transaction.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-slate-700">
                        {transaction.member?.name || "Unknown member"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {transaction.member?.memberId || "—"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                      {formatDate(transaction.issueDate)}
                    </td>

                    <td className="whitespace-nowrap px-4 py-4">
                      <p
                        className={`text-sm font-medium ${
                          status === "Overdue"
                            ? "text-rose-600"
                            : "text-slate-600"
                        }`}
                      >
                        {formatDate(transaction.dueDate)}
                      </p>
                      {status === "Overdue" && (
                        <p className="mt-1 text-xs font-medium text-rose-500">
                          Past due
                        </p>
                      )}
                      {transaction.returnedDate && (
                        <p className="mt-1 text-xs text-slate-400">
                          Returned {formatDate(transaction.returnedDate)}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={status} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      {getStatus(transaction, today) !== "Returned" ? (
                        <button
                          type="button"
                          onClick={() => {
                            setNotice("");
                            setReturnTransaction(transaction);
                          }}
                          className="rounded-lg border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50"
                        >
                          Return book
                        </button>
                      ) : (
                        <span className="text-xs font-medium text-slate-400">
                          Completed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="space-y-3 p-4 md:hidden">
          {filteredTransactions.map((transaction) => {
            const status = getStatus(transaction, today);

            return (
              <article
                key={transaction.id}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-lg text-emerald-800">
                    ▤
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-bold text-slate-900">
                      {transaction.book?.title || "Unknown book"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {transaction.transactionId || transaction.id}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {transaction.member?.name || "Unknown member"}
                    </p>
                  </div>

                  <StatusBadge status={status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs">
                  <div>
                    <p className="text-slate-500">Issued on</p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {formatDate(transaction.issueDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Due date</p>
                    <p
                      className={`mt-1 font-semibold ${
                        status === "Overdue"
                          ? "text-rose-600"
                          : "text-slate-800"
                      }`}
                    >
                      {formatDate(transaction.dueDate)}
                    </p>
                  </div>
                  {transaction.returnedDate && (
                    <div className="col-span-2">
                      <p className="text-slate-500">Returned on</p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {formatDate(transaction.returnedDate)}
                      </p>
                    </div>
                  )}
                </div>

             {getStatus(transaction, today) !== "Returned" && (
                  <button
                    type="button"
                    onClick={() => {
                      setNotice("");
                      setReturnTransaction(transaction);
                    }}
                    className="mt-4 w-full rounded-lg border border-emerald-200 px-3 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                  >
                    Return book
                  </button>
                )}
              </article>
            );
          })}
        </div>

        {!loading && filteredTransactions.length === 0 && (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-500">
              ⇄
            </div>
            <h3 className="mt-4 font-bold text-slate-900">
              No transactions found
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Try another search term or change the status filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("All transactions");
              }}
              className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
            >
              Clear filters
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </p>
          <p>Live database · Changes are saved automatically</p>
        </div>
      </section>

      {issueModalOpen && (
      <TransactionModal
  books={books}
  members={members}
  onClose={() => setIssueModalOpen(false)}
  onIssue={handleIssue}
  saving={saving}
  apiError={issueError}
/>
      )}

      {returnTransaction && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="return-modal-title"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-700">
              ✓
            </div>

            <h2
              id="return-modal-title"
              className="mt-4 text-xl font-bold text-slate-900"
            >
              Confirm book return
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Mark{" "}
              <strong>
                {bookById.get(returnTransaction.bookId)?.title || "this book"}
              </strong>{" "}
              as returned by{" "}
              <strong>
                {memberById.get(returnTransaction.memberId)?.name || "the member"}
              </strong>
              ? The available copy count will increase by one.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setReturnTransaction(null)}
                disabled={saving}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={confirmReturn}
                className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Processing..." : "Confirm return"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}