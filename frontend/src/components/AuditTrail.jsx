import { useState, useEffect } from "react";
import { getAuditTrail } from "../services/api.js";

export default function AuditTrail({ fileId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (fileId) {
      loadAuditTrail();
    }
  }, [fileId]);

  const loadAuditTrail = async () => {
    if (!fileId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getAuditTrail(fileId);
      setEvents(response.events || []);
    } catch (err) {
      setError(err.message || "Failed to load audit trail");
      console.error("Error loading audit trail:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!fileId) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-4 border rounded-lg text-center text-gray-500">
        Loading audit trail...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="p-4 border rounded-lg text-center text-gray-500">
        No access events recorded yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Audit Trail</h3>
        <button
          onClick={loadAuditTrail}
          className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 transition"
        >
          Refresh
        </button>
      </div>
      <div className="space-y-2">
        {events.map((event, index) => (
          <div
            key={index}
            className={`p-3 border rounded-lg ${
              event.success ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      event.success
                        ? "bg-green-200 text-green-800"
                        : "bg-red-200 text-red-800"
                    }`}
                  >
                    {event.success ? "Allowed" : "Denied"}
                  </span>
                  <span className="text-sm font-mono text-gray-600">
                    {event.user.slice(0, 6)}...{event.user.slice(-4)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(parseInt(event.timestamp) * 1000).toLocaleString()}
                </div>
              </div>
              <a
                href={`https://mumbai.polygonscan.com/tx/${event.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                View TX
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

