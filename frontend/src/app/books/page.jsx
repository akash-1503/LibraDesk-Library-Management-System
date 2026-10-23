
"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";

const initialBooks = [
  {
    id: 1,
    title: "Atomic Habits",
    author: "James Clear",
    isbn: "9780735211292",
    category: "Self-help",
    totalCopies: 12,
    availableCopies: 8,
    publishedYear: 2018,
  },
  {
    id: 2,
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "9780132350884",
    category: "Programming",
    totalCopies: 10,
    availableCopies: 4,
    publishedYear: 2008,
  },
  {
    id: 3,
    title: "The Pragmatic Programmer",
    author: "David Thomas",
    isbn: "9780135957059",
    category: "Programming",
    totalCopies: 8,
    availableCopies: 0,
    publishedYear: 2019,
  },
  {
    id: 4,
    title: "Deep Work",
    author: "Cal Newport",
    isbn: "9781455586691",
    category: "Productivity",
    totalCopies: 7,
    availableCopies: 3,
    publishedYear: 2016,
  },
  {
    id: 5,
    title: "The Alchemist",
    author: "Paulo Coelho",
    isbn: "9780062315007",
    category: "Fiction",
    totalCopies: 15,
    availableCopies: 11,
    publishedYear: 1988,
  },
  {
    id: 6,
    title: "Rich Dad Poor Dad",
    author: "Robert T. Kiyosaki",
    isbn: "9781612680194",
    category: "Finance",
    totalCopies: 9,
    availableCopies: 5,
    publishedYear: 1997,
  },
];

const emptyForm = {
  title: "",
  author: "",
  isbn: "",
  category: "Programming",
  totalCopies: "1",
  publishedYear: "",
};

const categories = [
  "Programming",
  "Fiction",
  "Self-help",
  "Productivity",
  "Finance",
  "Science",
  "History",
  "Other",
];

function AvailabilityBadge({ available, total }) {
  let style = "bg-emerald-50 text-emerald-700";
  let label = "Available";

  if (available === 0) {
    style = "bg-rose-50 text-rose-700";
    label = "Out of stock";
  } else if (available <= Math.ceil(total * 0.25)) {
    style = "bg-amber-50 text-amber-700";
    label = "Low stock";
  }

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${style}`}
    >
      {label}
    </span>
  );
}

function BookFormModal({ book, onClose, onSave, saving }) {
  const [form, setForm] = useState(
    book
      ? {
          title: book.title,
          author: book.author,
          isbn: book.isbn,
          category: book.category,
          totalCopies: String(book.totalCopies),
          publishedYear: String(book.publishedYear || ""),
        }
      : emptyForm
  );
  const [error, setError] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const title = form.title.trim();
    const author = form.author.trim();
    const isbn = form.isbn.trim();
    const totalCopies = Number(form.totalCopies);
    const publishedYear = form.publishedYear
      ? Number(form.publishedYear)
      : null;

    if (!title || !author || !isbn || !form.category) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!Number.isInteger(totalCopies) || totalCopies < 1) {
      setError("Total copies must be a whole number of at least 1.");
      return;
    }

    if (
      publishedYear !== null &&
      (!Number.isInteger(publishedYear) ||
        publishedYear < 0 ||
        publishedYear > new Date().getFullYear())
    ) {
      setError("Enter a valid published year.");
      return;
    }

    onSave({
      title,
      author,
      isbn,
      category: form.category,
      totalCopies,
      publishedYear,
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
        aria-labelledby="book-modal-title"
        className="my-auto w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              Book inventory
            </p>
            <h2
              id="book-modal-title"
              className="mt-2 text-2xl font-bold tracking-tight text-slate-900"
            >
              {book ? "Edit book" : "Add a new book"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {book
                ? "Update this book's details."
                : "Add a title to your library collection."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-600 hover:bg-slate-200"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="title"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Book title *
              </label>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={updateField}
                required
                autoFocus
                placeholder="e.g. The Psychology of Money"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="author"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Author *
              </label>
              <input
                id="author"
                name="author"
                value={form.author}
                onChange={updateField}
                required
                placeholder="Author's full name"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="isbn"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                ISBN *
              </label>
              <input
                id="isbn"
                name="isbn"
                value={form.isbn}
                onChange={updateField}
                required
                placeholder="ISBN number"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={updateField}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="totalCopies"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Total copies *
              </label>
              <input
                id="totalCopies"
                name="totalCopies"
                type="number"
                min="1"
                step="1"
                value={form.totalCopies}
                onChange={updateField}
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>

            <div>
              <label
                htmlFor="publishedYear"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Published year
              </label>
              <input
                id="publishedYear"
                name="publishedYear"
                type="number"
                min="0"
                max={new Date().getFullYear()}
                value={form.publishedYear}
                onChange={updateField}
                placeholder="e.g. 2020"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
           <button
  type="submit"
  disabled={saving}
  className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
>
  {saving
    ? "Saving..."
    : book
      ? "Save changes"
      : "Add book"}
</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function BooksPage() {
const [books, setBooks] = useState([]);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [availabilityFilter, setAvailabilityFilter] = useState("All books");
  const [modalBook, setModalBook] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteBook, setDeleteBook] = useState(null);
  const [notice, setNotice] = useState("");

  
async function loadBooks() {
  setLoading(true);

  try {
    const result = await apiRequest("/books");
    const rows = Array.isArray(result.data) ? result.data : [];

    setBooks(
      rows.map((book) => ({
        ...book,
        id: book._id,
        publishedYear: book.publishedYear ?? "",
        availableCopies: book.availableCopies ?? 0,
      }))
    );
  } catch (error) {
    setNotice(error.message || "Failed to load books.");
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  loadBooks();
}, []);

  const filteredBooks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return books.filter((book) => {
      const matchesSearch =
        !query ||
        [book.title, book.author, book.isbn, book.category].some((value) =>
          value.toLowerCase().includes(query)
        );

      const matchesCategory =
        categoryFilter === "All categories" ||
        book.category === categoryFilter;

      const matchesAvailability =
        availabilityFilter === "All books" ||
        (availabilityFilter === "Available" && book.availableCopies > 0) ||
        (availabilityFilter === "Out of stock" && book.availableCopies === 0);

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [books, search, categoryFilter, availabilityFilter]);

  const totalCopies = books.reduce((sum, book) => sum + book.totalCopies, 0);
  const availableCopies = books.reduce(
    (sum, book) => sum + book.availableCopies,
    0
  );
  const issuedCopies = totalCopies - availableCopies;


async function saveBook(form) {
  setNotice("");

  const payload = {
    title: form.title,
    author: form.author,
    isbn: form.isbn,
    category: form.category,
    totalCopies: Number(form.totalCopies),
    ...(form.publishedYear !== null &&
    form.publishedYear !== undefined &&
    form.publishedYear !== ""
      ? { publishedYear: Number(form.publishedYear) }
      : {}),
  };

  setSaving(true);

  try {
    if (modalBook) {
      await apiRequest(`/books/${modalBook.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      setNotice("Book updated successfully.");
    } else {
      await apiRequest("/books", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setNotice("Book added successfully.");
    }

    await loadBooks();
    setModalOpen(false);
    setModalBook(null);
  } catch (error) {
    setNotice(error.message || "Failed to save book.");
  } finally {
    setSaving(false);
  }
}

  function openAddModal() {
    setNotice("");
    setModalBook(null);
    setModalOpen(true);
  }

  function openEditModal(book) {
    setNotice("");
    setModalBook(book);
    setModalOpen(true);
  }


async function confirmDelete() {
  if (!deleteBook) return;

  setNotice("");

  try {
    await apiRequest(`/books/${deleteBook.id}`, {
      method: "DELETE",
    });

    setNotice(`"${deleteBook.title}" was deleted successfully.`);
    setDeleteBook(null);
    await loadBooks();
  } catch (error) {
    setNotice(error.message || "Failed to delete book.");
    setDeleteBook(null);
  }
}


  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-emerald-700">Books</span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Book inventory
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Manage your collection, track availability, and keep your library
            organized.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
        >
          <span className="text-lg leading-none">+</span>
          Add new book
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

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Unique titles",
            value: books.length,
            hint: "Different books in collection",
            icon: "▤",
            color: "bg-slate-100 text-slate-700",
          },
          {
            label: "Total copies",
            value: totalCopies.toLocaleString(),
            hint: "Copies owned by the library",
            icon: "▣",
            color: "bg-blue-50 text-blue-700",
          },
          {
            label: "Available copies",
            value: availableCopies.toLocaleString(),
            hint: `${issuedCopies} copies currently issued`,
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
                className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${stat.color}`}
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
                All books{" "}
                <span className="ml-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                  {filteredBooks.length}
                </span>
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Search and filter your library collection.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:w-[520px]">
          

              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                aria-label="Filter by category"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              >
                <option>All categories</option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>

              <select
                value={availabilityFilter}
                onChange={(event) => setAvailabilityFilter(event.target.value)}
                aria-label="Filter by availability"
                className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 sm:col-span-2"
              >
                <option>All books</option>
                <option>Available</option>
                <option>Out of stock</option>
              </select>
            </div>
          </div>
        </div>

{!loading && (
        <div className="hidden overflow-x-auto md:block">
          {loading && (
  <div className="px-6 py-12 text-center text-sm text-slate-500">
    Loading books from your library...
  </div>
)}
          <table className="w-full min-w-[820px] text-left">
            <thead className="bg-slate-50/80">
              <tr className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Book details</th>
                <th className="px-4 py-4">Category / ISBN</th>
                <th className="px-4 py-4">Copies</th>
                <th className="px-4 py-4">Availability</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredBooks.map((book, index) => (
                <tr
                  key={book.id}
                  className="transition hover:bg-slate-50/70"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold ${
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
                      <div className="min-w-0">
                        <p className="max-w-[240px] truncate text-sm font-bold text-slate-800">
                          {book.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {book.author}
                        </p>
                        {book.publishedYear > 0 && (
                          <p className="mt-1 text-xs text-slate-400">
                            Published {book.publishedYear}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-sm font-medium text-slate-700">
                      {book.category}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">{book.isbn}</p>
                  </td>

                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-slate-800">
                      {book.totalCopies} total
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {book.totalCopies - book.availableCopies} issued
                    </p>
                  </td>

                  <td className="px-4 py-4">
                    <AvailabilityBadge
                      available={book.availableCopies}
                      total={book.totalCopies}
                    />
                    <p className="mt-2 text-xs text-slate-500">
                      {book.availableCopies} available
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(book)}
                        aria-label={`Edit ${book.title}`}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNotice("");
                          setDeleteBook(book);
                        }}
                        aria-label={`Delete ${book.title}`}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        <div className="space-y-3 p-4 md:hidden">
          {filteredBooks.map((book, index) => (
            <article
              key={book.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-12 w-10 shrink-0 items-center justify-center rounded-lg text-lg ${
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
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    {book.title}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500">{book.author}</p>
                  <p className="mt-1 break-all text-xs text-slate-400">
                    ISBN: {book.isbn}
                  </p>
                </div>
                <AvailabilityBadge
                  available={book.availableCopies}
                  total={book.totalCopies}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs">
                <div>
                  <p className="text-slate-500">Category</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {book.category}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Available / Total</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {book.availableCopies} / {book.totalCopies}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(book)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNotice("");
                    setDeleteBook(book);
                  }}
                  className="flex-1 rounded-lg border border-rose-100 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>

       {!loading && filteredBooks.length === 0 && (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-500">
              ▤
            </div>
            <h3 className="mt-4 font-bold text-slate-900">No books found</h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Try another search or change your filters to find books in your
              collection.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategoryFilter("All categories");
                setAvailabilityFilter("All books");
              }}
              className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
            >
              Clear all filters
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {filteredBooks.length} of {books.length} book titles
          </p>
        <p>Live inventory · Connected to MongoDB</p>
        </div>
      </section>

      {modalOpen && (
    <BookFormModal
  key={modalBook?.id ?? "new-book"}
  book={modalBook}
  saving={saving}
  onClose={() => {
    setModalOpen(false);
    setModalBook(null);
  }}
  onSave={saveBook}
/>
      )}

      {deleteBook && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-xl text-rose-600">
              !
            </div>
            <h2
              id="delete-title"
              className="mt-4 text-xl font-bold text-slate-900"
            >
              Delete this book?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Remove <strong>{deleteBook.title}</strong> from your library inventory?
              This action cannot be undone.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteBook(null)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white hover:bg-rose-700"
              >
                Delete book
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
