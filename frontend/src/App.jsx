import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useAccount } from "wagmi";
import WalletConnect from "./components/WalletConnect.jsx";
import FileUpload from "./components/FileUpload.jsx";
import FileList from "./components/FileList.jsx";
import FileShare from "./components/FileShare.jsx";
import AuditTrail from "./components/AuditTrail.jsx";

function Home() {
  const { isConnected } = useAccount();
  const [selectedFile, setSelectedFile] = useState(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Blockchain File Sharing</h1>
          <p className="text-gray-600">
            Secure, decentralized file sharing with end-to-end encryption
          </p>
        </div>

        <div className="mb-6">
          <WalletConnect />
        </div>

        {isConnected && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Upload File</h2>
              <FileUpload
                onUploadSuccess={() => {
                  // Refresh file list if needed
                  window.location.reload();
                }}
              />
            </div>

            <div>
              <FileList onFileSelect={setSelectedFile} />
            </div>
          </div>
        )}

        {selectedFile && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <FileShare
                fileId={selectedFile.id}
                onSuccess={() => {
                  setSelectedFile(null);
                }}
              />
            </div>
            <div>
              <AuditTrail fileId={selectedFile.id} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">
                Blockchain File Sharing
              </Link>
              <div className="flex gap-4">
                <Link
                  to="/"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 transition"
                >
                  Home
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

