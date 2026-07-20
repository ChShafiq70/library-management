import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Stamp from "../components/Stamp";

const ROLE_OPTIONS = ["student", "librarian", "superadmin"];

export default function UsersPage() {
  const { role: myRole, user: me } = useAuth();
  const isSuperadmin = myRole === "superadmin";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      if (isSuperadmin) {
        const { data } = await api.get("/users");
        setUsers(data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not load members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRoleChange = async (id, newRole) => {
    setBusyId(id);
    setError("");
    try {
      await api.patch(`/users/${id}/role`, { role: newRole });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not change role.");
    } finally {
      setBusyId(null);
    }
  };

  const handleActiveToggle = async (userRow) => {
    setBusyId(userRow.id);
    setError("");
    try {
      const action = userRow.isActive ? "deactivate" : "activate";
      await api.patch(`/users/${userRow.id}/${action}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update account status.");
    } finally {
      setBusyId(null);
    }
  };

  const handleBlockToggle = async (userRow) => {
    setBusyId(userRow.id);
    setError("");
    try {
      const action = userRow.isBlocked ? "unblock" : "block";
      await api.patch(`/users/${userRow.id}/${action}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update block status.");
    } finally {
      setBusyId(null);
    }
  };

  if (!isSuperadmin) {
    return (
      <div>
        <div className="mb-8">
          <span className="text-sm text-gray-500 uppercase tracking-wide">Membership</span>
          <h1 className="text-3xl font-bold mt-2">Student accounts</h1>
          <p className="text-gray-600 mt-1">Block or unblock a student directly from the borrow desk or by their user ID.</p>
        </div>
        <BlockByIdCard onDone={() => {}} />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-500 uppercase tracking-wide">Membership</span>
          <h1 className="text-3xl font-bold mt-2">All members</h1>
          <p className="text-gray-600 mt-1">{users.length} account{users.length === 1 ? "" : "s"} on file</p>
        </div>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          onClick={() => setShowAddUserModal(true)}
        >
          + Add User
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {loading ? (
        <p className="text-gray-500">Pulling member files…</p>
      ) : (
        <table className="w-full bg-white rounded-lg shadow-md overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-gray-200">
                <td className="px-4 py-3">{u.name}{u.id === me?.id ? " (you)" : ""}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={u.role?.name}
                    disabled={busyId === u.id || u.id === me?.id}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 flex-wrap">
                    <Stamp label={u.isActive ? "active" : "inactive"} variant={u.isActive ? "available" : "blocked"} />
                    {u.isBlocked && <Stamp label="blocked" variant="blocked" />}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button
                    className="px-3 py-1 border border-gray-300 text-sm rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:bg-gray-400"
                    disabled={busyId === u.id || u.id === me?.id}
                    onClick={() => handleActiveToggle(u)}
                  >
                    {u.isActive ? "Deactivate" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showAddUserModal && <AddUserModal onClose={() => setShowAddUserModal(false)} onSuccess={load} />}
    </div>
  );
}

function BlockByIdCard() {
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const runAction = async (action) => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await api.patch(`/users/${studentId}/${action}`);
      setSuccess(`Student #${studentId} ${action}ed.`);
    } catch (err) {
      setError(err.response?.data?.message || `Could not ${action} that student.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md">
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Student user ID</label>
        <input
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          placeholder="e.g. 4"
        />
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:bg-gray-400" disabled={!studentId || loading} onClick={() => runAction("block")}>
          Block
        </button>
        <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400" disabled={!studentId || loading} onClick={() => runAction("unblock")}>
          Unblock
        </button>
      </div>
    </div>
  );
}

function AddUserModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/users", formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Add New User</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              required
              style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={6}
              style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Role</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              style={{ color: '#1f2937', backgroundColor: '#ffffff' }}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-400"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}