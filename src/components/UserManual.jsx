import React from "react";
import "./UserManual.css";

const steps = [
  {
    id: 1,
    title: "Upload Cell Images",
    description:
      "Begin by uploading your cytology image files. You can upload individual images in JPG, PNG, or JPEG format, or a compressed ZIP file containing multiple cell images for batch analysis.",
    media: "/assets/Upload.mp4",
  },
  {
    id: 2,
    title: "Select Model & Parameters",
    description:
      "From the dropdown menu, choose your preferred segmentation model — options include VGG, XceptionNet, and other hybrid architectures. Enter the desired magnification value to tailor analysis precision, then click on the Generate button to start processing.",
    media: "/assets/Model.mp4",
  },
  {
    id: 3,
    title: "View Detailed Results",
    description:
      "Once processing is complete, explore a comprehensive results dashboard. You can view the original cytology image, corresponding segmentation mask, attention heatmap, and a detailed table of extracted cell descriptors for further analysis.",
    media: "/assets/Results.mp4",
  },
];

const UserManual = () => {
  return (
    <section id="manual" className="user-manual" style={{ paddingBottom: "6rem" }}>
      <div className="manual-grid">
        <h2 className="manual-title">How to Use</h2>

        {steps.map((step) => (
          <React.Fragment key={step.id}>
            <div className="manual-media">
              {/*
                Replaced <img> with <video> to properly display mp4 assets.
                No controls are shown; video autoplays, loops, and is muted.
              */}
              <video
                className="demo-gif"
                autoPlay
                muted
                loop
                playsInline
                controls={false}
                aria-label={`Step ${step.id} - ${step.title}`}
              >
                <source src={step.media} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="manual-details">
              <h3>
                {step.id}. {step.title}
              </h3>
              <p>{step.description}</p>
            </div>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default UserManual;
