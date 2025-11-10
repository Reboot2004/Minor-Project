import React, { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import "./Results.css";

const Results = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/oldpreds`);
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        setPredictions(data);
      } catch (err) {
        console.error("Error fetching predictions:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPredictions();
  }, [API_BASE_URL]);

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Loading previous results...</p>
      </div>
    );

  if (error)
    return <p className="error-text">Error: {error}</p>;

  return (
    <main className="results-container">
      <h1 className="perf-heading">Results Archive</h1>
      <p className="subtitle">
        Review previously processed predictions with classification and visualizations.
      </p>

      <div className="results-grid">
        {predictions.length === 0 ? (
          <p className="no-results">No previous predictions found.</p>
        ) : (
          predictions.map((pred, index) => (
            <div key={pred.id} className="result-card">
              {/* Header */}
              <div className="result-id">#{index + 1}</div>

              {/* Details under header */}
              <div className="meta-info">
                <p><b>ID:</b> {pred.id}</p>
                <p><b>Magnification:</b> {pred.magnification}</p>
                <p>
                  <b>Classification:</b>{" "}
                  <span
                    className={`classification-tag ${
                      pred.classification?.toLowerCase() === "abnormal"
                        ? "abnormal"
                        : "normal"
                    }`}
                  >
                    {pred.classification || "Unclassified"}
                  </span>
                </p>
              </div>

              {/* Images */}
              {pred.images && (
                <div className="image-grid">
                  {[
                    { img: pred.images.originalImage, label: "Original Image" },
                    { img: pred.images.heatmapImage, label: "Heatmap" },
                    { img: pred.images.tableImage, label: "Cell Descriptors Table" },
                  ].map(({ img, label }, i) => (
                    <div key={i} className="image-card">
                      <div className="image-wrapper">
                        <img src={`data:image/png;base64,${img}`} alt={label} />
                      </div>
                      <p className="image-label">{label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </main>
  );
};

export default Results;
