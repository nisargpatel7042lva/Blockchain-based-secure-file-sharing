import { useState } from "react";
import { grantAccess, revokeAccess } from "../services/api.js";

export default function FileShare({ fileId, onSuccess }) {
  const [recipient, setRecipient] = useState("");
  const [expirationDays, setExpirationDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    
    if (!recipient || !fileId) {
      setError("Recipient address and file ID are required");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await grantAccess(fileId, recipient, expirationDays);
      setSuccess(`Access granted! Transaction: ${response.txHash.slice(0, 10)}...`);
      setRecipient("");
      if (onSuccess) {
        onSuccess(response);
      }
    } catch (err) {
      setError(err.message || "Failed to grant access");
      console.error("Error granting access:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Share File #{fileId}</h3>
      
      <form onSubmit={handleGrantAccess} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x..."
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Expiration (days)
          </label>
          <input
            type="number"
            value={expirationDays}
            onChange={(e) => setExpirationDays(parseInt(e.target.value) || 0)}
            min="0"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            {expirationDays === 0 ? "No expiration" : `Expires in ${expirationDays} days`}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition"
        >
          {loading ? "Granting Access..." : "Grant Access"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
          {success}
        </div>
      )}
    </div>
  );
}

