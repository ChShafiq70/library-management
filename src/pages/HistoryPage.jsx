import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Stamp from "../components/Stamp";

export default function HistoryPage() {
  const { role } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      if (role === "student" || role === "superadmin") {
        const { data } = await api.get("/borrow/my-history");
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

  return (
    <div>
      <div className="mb-8">
        <span className="text-sm text-gray-500 uppercase tracking-wide">History</span>
        <h1 className="text-3xl font-bold mt-2">Your Borrow History</h1>
        <p className="text-gray-600 mt-1">
          Review all your past and present borrow records.
        </p>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {loading ? (
        <p className="text-gray-500">Loading history…</p>
      ) : records.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700">Nothing here</h3>
          <p className="text-gray-500 mt-2">
            No borrow history found.
          </p>
        </div>
      ) : (
        records.map((record) => (
          <div className="bg-white p-4 rounded-lg shadow-md mb-4" key={record.id}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-base sm:text-lg font-semibold">
                  <span className="truncate block">{record.book?.title}</span>
                  <span className="text-xs sm:text-sm font-normal text-gray-500">({record.quantity} copies)</span>
                </div>
                <div className="text-gray-600 text-sm truncate">
                  {role !== "student" && record.borrower ? `${record.borrower.name} · ` : ""}
                  {record.book?.author}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                  {record.dueDate
                    ? `Due ${new Date(record.dueDate).toLocaleDateString()}`
                    : "Awaiting approval"}
                </div>
              </div>
              <div className="flex items-center gap-2 justify-start sm:justify-end">
                <Stamp label={record.status} variant={record.status} />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
