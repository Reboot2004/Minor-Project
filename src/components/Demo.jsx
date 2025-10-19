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

      setResult(data);

      // Extract the result images from the response
      if (data.success && data.results) {
        setResultImages({
          originalImage: data.results.originalImage || data.results.image1,
          heatmapImage: data.results.heatmapImage || data.results.inter1,
          maskImage: data.results.maskImage || data.results.mask1,
          tableImage: data.results.tableImage || data.results.table1
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
                  <div className="results">
                    <p>
                      <strong>Summary:</strong> {result.summary || "No summary"}
                    </p>
                    <p>
                      <strong>Details:</strong> {result.details || "No details"}
                    </p>
                  </div>

                  {/* Display Result Images */}
                  <div className="result-images">
                    <div className="image-grid">
                      <div className="image-item">
                        <h4>Original Image</h4>
                        {resultImages.originalImage && (
                          <img
                            src={`data:image/jpeg;base64,${resultImages.originalImage}`}
                            alt="Original"
                          />
                        )}
                      </div>

                      <div className="image-item">
                        <h4>XAI Heatmap</h4>
                        {resultImages.heatmapImage && (
                          <img
                            src={`data:image/jpeg;base64,${resultImages.heatmapImage}`}
                            alt="Heatmap"
                          />
                        )}
                      </div>

                      <div className="image-item">
                        <h4>Segmentation Mask</h4>
                        {resultImages.maskImage && (
                          <img
                            src={`data:image/jpeg;base64,${resultImages.maskImage}`}
                            alt="Mask"
                          />
                        )}
                      </div>

                      <div className="image-item">
                        <h4>Cell Descriptors</h4>
                        {resultImages.tableImage && (
                          <img
                            src={`data:image/jpeg;base64,${resultImages.tableImage}`}
                            alt="Table"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
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
