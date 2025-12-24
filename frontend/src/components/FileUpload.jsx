import { useState } from "react";
import { useAccount } from "wagmi";
import { useDropzone } from "react-dropzone";
import { uploadFile } from "../services/api.js";
import { encryptFile, generateKey, fileToArrayBuffer } from "../utils/encryption.js";

export default function FileUpload({ onUploadSuccess }) {
  const { address } = useAccount();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const onDrop = async (acceptedFiles) => {
    if (!acceptedFiles.length || !address) {
      setError("Please connect your wallet first");
      return;
    }

    const file = acceptedFiles[0];
    setUploading(true);
    setError(null);
    setProgress(0);
    setResult(null);

    try {
      // Generate encryption key
      const encryptionKey = generateKey();
      
      // Read file as ArrayBuffer
      const fileBuffer = await fileToArrayBuffer(file);
      
      // Encrypt file
      const encryptedBlob = await encryptFile(fileBuffer, encryptionKey);
      
      // Create a File object from encrypted blob
      const encryptedFile = new File([encryptedBlob], file.name, {
        type: "application/octet-stream",
      });

      // Upload to backend
      const response = await uploadFile(
        encryptedFile,
        address,
        setProgress
      );

      setResult({
        fileId: response.fileId,
        ipfsHash: response.ipfsHash,
        txHash: response.txHash,
        encryptionKey: response.encryptionKey,
      });

      if (onUploadSuccess) {
        onUploadSuccess(response);
      }
    } catch (err) {
      setError(err.message || "Upload failed");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: uploading || !address,
  });

  if (!address) {
    return (
      <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
        Please connect your wallet to upload files
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="space-y-2">
            <div className="text-lg font-semibold">Uploading...</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">{progress}%</div>
          </div>
        ) : (
          <div>
            <p className="text-lg font-semibold">
              {isDragActive
                ? "Drop the file here"
                : "Drag & drop a file here, or click to select"}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Files are encrypted before upload
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded space-y-2">
          <div className="font-semibold">Upload successful!</div>
          <div className="text-sm space-y-1">
            <div>
              <span className="font-medium">File ID:</span>{" "}
              <span className="font-mono">{result.fileId}</span>
            </div>
            <div>
              <span className="font-medium">IPFS Hash:</span>{" "}
              <span className="font-mono break-all">{result.ipfsHash}</span>
            </div>
            <div>
              <span className="font-medium">Transaction Hash:</span>{" "}
              <a
                href={`https://sepolia.etherscan.io/tx/${result.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                {result.txHash.slice(0, 10)}...
              </a>
            </div>
            <div className="mt-2 p-2 bg-yellow-100 rounded text-xs">
              <span className="font-medium">Important:</span> Save your encryption key:{" "}
              <span className="font-mono break-all">{result.encryptionKey}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

