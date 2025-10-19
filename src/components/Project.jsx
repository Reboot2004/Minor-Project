import React from "react";
import { Brain, Activity, Layers } from "lucide-react";
import "./Project.css";

const Project = () => {
  return (
    <section id="project" className="project-section">
      <div className="project-container">
        {/* Title + Intro */}
        <h2 className="project-heading manual-title">
          A Hybrid XAI-Driven Segmentation Approach for Cervical Cytology Analysis
        </h2>

        <p className="project-description">
          Developed as part of our{" "}
          <strong>4th Year Industry-Oriented Mini Project</strong> at{" "}
          <strong>Keshav Memorial Institute of Technology (KMIT)</strong>, this project
          introduces an innovative hybrid framework leveraging{" "}
          <strong>Explainable Artificial Intelligence (XAI)</strong> to automate cervical
          cytology image segmentation. It enables early detection of cervical cancer with
          enhanced accuracy, transparency, and ease of use for clinicians.
        </p>

        {/* Project Steps */}
        <div className="project-grid">
          {/* Problem */}
          <div className="project-card">
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

          {/* Approach */}
          <div className="project-card">
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

          {/* System */}
          <div className="project-card">
            <div className="icon-circle green">
              <Layers size={30} />
            </div>
            <h3 className="card-title manual-title">What Our System Offers</h3>
            <p className="card-text">
              Our web application <strong>SegXperts</strong> transforms cervical cytology images
              into interpretable, AI-powered diagnostic visuals.
            </p>
            <ul className="card-list">
              <li>🔹 Automated segmentation of nucleus & cytoplasm</li>
              <li>🔹 Explainable heatmaps showing AI reasoning</li>
              <li>🔹 Annotation-free training framework</li>
              <li>🔹 Clinician-friendly dashboard for result visualization</li>
              <li>🔹 Lightweight architecture deployable on free-tier cloud</li>
            </ul>
            <p className="card-highlight">
              <strong>Performance:</strong> Dice Coefficient — <strong>62%</strong> | System
              Usability Score — <strong>77.5 (“Good”)</strong>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Project;
