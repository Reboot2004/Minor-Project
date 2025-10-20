import React, { useState } from "react";
import { Loader2 } from "lucide-react"; // spinner icon
import "./Demo.css";
const API_BASE = import.meta.env.VITE_API_BASE_URL
const Demo = () => {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("");
  const [xaiMethod, setXaiMethod] = useState("");
  const [magval, setMagval] = useState("");
  const [result, setResult] = useState(null);
  const [resultImages, setResultImages] = useState({
    originalImage: null,
    heatmapImage: null,
    maskImage: null,
    tableImage: null
  });
  const [viewMode, setViewMode] = useState("summary"); // "summary" or "detailed"

  // Handle file selection
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  // Send file to Flask backend
  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log("Upload response:", data);

      if (data.message.includes("success")) {
        setStep(2); // move to next step only on success
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Send model + method + magval to Flask backend
  const handleGenerate = async () => {
    if (!model || !xaiMethod || !magval) return;
    setLoading(true);

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
      console.log(JSON.stringify(data, null, 2));
      setResult(data);
      // Extract the result images from the response
      if (data.success && data) {
        setResultImages({
          originalImage: data.results.originalImage || data.image1,
          heatmapImage: data.results.heatmapImage || data.inter1,
          maskImage: data.results.maskImage || data.mask1,
          tableImage: data.results.tableImage || data.table1
        });
      }

      setStep(3);
    } catch (error) {
      console.error("Processing failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepClick = (num) => {
    setStep(num);
  };

  // Render images in Summary View (similar to Segmentation.js renderImages)
  const renderSummaryView = () => {
    console.log(resultImages)
    if (!data.image1) return null;

    return (
      <div className="summary-view">
        <div className="image-pair">
          <div className="pair-item">
            <h4>Original Image</h4>
            <img
              src={`data:image/png;base64,${data.image1}`}
              alt="Original"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
          <div className="pair-item">
            <h4>Segmentation Mask</h4>
            <img
              src={`data:image/png;base64,${resultImages.maskImage}`}
              alt="Mask"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        </div>
      </div>
    );
  };

  // Render images in Detailed View (similar to Segmentation.js renderDetailedView)
  const renderDetailedView = () => {
    if (!resultImages.originalImage) return null;

    return (
      <div className="detailed-view">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ width: "25%", fontSize: "18px", padding: "10px" }}>
                Original Image
              </th>
              <th style={{ width: "25%", fontSize: "18px", padding: "10px" }}>
                Segmentation Mask
              </th>
              <th style={{ width: "25%", fontSize: "18px", padding: "10px" }}>
                XAI Heatmap
              </th>
              <th style={{ width: "25%", fontSize: "18px", padding: "10px" }}>
                Cell Descriptor
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ width: "25%", padding: "10px", textAlign: "center" }}>
                <img
                  src={`data:image/jpeg;base64,${resultImages.originalImage}`}
                  alt="Original"
                  style={{ width: "80%", height: "auto" }}
                />
              </td>
              <td style={{ width: "25%", padding: "10px", textAlign: "center" }}>
                <img
                  src={`data:image/jpeg;base64,${resultImages.maskImage}`}
                  alt="Mask"
                  style={{ width: "80%", height: "auto" }}
                />
              </td>
              <td style={{ width: "25%", padding: "10px", textAlign: "center" }}>
                <img
                  src={`data:image/jpeg;base64,${resultImages.heatmapImage}`}
                  alt="Heatmap"
                  style={{ width: "80%", height: "auto" }}
                />
              </td>
              <td style={{ width: "25%", padding: "10px", textAlign: "center" }}>
                <img
                  src={`data:image/jpeg;base64,${resultImages.tableImage}`}
                  alt="Table"
                  style={{ width: "80%", height: "auto" }}
                />
              </td>
            </tr>
          </tbody>
        </table>
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
        <div className="progress">
          {[1, 2, 3].map((num, idx) => (
            <React.Fragment key={num}>
              <button
                type="button"
                className={`progress-step ${step >= num ? "active" : ""}`}
                onClick={() => handleStepClick(num)}
                aria-current={step === num}
              >
                <span className="step-number">{num}</span>
                <span className="step-label">
                  {num === 1 ? "Upload" : num === 2 ? "Model" : "Result"}
                </span>
              </button>

              {idx < 2 && (
                <div
                  className={`progress-connector ${step > num ? "active" : ""}`}
                  aria-hidden
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step === 1 && (
          <div className="demo-step">
            <h3>Step 1: Upload Image</h3>
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.bmp,.zip"
              onChange={handleFileChange}
            />

            {preview && (
              <div className="preview">
                <img src={preview} alt="Uploaded" />
              </div>
            )}

            {loading ? (
              <div className="loading">
                <Loader2 className="spinner" size={28} /> Uploading...
              </div>
            ) : (
              file && (
                <button
                  onClick={handleUpload}
                  className="next-btn"
                  style={{ marginTop: 12 }}
                >
                  Upload & Next →
                </button>
              )
            )}
          </div>
        )}

        {/* Step 2: Choose Model (XAI auto-set) */}
        {step === 2 && (
          <div className="demo-step">
            <h3>Step 2: Choose Model</h3>
            <select
              value={model}
              onChange={(e) => handleModelChange(e.target.value)}
              className="dropdown"
            >
              <option value="">Select a model</option>
              <option value="vgg16">VGG16 Adapted (LRP)</option>
              <option value="xception">Xception Net (GradCAM++)</option>
            </select>

            {xaiMethod && (
              <p style={{ marginTop: 8, color: "var(--text-secondary)" }}>
                XAI Method: <strong>{xaiMethod}</strong>
              </p>
            )}

            <input
              type="number"
              placeholder="Enter Magnification Value"
              value={magval}
              onChange={(e) => setMagval(e.target.value)}
              className="dropdown"
              style={{ marginTop: 10 }}
            />

            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => setStep(1)}
                className="next-btn"
                style={{ marginRight: 8, background: "#e5e7eb", color: "#111827" }}
              >
                ← Back
              </button>
              <button
                onClick={handleGenerate}
                className="next-btn"
                disabled={!model || !xaiMethod || !magval || loading}
              >
                {loading ? <Loader2 className="spinner" size={20} /> : "Generate"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <div className="demo-step">
            <h3>Step 3: Summary & Results</h3>
            {loading ? (
              <div className="loading">
                <Loader2 className="spinner" size={28} /> Generating results...
              </div>
            ) : (
              result && (
                <>
                  {/* View Mode Toggle */}
                  <div className="view-toggle" style={{ marginBottom: "20px", textAlign: "center" }}>
                    <button
                      className={`toggle-btn ${viewMode === "summary" ? "active" : ""}`}
                      onClick={() => setViewMode("summary")}
                      style={{
                        padding: "8px 20px",
                        marginRight: "10px",
                        border: "1px solid #007bff",
                        background: viewMode === "summary" ? "#007bff" : "white",
                        color: viewMode === "summary" ? "white" : "#007bff",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Summary View
                    </button>
                    <button
                      className={`toggle-btn ${viewMode === "detailed" ? "active" : ""}`}
                      onClick={() => setViewMode("detailed")}
                      style={{
                        padding: "8px 20px",
                        border: "1px solid #007bff",
                        background: viewMode === "detailed" ? "#007bff" : "white",
                        color: viewMode === "detailed" ? "white" : "#007bff",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Detailed View
                    </button>

                    {/* Download Button */}
                    <button
                      onClick={handleDownload}
                      className="download-btn"
                      style={{
                        padding: "8px 20px",
                        marginLeft: "20px",
                        border: "1px solid #28a745",
                        background: "#28a745",
                        color: "white",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Download Results
                    </button>
                  </div>

                  {/* Display Result Images based on view mode */}
                  <div className="result-images">
                    {viewMode === "summary" ? renderSummaryView() : renderDetailedView()}
                  </div>

                  <div style={{ marginTop: "20px", display: "flex", gap: 8, justifyContent: "center" }}>
                    <button
                      onClick={() => setStep(2)}
                      className="next-btn"
                      style={{ background: "#e5e7eb", color: "#111827" }}
                    >
                      ← Back to Model
                    </button>
                    <button
                      onClick={() => setStep(1)}
                      className="next-btn"
                      style={{ marginLeft: 8 }}
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
    </>
  );
};

export default Demo;
