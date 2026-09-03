import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";

// Use the local worker file that we copied into the public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = window.location.origin + "/pdf.worker.min.mjs";

const PdfViewer = ({ pdfUrl }) => {
  const canvasRef = useRef(null);
  const [pdfRef, setPdfRef] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [isRendering, setIsRendering] = useState(false);

  // Initialize PDF
  useEffect(() => {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);
    loadingTask.promise.then((pdf) => {
      setPdfRef(pdf);
      setNumPages(pdf.numPages);
      setCurrentPage(1);
    }).catch(err => console.error("Error loading PDF:", err));
  }, [pdfUrl]);

  // Render Page
  useEffect(() => {
    if (pdfRef && canvasRef.current && !isRendering) {
      setIsRendering(true);
      pdfRef.getPage(currentPage).then((page) => {
        const scale = 1.3;
        const viewport = page.getViewport({ scale });
        const outputScale = window.devicePixelRatio || 1;
        
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height =  Math.floor(viewport.height) + "px";
        
        const transform = outputScale !== 1 
          ? [outputScale, 0, 0, outputScale, 0, 0] 
          : null;

        const renderContext = {
          canvasContext: context,
          transform: transform,
          viewport: viewport,
        };

        page.render(renderContext).promise.then(() => {
          setIsRendering(false);
        }).catch(err => {
          console.error("Error rendering page:", err);
          setIsRendering(false);
        });
      });
    }
  }, [pdfRef, currentPage]);

  const nextPage = () => setCurrentPage((p) => (p < numPages ? p + 1 : p));
  const prevPage = () => setCurrentPage((p) => (p > 1 ? p - 1 : p));

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#f8fafc", borderRadius: "12px", overflow: "hidden" }}>
      {/* Pagination Controls */}
      <div style={{ padding: "16px", display: "flex", justifyContent: "center", alignItems: "center", gap: "24px", background: "#ffffff", borderBottom: "1px solid #e2e8f0", zIndex: 10 }}>
        <button 
          onClick={prevPage} 
          disabled={currentPage <= 1 || isRendering} 
          style={{ 
            padding: "8px 20px", 
            borderRadius: "8px", 
            border: "1px solid #cbd5e1", 
            background: (currentPage <= 1 || isRendering) ? "#f1f5f9" : "#ffffff", 
            color: (currentPage <= 1 || isRendering) ? "#94a3b8" : "#0f172a",
            cursor: (currentPage <= 1 || isRendering) ? "not-allowed" : "pointer", 
            fontWeight: "700",
            transition: "all 0.2s ease"
          }}
        >
          Previous
        </button>
        
        <span style={{ fontWeight: "700", color: "#334155", fontSize: "1.1rem" }}>
          Page {currentPage} of {numPages}
        </span>
        
        <button 
          onClick={nextPage} 
          disabled={currentPage >= numPages || isRendering} 
          style={{ 
            padding: "8px 20px", 
            borderRadius: "8px", 
            border: "1px solid #cbd5e1", 
            background: (currentPage >= numPages || isRendering) ? "#f1f5f9" : "#ffffff",
            color: (currentPage >= numPages || isRendering) ? "#94a3b8" : "#0f172a",
            cursor: (currentPage >= numPages || isRendering) ? "not-allowed" : "pointer", 
            fontWeight: "700",
            transition: "all 0.2s ease"
          }}
        >
          Next
        </button>
      </div>

      {/* PDF Canvas Container */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
        <canvas 
          ref={canvasRef} 
          style={{ 
            display: "block", 
            boxShadow: "0 10px 40px rgba(15, 23, 42, 0.15)", 
            borderRadius: "12px" 
          }} 
        />
      </div>
    </div>
  );
};

export default PdfViewer;
