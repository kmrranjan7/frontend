"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import type { UserDetails } from "@/lib/api/users";

type UserForm = {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
  status: string;
};

const emptyForm: UserForm = {
  firstName: "",
  lastName: "",
  email: "",
  mobile: "",
  password: "",
  status: "active",
};

type ApiPayload = {
  success?: boolean;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
};

export function UserDetailsManager({
  users: serverUsers,
  totalElements,
}: {
  users: readonly UserDetails[];
  totalElements: number;
}) {
  const router = useRouter();
  const [deletedUserIds, setDeletedUserIds] = useState<ReadonlySet<string>>(new Set());
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [editingUser, setEditingUser] = useState<UserDetails | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserDetails | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const users = serverUsers.filter((user) => !deletedUserIds.has(user.id));

  function openCreate() {
    setEditingUser(null);
    setForm(emptyForm);
    setFeedback(null);
    setFormOpen(true);
  }

  function openEdit(user: UserDetails) {
    setEditingUser(user);
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile,
      password: "",
      status: user.status,
    });
    setFeedback(null);
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;
    setFormOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
  }

  function updateField(field: keyof UserForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFeedback(null);

    const payload: Partial<UserForm> = { ...form };
    if (editingUser && !payload.password) delete payload.password;

    try {
      const response = await fetch(
        editingUser ? `/api/v1/users/${editingUser.id}` : "/api/v1/users",
        {
          method: editingUser ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = await response.json() as ApiPayload;

      if (!response.ok || !result.success) {
        const validationMessage = result.errors?.map((error) => error.message).join(" ");
        throw new Error(validationMessage || result.message || "Unable to save user.");
      }

      setFeedback({
        type: "success",
        message: editingUser ? "User updated successfully." : "User created successfully.",
      });
      setFormOpen(false);
      setEditingUser(null);
      setForm(emptyForm);
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to save user.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser() {
    if (!deletingUser) return;
    setDeleting(true);
    setFeedback(null);

    try {
      const response = await fetch(`/api/v1/users/${deletingUser.id}`, { method: "DELETE" });
      const result = await response.json() as ApiPayload;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to delete user.");
      }

      setDeletedUserIds((current) => new Set(current).add(deletingUser.id));
      setFeedback({ type: "success", message: "User deleted successfully." });
      setDeletingUser(null);
      router.refresh();
    } catch (error) {
      setFeedback({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to delete user.",
      });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <section className="listing-toolbar">
        <div>
          <h1 className="contacts-title">User details</h1>
          <p className="contacts-subtitle">Create and manage dashboard user records securely.</p>
        </div>
        <button className="button button-primary button-small" type="button" onClick={openCreate}>
          <Icon name="plus" size={16} /> Add user
        </button>
      </section>

      {feedback && (
        <div className={`user-feedback ${feedback.type}`} role="status">
          <span>{feedback.type === "success" ? "✓" : "!"}</span>
          <p>{feedback.message}</p>
          <button type="button" onClick={() => setFeedback(null)} aria-label="Dismiss message">×</button>
        </div>
      )}

      <section className="panel listing-panel">
        <div className="listing-summary">
          <div><h2>Users</h2><p>{totalElements} {totalElements === 1 ? "record" : "records"}</p></div>
        </div>
        {users.length ? (
          <div className="listing-table-wrap">
            <table className="listing-table user-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Mobile</th><th>Status</th><th>Created</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td><strong>{user.firstName} {user.lastName}</strong></td>
                    <td><a href={`mailto:${user.email}`}>{user.email}</a></td>
                    <td><a href={`tel:${user.mobile}`}>{user.mobile}</a></td>
                    <td><span className={`listing-status ${user.status === "active" ? "" : "draft"}`}>{user.status}</span></td>
                    <td>{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(user.createdAt))}</td>
                    <td>
                      <div className="row-actions">
                        <button type="button" onClick={() => openEdit(user)}>Edit</button>
                        <button type="button" onClick={() => setDeletingUser(user)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="listing-empty">
            <Icon name="users" size={28} />
            <h3>No users found</h3>
            <p>Add your first dashboard user to get started.</p>
          </div>
        )}
      </section>

      {formOpen && (
        <div className="delete-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeForm();
        }}>
          <section className="user-form-modal" role="dialog" aria-modal="true" aria-labelledby="user-form-title">
            <div className="user-modal-heading">
              <div><span>{editingUser ? "EDIT USER" : "NEW USER"}</span><h2 id="user-form-title">{editingUser ? "Update user details" : "Create user account"}</h2></div>
              <button type="button" onClick={closeForm} aria-label="Close user form">×</button>
            </div>
            <form onSubmit={saveUser}>
              <div className="user-form-grid">
                <label><span>First name *</span><input required maxLength={100} value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} /></label>
                <label><span>Last name *</span><input required maxLength={100} value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} /></label>
                <label className="wide"><span>Email address *</span><input required type="email" maxLength={255} value={form.email} onChange={(event) => updateField("email", event.target.value)} /></label>
                <label><span>Mobile number *</span><input required type="tel" maxLength={20} value={form.mobile} onChange={(event) => updateField("mobile", event.target.value)} /></label>
                <label><span>Status</span><select value={form.status} onChange={(event) => updateField("status", event.target.value)}><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
                <label className="wide"><span>Password {editingUser ? "(leave blank to keep current)" : "*"}</span><input required={!editingUser} type="password" minLength={8} maxLength={72} autoComplete="new-password" value={form.password} onChange={(event) => updateField("password", event.target.value)} /></label>
              </div>
              <div className="delete-modal-actions user-form-actions">
                <button className="button button-quiet" type="button" onClick={closeForm} disabled={saving}>Cancel</button>
                <button className="button button-primary" type="submit" disabled={saving}>{saving ? "Saving…" : editingUser ? "Save changes" : "Create user"}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {deletingUser && (
        <div className="delete-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !deleting) setDeletingUser(null);
        }}>
          <section className="delete-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-user-title">
            <span className="delete-modal-icon">!</span>
            <div className="delete-modal-copy">
              <span>PERMANENT ACTION</span>
              <h2 id="delete-user-title">Delete this user?</h2>
              <p><strong>{deletingUser.firstName} {deletingUser.lastName}</strong> will be permanently removed. This action cannot be undone.</p>
            </div>
            <div className="delete-modal-actions">
              <button className="button button-quiet" type="button" onClick={() => setDeletingUser(null)} disabled={deleting}>Cancel</button>
              <button className="button delete-confirm-button" type="button" onClick={deleteUser} disabled={deleting}>{deleting ? "Deleting…" : "Delete permanently"}</button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
