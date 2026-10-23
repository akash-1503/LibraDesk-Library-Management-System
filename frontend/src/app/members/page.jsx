
"use client";

import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";

const initialMembers = [
  {
    id: 1,
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+91 98765 43210",
    memberId: "MEM-1001",
    joinedDate: "2026-08-12",
    status: "Active",
    borrowedBooks: 2,
  },
  {
    id: 2,
    name: "Priya Patil",
    email: "priya.patil@example.com",
    phone: "+91 98765 43211",
    memberId: "MEM-1002",
    joinedDate: "2026-07-25",
    status: "Active",
    borrowedBooks: 1,
  },
  {
    id: 3,
    name: "Rohan Deshmukh",
    email: "rohan.d@example.com",
    phone: "+91 98765 43212",
    memberId: "MEM-1003",
    joinedDate: "2026-06-18",
    status: "Active",
    borrowedBooks: 3,
  },
  {
    id: 4,
    name: "Sneha Kulkarni",
    email: "sneha.k@example.com",
    phone: "+91 98765 43213",
    memberId: "MEM-1004",
    joinedDate: "2026-05-09",
    status: "Inactive",
    borrowedBooks: 0,
  },
  {
    id: 5,
    name: "Ishaan Joshi",
    email: "ishaan.j@example.com",
    phone: "+91 98765 43214",
    memberId: "MEM-1005",
    joinedDate: "2026-09-03",
    status: "Active",
    borrowedBooks: 1,
  },
  {
    id: 6,
    name: "Ananya Desai",
    email: "ananya.d@example.com",
    phone: "+91 98765 43215",
    memberId: "MEM-1006",
    joinedDate: "2026-09-15",
    status: "Active",
    borrowedBooks: 0,
  },
];

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  status: "Active",
};

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function formatDate(dateString) {
  if (!dateString) return "—";

  return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function MemberStatus({ status }) {
  const styles =
    status === "Active"
      ? "bg-emerald-50 text-emerald-700"
      : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}
    >
      <span
        className={`mr-1.5 mt-1 h-1.5 w-1.5 rounded-full ${
          status === "Active" ? "bg-emerald-500" : "bg-slate-400"
        }`}
      />
      {status}
    </span>
  );
}

function MemberModal({ member, onClose, onSave, saving }) {
  const [form, setForm] = useState(
    member
      ? {
          name: member.name,
          email: member.email,
          phone: member.phone,
          status: member.status,
        }
      : emptyForm
  );

  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

function handleSubmit(event) {
  event.preventDefault();
  setError("");

  const name = form.name.trim();
  const email = form.email.trim().toLowerCase();
  const phone = form.phone.trim();

  if (!name || !email || !phone) {
    setError("Please complete all required fields.");
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setError("Please enter a valid email address.");
    return;
  }

  const digits = phone.replace(/\D/g, "");

  if (digits.length < 7 || digits.length > 15) {
    setError("Enter a phone number containing 7–15 digits.");
    return;
  }

  onSave({ name, email, phone, status: form.status });
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
        aria-labelledby="member-modal-title"
        className="my-auto w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
              Member management
            </p>
            <h2
              id="member-modal-title"
              className="mt-2 text-2xl font-bold tracking-tight text-slate-900"
            >
              {member ? "Edit member" : "Register a member"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {member
                ? "Update this member's contact details and status."
                : "Add a new member to your library."}
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
          <div>
            <label
              htmlFor="member-name"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Full name *
            </label>
            <input
              id="member-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              autoFocus
              maxLength={100}
              placeholder="Enter member's full name"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div>
            <label
              htmlFor="member-email"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Email address *
            </label>
            <input
              id="member-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              maxLength={254}
              placeholder="member@example.com"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div>
            <label
              htmlFor="member-phone"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Phone number *
            </label>
            <input
              id="member-phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              required
              maxLength={25}
              placeholder="+91 98765 43210"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          {member && (
            <div>
              <label
                htmlFor="member-status"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Membership status
              </label>
              <select
                id="member-status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          )}

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
              className="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              {member ? "Save changes" : "Register member"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function MembersPage() {
const [members, setMembers] = useState([]);
const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [pageError, setPageError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All members");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteMember, setDeleteMember] = useState(null);
  const [notice, setNotice] = useState("");

  async function loadMembers() {
    setLoading(true);
    setPageError("");

    try {
      const result = await apiRequest("/members");
      const records = Array.isArray(result.data) ? result.data : [];

      setMembers(
        records.map((member) => ({
          ...member,
          id: member._id,
          borrowedBooks: Number(member.borrowedBooks ?? 0),
          joinedDate: member.joinedDate
            ? String(member.joinedDate).slice(0, 10)
            : member.createdAt
              ? String(member.createdAt).slice(0, 10)
              : "",
        }))
      );
    } catch (error) {
      setPageError(error.message || "Unable to load members.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMembers();
  }, []);

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const matchesSearch =
        !query ||
        [
          member.name,
          member.email,
          member.phone,
          member.memberId,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === "All members" ||
        member.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [members, search, statusFilter]);


  const activeMembers = members.filter(
    (member) => member.status === "Active"
  ).length;

  const inactiveMembers = members.length - activeMembers;

  const borrowedBooks = members.reduce(
    (total, member) => total + member.borrowedBooks,
    0
  );

  function openAddModal() {
    setNotice("");
    setEditingMember(null);
    setModalOpen(true);
  }

  function openEditModal(member) {
    setNotice("");
    setEditingMember(member);
    setModalOpen(true);
  }

async function saveMember(form) {
  setSaving(true);
  setNotice("");
  setPageError("");

  try {
    const payload = {
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      status: form.status,
    };

    if (editingMember) {
      await apiRequest(`/members/${editingMember.id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      setNotice("Member details updated successfully.");
    } else {
      await apiRequest("/members", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setNotice("New member registered successfully.");
    }

    setModalOpen(false);
    setEditingMember(null);

    await loadMembers();
  } catch (error) {
    setPageError(error.message || "Unable to save member.");
  } finally {
    setSaving(false);
  }
}

async function confirmDelete() {
  if (!deleteMember) return;

  setNotice("");
  setPageError("");

  try {
    await apiRequest(`/members/${deleteMember.id}`, {
      method: "DELETE",
    });

    setNotice(`${deleteMember.name} was removed successfully.`);
    setDeleteMember(null);

    await loadMembers();
  } catch (error) {
    setPageError(error.message || "Unable to delete member.");
    setDeleteMember(null);
  }
}

  return (
    <div className="space-y-7">
      {pageError && (
  <div
    role="alert"
    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
  >
    {pageError}
  </div>
)}

{loading && (
  <p className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500">
    Loading members...
  </p>
)}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
  <div>
    <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
      <span>Workspace</span>
      <span>/</span>
      <span className="text-emerald-700">Members</span>
    </div>

    <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
      Library members
    </h2>

          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Manage registrations, keep member records up to date, and track
            borrowing activity.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
        >
          <span className="text-lg leading-none">+</span>
          Register member
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

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total members",
            value: members.length,
            hint: "Registered library members",
            icon: "♙",
            color: "bg-slate-100 text-slate-700",
          },
          {
            label: "Active members",
            value: activeMembers,
            hint: "Membership currently active",
            icon: "✓",
            color: "bg-emerald-50 text-emerald-700",
          },
          {
            label: "Inactive members",
            value: inactiveMembers,
            hint: "Not currently active",
            icon: "—",
            color: "bg-amber-50 text-amber-700",
          },
          {
            label: "Books on loan",
            value: borrowedBooks,
            hint: "Across all listed members",
            icon: "▤",
            color: "bg-blue-50 text-blue-700",
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
                All members{" "}
                <span className="ml-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                  {filteredMembers.length}
                </span>
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Search and filter registered members.
              </p>
            </div>

       
          </div>
        </div>

    {!loading && filteredMembers.length > 0 && (
  <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50/80">
              <tr className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">Member</th>
                <th className="px-4 py-4">Contact</th>
                <th className="px-4 py-4">Joined</th>
                <th className="px-4 py-4">Books on loan</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredMembers.map((member, index) => (
                <tr
                  key={member.id}
                  className="transition hover:bg-slate-50/70"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          [
                            "bg-emerald-100 text-emerald-800",
                            "bg-blue-100 text-blue-800",
                            "bg-violet-100 text-violet-800",
                            "bg-amber-100 text-amber-800",
                          ][index % 4]
                        }`}
                      >
                        {getInitials(member.name)}
                      </div>

                      <div>
                        <p className="text-sm font-bold text-slate-800">
                          {member.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {member.memberId}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <p className="max-w-[220px] truncate text-sm text-slate-700">
                      {member.email}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {member.phone}
                    </p>
                  </td>

                  <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                    {formatDate(member.joinedDate)}
                  </td>

                  <td className="px-4 py-4">
                    <span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-slate-100 px-2.5 py-1.5 text-sm font-semibold text-slate-700">
                      {member.borrowedBooks}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <MemberStatus status={member.status} />
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEditModal(member)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setNotice("");
                          setDeleteMember(member);
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                      >
                        Remove
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
          {filteredMembers.map((member, index) => (
            <article
              key={member.id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    [
                      "bg-emerald-100 text-emerald-800",
                      "bg-blue-100 text-blue-800",
                      "bg-violet-100 text-violet-800",
                      "bg-amber-100 text-amber-800",
                    ][index % 4]
                  }`}
                >
                  {getInitials(member.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="break-words text-sm font-bold text-slate-900">
                    {member.name}
                  </h4>
                  <p className="mt-1 text-xs text-slate-500">
                    {member.memberId}
                  </p>
                  <p className="mt-2 break-all text-sm text-slate-600">
                    {member.email}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{member.phone}</p>
                </div>

                <MemberStatus status={member.status} />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs">
                <div>
                  <p className="text-slate-500">Joined</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {formatDate(member.joinedDate)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Books on loan</p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {member.borrowedBooks}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(member)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNotice("");
                    setDeleteMember(member);
                  }}
                  className="flex-1 rounded-lg border border-rose-100 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>

     {!loading && filteredMembers.length === 0 && (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl text-slate-500">
              ♙
            </div>
            <h3 className="mt-4 font-bold text-slate-900">
              No members found
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              Try a different search term or change the status filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("All members");
              }}
              className="mt-4 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
            >
              Clear filters
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Showing {filteredMembers.length} of {members.length} members
          </p>
         <p>Live database · Changes are saved automatically</p>
        </div>
      </section>

      {modalOpen && (
       <MemberModal
  key={editingMember?.id ?? "new-member"}
  member={editingMember}
  saving={saving}
  onClose={() => {
    setModalOpen(false);
    setEditingMember(null);
  }}
  onSave={saveMember}
/>
      )}

      {deleteMember && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-member-title"
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-7"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-xl text-rose-600">
              !
            </div>

            <h2
              id="delete-member-title"
              className="mt-4 text-xl font-bold text-slate-900"
            >
              Remove this member?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Remove <strong>{deleteMember.name}</strong> from the demo member
              list? Members with outstanding borrowed books cannot be removed.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteMember(null)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-rose-600 px-4 py-3 text-sm font-bold text-white hover:bg-rose-700"
              >
                Remove member
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
