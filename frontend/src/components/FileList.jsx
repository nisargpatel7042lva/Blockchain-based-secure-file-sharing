import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { getFilesByOwner } from "../services/api.js";

export default function FileList({ onFileSelect }) {
  const { address } = useAccount();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (address) {
      loadFiles();
    }
  }, [address]);

  const loadFiles = async () => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getFilesByOwner(address);
      setFiles(response.files || []);
    } catch (err) {
      setError(err.message || "Failed to load files");
      console.error("Error loading files:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="p-6 border rounded-lg text-center text-gray-500">
        Connect your wallet to view your files
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 border rounded-lg text-center">
        <div className="text-gray-500">Loading files...</div>
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

  if (files.length === 0) {
    return (
      <div className="p-6 border rounded-lg text-center text-gray-500">
        No files uploaded yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Files</h2>
        <button
          onClick={loadFiles}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Refresh
        </button>
      </div>
      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition"
            onClick={() => onFileSelect && onFileSelect(file)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium">File #{file.id}</div>
                <div className="text-sm text-gray-600 mt-1">
                  <div className="font-mono text-xs break-all">
                    IPFS: {file.ipfsHash}
                  </div>
                  <div className="mt-1">
                    Uploaded: {new Date(parseInt(file.timestamp) * 1000).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

