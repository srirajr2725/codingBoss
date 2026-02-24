import { useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/web/pdf_viewer.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PdfViewer = ({ pdfUrl }) => {
  const viewerRef = useRef(null);

  useEffect(() => {
    const loadingTask = pdfjsLib.getDocument(pdfUrl);

    loadingTask.promise.then((pdf) => {
      viewerRef.current.innerHTML = ""; // clear old pdf

      for (let i = 1; i <= pdf.numPages; i++) {
        pdf.getPage(i).then((page) => {
          const viewport = page.getViewport({ scale: 1.3 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");

          canvas.height = viewport.height;
          canvas.width = viewport.width;

          viewerRef.current.appendChild(canvas);

          page.render({
            canvasContext: context,
            viewport: viewport,
          });
        });
      }
    });
  }, [pdfUrl]);

  return (
    <div
      ref={viewerRef}
      style={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        background: "#f2f2f2",
        padding: "20px",
      }}
    ></div>
  );
};

export default PdfViewer;
