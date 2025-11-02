import React, { useState, useEffect } from "react";
import { Loader2, Upload, CheckCircle, AlertCircle, Download, ChevronRight, ChevronLeft, Eye, EyeOff, FileImage, Brain, Activity, ZoomIn, ZoomOut, X } from "lucide-react";
import "./Demo.css";
const API_BASE = import.meta.env.VITE_API_BASE_URL

// localStorage keys for persistence
const LS_KEYS = {
  fileMeta: "demo_file_meta",
  fileDataURL: "demo_file_dataurl",
  model: "demo_model",
  magval: "demo_magval",
};

// helpers to read/write file previews
const readFileAsDataURL = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const dataURLToFile = async (dataUrl, filename, type) => {
  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename || "file", { type: type || blob.type });
  } catch {
    return null;
  }
};

const Demo = () => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("");
  const [xaiMethod, setXaiMethod] = useState("");
  const [magval, setMagval] = useState("");
  const [result, setResult] = useState(null);
  const [viewMode, setViewMode] = useState("summary"); // "summary" or "detailed"
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  // track per-step status -> null | 'success' | 'error'
  const [stepStatus, setStepStatus] = useState({ 1: null, 2: null, 3: null });

  // Image modal state (for Summary view image click)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState(null);
  const [zoom, setZoom] = useState(1);

  // small helper to format file size
  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B","KB","MB","GB","TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // persist file (meta + preview) and set state
  const persistAndSetFile = async (selected) => {
    setFile(selected);
    // save meta
    try {
      localStorage.setItem(
        LS_KEYS.fileMeta,
        JSON.stringify({ name: selected.name, size: selected.size, type: selected.type })
      );
    } catch {
      // ignore quota/meta errors
    }
    // save preview for images
    if (selected.type?.startsWith("image/")) {
      try {
        const dataUrl = await readFileAsDataURL(selected);
        setPreview(dataUrl);
        localStorage.setItem(LS_KEYS.fileDataURL, dataUrl);
      } catch {
        // fallback to non-persistent preview
        setPreview(URL.createObjectURL(selected));
        localStorage.removeItem(LS_KEYS.fileDataURL);
      }
    } else {
      setPreview(null);
      localStorage.removeItem(LS_KEYS.fileDataURL);
    }
  };

  // Handle file selection
  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (selected) {
      await persistAndSetFile(selected);
      setError(null);
    }
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selected = e.dataTransfer.files[0];
      await persistAndSetFile(selected);
      setError(null);
    }
  };

  // Send file to Flask backend
  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData,
      });

      let data = null;
      try { data = await res.json(); } catch {
        /* ignore non-JSON */
      }
      console.log("Upload response:", data ?? res.status);

      const isSuccess =
        res.ok ||
        (typeof data?.status === "string" && data.status.toLowerCase() === "success") ||
        (typeof data?.message === "string" && data.message.toLowerCase().includes("success"));

      if (isSuccess) {
        setStepStatus((s) => ({ ...s, 1: "success" }));
        setStep(2); // go to Step 2 after successful upload
      } else {
        setStepStatus((s) => ({ ...s, 1: "error" }));
        setError(data?.message || "Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      setStepStatus((s) => ({ ...s, 1: "error" }));
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Send model + method + magval to Flask backend
  const handleGenerate = async () => {
    if (!model || !xaiMethod || !magval) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/inputform`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model,
          xaiMethod: xaiMethod,
          magval: magval,
        }),
      });
      const data = await res.json();
      console.log("Result:", data);
      setResult(data);
      const normalized = {
        ...data,
        image1: data.results?.originalImage || "",
        mask1: data.results?.maskImage || "",
        inter1: data.results?.heatmapImage || "",
        table1: data.results?.tableImage || "",
      };
      normalized.classification = data.classification || "Unknown";
      setResult(normalized);
      
      setStepStatus((s) => ({ ...s, 2: "success", 3: data && data.image1 ? "success" : s[3] }));
      setStep(3);
    } catch (error) {
      console.error("Processing failed:", error);
      setStepStatus((s) => ({ ...s, 2: "error" }));
      setError("Processing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = (num) => {
    // Allow current, previous, or next completed step navigation
    const canGoTo = (target) => {
      if (target <= step) return true;
      if (target === 2) return stepStatus[1] === "success";
      if (target === 3) return stepStatus[1] === "success" && stepStatus[2] === "success";
      return false;
    };
    if (canGoTo(num)) setStep(num);
  };

  // rehydrate on mount
  useEffect(() => {
    // restore model and magval
    const savedModel = localStorage.getItem(LS_KEYS.model);
    if (savedModel) handleModelChange(savedModel);
    const savedMag = localStorage.getItem(LS_KEYS.magval);
    if (savedMag !== null) setMagval(savedMag);

    // restore file (if an image was saved)
    const metaStr = localStorage.getItem(LS_KEYS.fileMeta);
    const dataUrl = localStorage.getItem(LS_KEYS.fileDataURL);
    if (metaStr && dataUrl) {
      try {
        const meta = JSON.parse(metaStr);
        (async () => {
          const reconstructed = await dataURLToFile(dataUrl, meta.name, meta.type);
          if (reconstructed) setFile(reconstructed);
          setPreview(dataUrl);
        })();
      } catch {
        // ignore malformed storage
      }
    }
  }, []);

  // keep model/magval in localStorage
  useEffect(() => {
    if (model) localStorage.setItem(LS_KEYS.model, model);
    else localStorage.removeItem(LS_KEYS.model);
  }, [model]);

  useEffect(() => {
    if (magval !== "") localStorage.setItem(LS_KEYS.magval, magval);
    else localStorage.removeItem(LS_KEYS.magval);
  }, [magval]);

  const resetAll = () => {
    setFile(null);
    setPreview(null);
    setModel("");
    setXaiMethod("");
    setMagval("");
    setResult(null);
    setError(null);
    setLoading(false);
    setStepStatus({ 1: null, 2: null, 3: null });
    setViewMode("summary");
    setStep(1);
    // clear persisted state
    localStorage.removeItem(LS_KEYS.fileMeta);
    localStorage.removeItem(LS_KEYS.fileDataURL);
    localStorage.removeItem(LS_KEYS.model);
    localStorage.removeItem(LS_KEYS.magval);
  };

  // Image modal controls
  const openModal = (src) => {
    setModalSrc(src);
    setZoom(1);
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  };
  const closeModal = () => {
    setModalOpen(false);
    setModalSrc(null);
    document.body.style.overflow = "";
  };
  const zoomIn = () => setZoom((z) => Math.min(5, z + 0.25));
  const zoomOut = () => setZoom((z) => Math.max(0.5, z - 0.25));
  const resetZoom = () => setZoom(1);
  const handleWheel = (e) => {
    e.preventDefault();
    const dir = Math.sign(e.deltaY);
    setZoom((z) => {
      const next = z + (dir < 0 ? 0.1 : -0.1);
      return Math.min(5, Math.max(0.5, next));
    });
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") closeModal(); };
    if (modalOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  // Render images in Summary View
  const renderSummaryView = () => {
    if (!result || !result.image1 || !result.mask1) return null;

    return (
      <div className="summary-view">
        {result?.classification && (
          <div className="classification-box">
            <h4>Predicted Classification</h4>
            <p className={`classification-label ${result.classification.charAt(0).toUpperCase() + result.classification.slice(1).toLowerCase()}`}>
            {result.classification}
            </p>
          </div>
        )}
        <div className="image-pair">
          <div className="pair-item">
            <div className="image-header">
              <FileImage size={20} />
              <h4>Original Image</h4>
            </div>
            <div className="image-container">
              <img
                className="img-clickable"
                onClick={() => openModal(`data:image/jpeg;base64,${result.image1}`)}
                src={`data:image/jpeg;base64,${result.image1}`}
                alt="Original"
              />
            </div>
          </div>
          <div className="grid-item">
            <div className="image-header">
              <Brain size={20} />
              <h4>XAI Heatmap</h4>
            </div>
            <div className="image-container">
              <img
                className="img-clickable"
                onClick={() => openModal(`data:image/jpeg;base64,${result.inter1}`)}
                src={`data:image/jpeg;base64,${result.inter1}`}
                alt="Heatmap"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render images in Detailed View
  const renderDetailedView = () => {
    if (!result || !result.image1) return null;

    // Check for heatmapImage in the new response structure
    const heatmapImage = result?.results?.heatmapImage;

    return (
      <div className="detailed-view">
        {result?.classification && (
          <div className="classification-box">
            <h4>Predicted Classification</h4>
            <p className={`classification-label ${result.classification.charAt(0).toUpperCase() + result.classification.slice(1).toLowerCase()}`}>
            {result.classification}
            </p>
          </div>
        )}        
        <div className="image-grid">
          <div className="grid-item">
            <div className="image-header">
              <FileImage size={20} />
              <h4>Original Image</h4>
            </div>
            <div className="image-container">
              <img
                className="img-clickable"
                onClick={() => openModal(`data:image/jpeg;base64,${result.image1}`)}
                src={`data:image/jpeg;base64,${result.image1}`}
                alt="Original"
              />
            </div>
          </div>
          <div className="grid-item">
            <div className="image-header">
              <Brain size={20} />
              <h4>XAI Heatmap</h4>
            </div>
            <div className="image-container">
              <img
                className="img-clickable"
                onClick={() => openModal(`data:image/jpeg;base64,${result.inter1}`)}
                src={`data:image/jpeg;base64,${result.inter1}`}
                alt="Heatmap"
              />
            </div>
          </div>
          <div className="grid-item">
            <div className="image-header">
              <Activity size={20} />
              <h4>Segmentation Mask</h4>
            </div>
            <div className="image-container">
              <img
                className="img-clickable"
                onClick={() => openModal(`data:image/jpeg;base64,${result.mask1}`)}
                src={`data:image/jpeg;base64,${result.mask1}`}
                alt="Mask"
              />
            </div>
          </div>
          <div className="grid-item">
            <div className="image-header">
              <Activity size={20} />
              <h4>Cell Descriptor</h4>
            </div>
            <div className="image-container">
              <img
                className="img-clickable"
                onClick={() => openModal(`data:image/jpeg;base64,${result.table1}`)}
                src={`data:image/jpeg;base64,${result.table1}`}
                alt="Table"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Download results functionality
  const handleDownload = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/zip`, {
        method: "GET",
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "output.zip");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      setError("Download failed. Please try again.");
    }
  };

  // When user selects model, auto-assign XAI method
  const handleModelChange = (value) => {
    setModel(value);
    if (value === "vgg16") {
      setXaiMethod("LRP");
    } else if (value === "xception") {
      setXaiMethod("GradCAM++");
    } else {
      setXaiMethod("");
    }
  };

  return (
    <>
      <br />
      <br />
      <section className="demo">
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress">
            {[1, 2, 3].map((num, idx) => (
              <React.Fragment key={num}>
                <button
                  type="button"
                  className={`progress-step ${stepStatus[num] ?? ""} ${step === num ? "current" : ""}`}
                  onClick={() => handleStepClick(num)}
                  aria-current={step === num}
                >
                  <div className="step-icon">
                    {stepStatus[num] === "success" ? (
                      <CheckCircle size={24} />
                    ) : stepStatus[num] === "error" ? (
                      <AlertCircle size={24} />
                    ) : (
                      <span className="step-number">{num}</span>
                    )}
                  </div>
                  {/* step labels removed */}
                </button>

                {idx < 2 && (
                  <div
                    className={`progress-connector ${stepStatus[num] === "success" ? "success" : stepStatus[num] === "error" ? "error" : ""}`}
                    aria-hidden
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="demo-step">
            <div className="step-header">
              <h3>Step 1: Upload Image</h3>
              <p>Upload a medical image for analysis</p>
            </div>

            {!file ? (
              // No file selected: show drag & drop area
              <>
                <div 
                  className={`upload-area ${dragActive ? "drag-active" : ""}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.bmp,.zip"
                    onChange={handleFileChange}
                    id="file-upload"
                    className="file-input"
                  />
                  <label htmlFor="file-upload" className="upload-label">
                    <Upload size={48} />
                    <span className="upload-text">
                      {dragActive ? "Drop your file here" : "Drag & drop your image here or click to browse"}
                    </span>
                    <span className="upload-subtext">Supports: PNG, JPG, JPEG, BMP, ZIP</span>
                  </label>
                </div>
                {error && (
                  <div className="error-message">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                  </div>
                )}
              </>
            ) : (
              // File selected (before or after upload): hide upload area, show preview + meta
              <>
                <div className="upload-summary">
                  {file.type?.startsWith("image/") && preview && (
                    <div className="preview">
                      <img src={preview} alt="Uploaded" />
                    </div>
                  )}
                  <div className="file-meta">
                    <p><strong>File:</strong> {file.name}</p>
                    <p><strong>Size:</strong> {formatBytes(file.size)}</p>
                  </div>
                </div>

                {error && (
                  <div className="error-message">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                  </div>
                )}

                {loading ? (
                  <div className="loading">
                    <Loader2 className="spinner" size={28} />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  // Show Upload button only until success; hide once uploaded
                  stepStatus[1] !== "success" && (
                    <button
                      onClick={handleUpload}
                      className="upload-btn"
                    >
                      Upload
                      <ChevronRight size={20} />
                    </button>
                  )
                )}
              </>
            )}
          </div>
        )}

        {/* Step 2: Choose Model (XAI auto-set) */}
        {step === 2 && (
          <div className="demo-step">
            <div className="step-header">
              <h3>Step 2: Choose Model</h3>
              <p>Select a model for image analysis</p>
            </div>
            
            <div className="model-selection">
              <div className="form-group">
                <label htmlFor="model-select">Model</label>
                <select
                  id="model-select"
                  value={model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="dropdown"
                >
                  <option value="">Select a model</option>
                  <option value="vgg16">VGG16 Adapted (LRP)</option>
                  <option value="xception">Xception Net (GradCAM++)</option>
                </select>
              </div>

              {/* {xaiMethod && (
                <div className="info-box">
                  <Brain size={20} />
                  <div>
                    <p>XAI Method</p>
                    <strong>{xaiMethod}</strong>
                  </div>
                </div>
              )} */}

              <div className="form-group">
                <label htmlFor="mag-input">Magnification Value</label>
                <input
                  id="mag-input"
                  type="number"
                  placeholder="Enter Magnification Value"
                  value={magval}
                  onChange={(e) => setMagval(e.target.value)}
                  className="text-input"
                  min={0}
                  max={1}
                  step={0.1}
                />
              </div>
            </div>

            {error && (
              <div className="error-message">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            <div className="step-actions">
              <button
                onClick={() => setStep(1)}
                className="back-btn"
              >
                <ChevronLeft size={20} />
                Back
              </button>
              <button
                onClick={handleGenerate}
                className="upload-btn"
                disabled={!model || !xaiMethod || !magval || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="spinner" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    Generate
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <div className="demo-step">
            <div className="step-header">
              <h3>Step 3: Analysis Results</h3>
              <p>View and download your analysis results</p>
            </div>
            
            {loading ? (
              <div className="loading">
                <Loader2 className="spinner" size={28} />
                <span>Generating results...</span>
              </div>
            ) : (
              result && (
                <>
                  {/* View Mode Toggle */}
                  <div className="view-controls">
                    <div className="view-toggle">
                      <button
                        className={`toggle-btn ${viewMode === "summary" ? "active" : ""}`}
                        onClick={() => setViewMode("summary")}
                      >
                        <Eye size={18} />
                        Summary View
                      </button>
                      <button
                        className={`toggle-btn ${viewMode === "detailed" ? "active" : ""}`}
                        onClick={() => setViewMode("detailed")}
                      >
                        <EyeOff size={18} />
                        Detailed View
                      </button>
                    </div>

                    <button
                      onClick={handleDownload}
                      className="download-btn"
                    >
                      <Download size={18} />
                      Download Results
                    </button>
                  </div>

                  {/* Display Result Images based on view mode */}
                  <div className="result-images">
                    {viewMode === "summary" ? renderSummaryView() : renderDetailedView()}
                  </div>

                  {error && (
                    <div className="error-message">
                      <AlertCircle size={20} />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="step-actions">
                    <button
                      onClick={() => setStep(2)}
                      className="back-btn"
                    >
                      <ChevronLeft size={20} />
                      Back to Model
                    </button>
                    <button
                      onClick={resetAll}
                      className="upload-btn"
                    >
                      Start Over
                    </button>
                  </div>
                </>
              )
            )}
          </div>
        )}
      </section>

      {/* Image Modal */}
      {modalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-toolbar">
              <button className="modal-btn" onClick={zoomOut} aria-label="Zoom out"><ZoomOut size={18} /></button>
              <span className="zoom-value">{Math.round(zoom * 100)}%</span>
              <button className="modal-btn" onClick={zoomIn} aria-label="Zoom in"><ZoomIn size={18} /></button>
              <button className="modal-btn" onClick={resetZoom} aria-label="Reset zoom">Reset</button>
              <button className="modal-close" onClick={closeModal} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="modal-image-wrapper" onWheel={handleWheel}>
              <img
                className="modal-image"
                src={modalSrc}
                alt="Preview"
                /* width scaling allows natural scrolling/panning as zoom increases */
                style={{ width: `${zoom * 100}%`, maxWidth: "none" }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Demo;
