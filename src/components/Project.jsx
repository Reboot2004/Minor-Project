import React, { useEffect } from "react";
import { Brain, Activity, Layers, BarChart3 } from "lucide-react";
import "./Project.css";

const Project = () => {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <section id="project" className="project-section">
      <div className="project-container">
        {/* Title + Intro */}
        <h2 className="project-heading manual-title reveal">
          A Hybrid XAI-Driven Segmentation Approach for Cervical Cytology Analysis
        </h2>

        <p className="project-description reveal reveal-delay-1">
          Developed as part of our{" "}
          <strong>4th Year Industry-Oriented Mini Project</strong> at{" "}
          <strong>Keshav Memorial Institute of Technology (KMIT)</strong>, this project
          introduces an innovative hybrid framework leveraging{" "}
          <strong>Explainable Artificial Intelligence (XAI)</strong> to automate cervical
          cytology image segmentation. It enables early detection of cervical cancer with
          enhanced accuracy, transparency, and ease of use for clinicians.
        </p>

        {/* Roadmap (zig-zag with dotted timeline) */}
        <div className="roadmap-list">
          {/* Problem - Left */}
          <div className="roadmap-item left">
            <div className="project-card roadmap-card reveal">
              <div className="icon-circle blue">
                <Activity size={30} />
              </div>
              <h3 className="card-title manual-title">The Problem</h3>
              <p className="card-text">
                Cervical cancer remains a leading cause of cancer-related deaths among women.
                Traditional Pap smear analysis is <strong>time-consuming</strong> and{" "}
                <strong>error-prone</strong>, requiring specialized cytologists.
                Existing AI systems rely on <strong>expensive pixel-level annotations</strong>{" "}
                and lack interpretability, making clinical adoption difficult.
              </p>
            </div>
          </div>

          {/* Approach - Right */}
          <div className="roadmap-item right">
            <div className="project-card roadmap-card reveal reveal-delay-1">
              <div className="icon-circle purple">
                <Brain size={30} />
              </div>
              <h3 className="card-title manual-title">Our Approach</h3>
              <p className="card-text">
                We developed a <strong>hybrid weakly supervised segmentation</strong> framework
                integrating <strong>Deep Learning</strong>, <strong>Explainable AI (XAI)</strong>, and{" "}
                <strong>GraphCut segmentation</strong> to analyze cervical cell images.
              </p>
              <ul className="card-list">
                <li>Fine-tuned <strong>VGG16</strong> & <strong>XceptionNet</strong> to classify cells.</li>
                <li>Applied <strong>GradCAM++</strong> and <strong>LRP</strong> for interpretability.</li>
                <li>
                  Converted XAI heatmaps into <strong>pixel-wise segmentation masks</strong> and refined
                  them with GraphCut.
                </li>
              </ul>
              <p className="card-text">
                This approach removes the need for costly annotations while ensuring
                transparency and reliability — essential in medical AI.
              </p>
            </div>
          </div>

          {/* System - Left */}
          <div className="roadmap-item left">
            <div className="project-card roadmap-card reveal reveal-delay-2">
              <div className="icon-circle green">
                <Layers size={30} />
              </div>
              <h3 className="card-title manual-title">What Our System Offers</h3>
              <p className="card-text">
                Our web application <strong>CytoVision AI</strong> transforms cervical cytology images
                into interpretable, AI-powered diagnostic visuals.
              </p>
              <ul className="card-list">
                <li>🔹 Automated segmentation of nucleus & cytoplasm</li>
                <li>🔹 Explainable heatmaps showing AI reasoning</li>
                <li>🔹 Annotation-free training framework</li>
                <li>🔹 Clinician-friendly dashboard for result visualization</li>
                <li>🔹 Lightweight architecture deployable on free-tier cloud</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Performance and Results (centered, unchanged) */}
      <section className="perf-section">
        <div className="perf-header">
          <BarChart3 size={32} className="perf-icon" />
          <h3 className="perf-heading manual-title">Performance and Results</h3>
        </div>

        <p className="perf-subtext">
          The proposed hybrid XAI segmentation system achieved competitive performance across multiple metrics, ensuring both accuracy and interpretability.
        </p>

        <div className="perf-grid">
          {[
            { label: "Accuracy", value: "92%" },
            { label: "Precision", value: "84%" },
            { label: "Recall", value: "83%" },
            { label: "F1-Score", value: "84%" },
            { label: "Dice Coefficient Score", value: "80.7%" },
            { label: "Intersection over Union", value: "68.2%" },
          ].map((metric, index) => (
            <div key={index} className="perf-item">
              <span className="perf-pill">
                <span className="check" aria-hidden>✓</span>
                {metric.label}
              </span>
              <div className="perf-value">{metric.value}</div>
              <div className="perf-bar">
                <div className="perf-fill" style={{ width: metric.value }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
};

export default Project;
