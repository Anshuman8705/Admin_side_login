import React, { useState, useEffect, useRef } from 'react';
import ClientSelectDropdown from './ClientSelectDropdown';
import { fetchClientDocuments, uploadClientDocument, downloadDocumentFile, fetchDocumentFile } from '../services/api';
import FileViewerModal from './modals/FileViewerModal';

export default function FilesView({ clients = [], activeClientId, onSelectClient }) {
  const [selectedClientId, setSelectedClientId] = useState(activeClientId || (clients[0]?.id || ''));
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [viewerFile, setViewerFile] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerFileTitle, setViewerFileTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);

  const currentClient = clients.find(c => c.id === selectedClientId) || clients[0];

  useEffect(() => {
    if (activeClientId && activeClientId !== selectedClientId) {
      setSelectedClientId(activeClientId);
    }
  }, [activeClientId]);

  useEffect(() => {
    if (selectedClientId) {
      loadFiles(selectedClientId);
    }
  }, [selectedClientId]);

  async function loadFiles(clientId) {
    if (!clientId) return;
    setLoading(true);
    setErrorMessage('');
    try {
      // Reusing documents API temporarily for UI mocking
      const docs = await fetchClientDocuments(clientId);
      setFiles(docs);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load files');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }

  function handleClientChange(e) {
    const newId = e.target.value;
    setSelectedClientId(newId);
    if (onSelectClient) {
      onSelectClient(newId);
    }
  }

  async function handleDownload(fileObj) {
    setDownloadingId(fileObj.id);
    setErrorMessage('');
    try {
      await downloadDocumentFile(fileObj.id, fileObj.original_filename);
    } catch (err) {
      setErrorMessage(`Failed to download ${fileObj.document_name}: ${err.message}`);
    } finally {
      setDownloadingId(null);
    }
  }

  async function handleView(fileObj) {
    setViewingId(fileObj.id);
    setErrorMessage('');
    try {
      const data = await fetchDocumentFile(fileObj.id, fileObj.original_filename);
      setViewerFile(data);
      setViewerFileTitle(fileObj.document_name);
      setIsViewerOpen(true);
    } catch (err) {
      setErrorMessage(`Failed to preview ${fileObj.document_name}: ${err.message}`);
    } finally {
      setViewingId(null);
    }
  }

  async function handleFileUpload(e) {
    const fileObj = e.target.files?.[0];
    if (!fileObj || !selectedClientId) return;

    setUploading(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await uploadClientDocument(selectedClientId, fileObj, fileObj.name.replace(/\.[^/.]+$/, ''), 'General File');
      setSuccessMessage(`File '${fileObj.name}' uploaded successfully.`);
      await loadFiles(selectedClientId);
    } catch (err) {
      setErrorMessage(err.message || 'File upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  return (
    <section className="view on" id="v-files">
      <div className="hdr-row">
        <div>
          <div className="eyebrow">Client Repository</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '2px 0 4px' }}>
            <ClientSelectDropdown
              clients={clients}
              value={selectedClientId}
              onChange={(val) => {
                setSelectedClientId(val);
                if (onSelectClient) {
                  onSelectClient(val);
                }
              }}
            />
            <h1 style={{ margin: 0 }}>Client Files</h1>
          </div>
          <p className="sub">General files, data samples, and miscellaneous attachments associated with <b>{currentClient?.name}</b>.</p>
        </div>
      </div>

      {errorMessage && (
        <div className="note" style={{ background: 'var(--brick-bg)', borderColor: 'var(--brick)', color: 'var(--brick)' }}>
          <b>Error:</b> {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="good">
          ✓ {successMessage}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-3)' }}>
          Loading files for {currentClient?.name}...
        </div>
      ) : files.length === 0 ? (
        <div className="stub" style={{ textAlign: 'center', padding: '36px' }}>
          <b>No files available for this client.</b>
          <p style={{ margin: '6px 0 0', color: 'var(--ink-2)' }}>
            Upload any required files or test data for {currentClient?.name} using the workflow.
          </p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ width: '20%' }}>File Name</th>
              <th style={{ width: '24%' }}>Original Filename</th>
              <th style={{ width: '16%' }}>Category</th>
              <th style={{ width: '8%' }}>Format</th>
              <th style={{ width: '8%' }}>Size</th>
              <th style={{ width: '9%' }}>Uploaded By</th>
              <th style={{ width: '7%' }}>Status</th>
              <th style={{ width: '8%', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map((fileObj) => {
              const ext = (fileObj.original_filename?.split('.').pop() || 'PDF').toUpperCase();
              return (
                <tr key={fileObj.id}>
                  <td>
                    <b>{fileObj.document_name}</b>
                  </td>
                  <td>
                    <code style={{ fontSize: '11.5px', wordBreak: 'break-all', display: 'inline-block' }}>
                      {fileObj.original_filename}
                    </code>
                  </td>
                  <td>{fileObj.document_type || 'General'}</td>
                  <td>
                    <span className="mono" style={{ fontSize: '11px' }}>{ext}</span>
                  </td>
                  <td className="num">{formatBytes(fileObj.file_size)}</td>
                  <td>{fileObj.uploaded_by || 'Admin User'}</td>
                  <td>
                    <span className={`tag ${fileObj.status === 'Executed' || fileObj.status === 'Validated' || fileObj.status === 'Uploaded' ? 'ok' : 'work'}`}>
                      {fileObj.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', verticalAlign: 'middle' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        type="button"
                        className="btn tiny icon-btn"
                        onClick={() => handleView(fileObj)}
                        title={`View ${fileObj.document_name}`}
                        aria-label={`View ${fileObj.document_name}`}
                        disabled={viewingId === fileObj.id}
                        style={{ background: 'var(--blue-bg)', borderColor: 'var(--blue)', color: 'var(--blue)' }}
                      >
                        {viewingId === fileObj.id ? '…' : '👁'}
                      </button>
                      <button
                        type="button"
                        className="btn tiny primary icon-btn"
                        disabled={downloadingId === fileObj.id}
                        onClick={() => handleDownload(fileObj)}
                        title={`Download ${fileObj.document_name}`}
                        aria-label={`Download ${fileObj.document_name}`}
                      >
                        {downloadingId === fileObj.id ? '…' : '⬇'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <FileViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        fileData={viewerFile}
        stepTitle={viewerFileTitle}
        stepNum=""
      />
    </section>
  );
}
