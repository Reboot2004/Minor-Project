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
      // Extract the result images from the response
      if (data.success && data.results) {
        setResultImages({
          originalImage: data.results.originalImage || data.image1,
          heatmapImage: data.results.heatmapImage || data.inter1,
          maskImage: data.results.maskImage || data.mask1,
          tableImage: data.results.tableImage || data.table1
        });
      }

      // optionally set textual result if present
      if (data.results && (data.results.summary || data.results.details)) {
        setResult({
          summary: data.results.summary,
          details: data.results.details
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

  // Helper to get trailing number from a key like "image1" or "mask2"
  const getLastNumber = (str) => {
    const m = String(str).match(/(\d+)$/);
    return m ? m[1] : "";
  };

  // Render images using the provided display logic (adapted to current state keys)
  const renderImages = () => {
    const images = [];
    let colImages = [];
    let count = 1;

    // We'll treat resultImages as the source (renamed from imageSrc).
    // If keys are not numbered (like originalImage), we also support them.
    const imageSrc = resultImages || {};

    for (let key in imageSrc) {
      if (!Object.prototype.hasOwnProperty.call(imageSrc, key)) continue;
      // Determine if this key should be treated as an "image"
      // Accept keys that include "image" (case-insensitive) or start with "image"
      if (images.length >= 5) break; // same limit as original snippet

      const lowered = key.toLowerCase();
      if (lowered.includes("image") || lowered === "originalimage" || lowered === "heatmapimage" || lowered === "tableimage") {
        const num = getLastNumber(key) || count; // fallback to count if no trailing number
        // try to find corresponding mask key (mask{num}) or a general maskImage
        const maskKeyByNum = `mask${num}`;
        const mask = imageSrc[maskKeyByNum] || imageSrc.maskImage || imageSrc.mask || null;
        const image = imageSrc[key];

        // Only render pairs when image exists
        if (!image) {
          count += 1;
          continue;
        }

        // Build the column item (two side-by-side sections: image + mask)
        const colItem = (
          <div key={key} className="demo-image-col" style={{ flex: 1, padding: 8, minWidth: 0 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div>
                <h4 style={{ margin: "0 0 6px 0" }}>{`Image ${count}`}</h4>
                <img
                  src={`data:image/png;base64,${image}`}
                  alt={`image-${key}`}
                  style={{ width: "100%", maxWidth: "100%", height: "auto", borderRadius: 6 }}
                />
              </div>
              <div>
                <h4 style={{ margin: "6px 0 6px 0" }}>{`Segmentation Mask ${count}`}</h4>
                {mask ? (
                  <img
                    src={`data:image/png;base64,${mask}`}
                    alt={`mask-${key}`}
                    style={{ width: "100%", maxWidth: "100%", height: "auto", borderRadius: 6 }}
                  />
                ) : (
                  <div style={{ color: "var(--text-secondary)" }}>No mask available</div>
                )}
              </div>
            </div>
          </div>
        );

        colImages.push(colItem);

        // When we have two columns, push them as a "row"
        if (colImages.length === 2) {
          images.push(
            <div key={`row-${images.length}`} className="demo-image-row" style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              {colImages}
            </div>
          );
          colImages = [];
        }

        count += 1;
      } else {
        // ignore non-image keys
      }
    }

    // Push remaining column if any
    if (colImages.length > 0) {
      images.push(
        <div key={`row-${images.length}`} className="demo-image-row" style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          {colImages}
        </div>
      );
      colImages = [];
    }

    // If nothing was generated from numbered keys above, fall back to showing available image-like fields individually
    if (images.length === 0) {
      const fallbackCols = [];
      let fallbackCount = 1;
      for (let key of ["originalImage", "heatmapImage", "maskImage", "tableImage"]) {
        const img = imageSrc[key];
        if (!img) continue;
        fallbackCols.push(
          <div key={`fb-${key}`} style={{ flex: 1, padding: 8 }}>
            <h4 style={{ margin: "0 0 6px 0" }}>{key === "originalImage" ? `Image ${fallbackCount}` : key}</h4>
            <img src={`data:image/png;base64,${img}`} alt={key} style={{ width: "100%", borderRadius: 6 }} />
          </div>
        );
        fallbackCount += 1;
        if (fallbackCols.length === 2) {
          images.push(
            <div key={`fb-row-${images.length}`} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              {fallbackCols.splice(0, 2)}
            </div>
          );
        }
      }
      if (fallbackCols.length > 0) {
        images.push(
          <div key={`fb-row-${images.length}`} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            {fallbackCols}
          </div>
        );
      }
    }

    return images;
  };

  const hasImages = Object.values(resultImages).some(Boolean);

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
              <>
                <div className="results">
                  <p>
                    <strong>Summary:</strong> {result?.summary || "No summary"}
                  </p>
                  <p>
                    <strong>Details:</strong> {result?.details || "No details"}
                  </p>
                </div>

                {/* Display Result Images using adapted renderImages logic */}
                {hasImages ? (
                  <div className="result-images">
                    {renderImages()}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-secondary)" }}>No result images available.</p>
                )}

                <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setStep(2)}
                    className="next-btn"
                    style={{ background: "#e5e7eb", color: "#111827" }}
                  >
                    ← Back to Model
                  </button>
                  <button
                    onClick={() => {
                      setStep(1);
                      // reset state if desired:
                      // setResult(null);
                      // setResultImages({ originalImage: null, heatmapImage: null, maskImage: null, tableImage: null });
                    }}
                    className="next-btn"
                    style={{ marginLeft: 8 }}
                  >
                    Start Over
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </section>
    </>
  );
};

export default Demo;
