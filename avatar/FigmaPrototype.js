import React from "react";

export default function FigmaPrototype() {
  const figmaURL =
    "https://embed.figma.com/proto/G7PUJTYN52YUEOqLBwdfwZ/Untitled?page-id=0%3A1&node-id=5-2282&starting-point-node-id=5-2282&embed-host=share";

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>Figma Prototype Viewer</h2>
      <div
        style={{
          border: "2px solid #ccc",
          borderRadius: "10px",
          overflow: "hidden",
          height: "600px",
          marginTop: "20px",
        }}
      >
        <iframe
          src={figmaURL}
          title="Figma Prototype"
          width="100%"
          height="100%"
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
}
