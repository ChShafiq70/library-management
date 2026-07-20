import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Stamp from "../components/Stamp";

export default function BorrowPage() {
  const { role } = useAuth();
  const [tab, setTab] = useState(role === "student" || role === "superadmin" ? "mine" : "pending");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      if (role === "student" || role === "superadmin") {
        const { data } = await api.get("/borrow/my-history");
        setRecords(data.data);
      } else {
        const { data } = await api.get("/borrow");
        setRecords(data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not load borrow records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const handleDecision = async (id, decision) => {
    setBusyId(id);
    setError("");
    try {
      await api.patch(`/borrow/${id}/decision`, { decision });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not process this request.");
    } finally {
      setBusyId(null);
    }
  };

  const handleReturn = async (id) => {
    setBusyId(id);
    setError("");
    try {
      await api.patch(`/borrow/${id}/return`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not mark this as returned.");
    } finally {
      setBusyId(null);
    }
  };

  const visibleRecords =
    role === "librarian" && tab === "pending"
      ? records.filter((r) => r.status === "pending")
      : records;

  return (
    <div>
      <div className="mb-8">
        <span className="text-sm text-gray-500 uppercase tracking-wide">Circulation desk</span>
        <h1 className="text-3xl font-bold mt-2">{role === "student" ? "Your borrowed titles" : "Borrow requests"}</h1>
        <p className="text-gray-600 mt-1">
          {role === "student"
            ? "Track what you've requested, borrowed, and returned."
            : "Review requests and keep an eye on everything in circulation."}
        </p>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {role === "librarian" && (
        <div className="flex gap-2 mb-6">
          <button 
            className={`px-4 py-2 rounded-md transition-colors ${
              tab === "pending" 
                ? "bg-blue-500 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`} 
            onClick={() => setTab("pending")}
          >
            Pending requests
          </button>
          <button 
            className={`px-4 py-2 rounded-md transition-colors ${
              tab === "all" 
                ? "bg-blue-500 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`} 
            onClick={() => setTab("all")}
          >
            All records
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Checking the ledger…</p>
      ) : visibleRecords.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700">Nothing here</h3>
          <p className="text-gray-500 mt-2">
            {tab === "pending" ? "No pending requests right now." : "No borrow records yet."}
          </p>
        </div>
      ) : (
        visibleRecords.map((record) => (
          <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex items-center gap-4" key={record.id}>
            <div className="flex-1">
              <div className="text-lg font-semibold">{record.book?.title}</div>
              <div className="text-gray-600">
                {role !== "student" && record.borrower ? `${record.borrower.name} · ` : ""}
                {record.book?.author}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {record.dueDate
                  ? `Due ${new Date(record.dueDate).toLocaleDateString()}`
                  : "Awaiting approval"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Stamp label={record.status} variant={record.status} />
              {role === "librarian" && record.status === "pending" && (
                <>
                  <button
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400"
                    disabled={busyId === record.id}
                    onClick={() => handleDecision(record.id, "approved")}
                  >
                    Approve
                  </button>
                  <button
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors disabled:bg-gray-400"
                    disabled={busyId === record.id}
                    onClick={() => handleDecision(record.id, "rejected")}
                  >
                    Reject
                  </button>
                </>
              )}
              {record.status === "approved" &&
                (role === "librarian" || role === "student") && (
                  <button
                    className="px-3 py-1 border border-gray-300 text-sm rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:bg-gray-400"
                    disabled={busyId === record.id}
                    onClick={() => handleReturn(record.id)}
                  >
                    {busyId === record.id ? "Returning…" : "Mark returned"}
                  </button>
                )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}