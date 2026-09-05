import React, { useEffect, useRef, useState, useCallback } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

// Requirement 9: Configurable total frame count
const FRAME_COUNT = 50;

// Resolve image assets using Vite's glob import for maximum reliability
const globModules = import.meta.glob("./assets/images/*", { eager: true });

const sortedFrameUrls = Object.entries(globModules)
  .map(([path, mod]) => {
    const match = path.match(/ezgif-frame-(\d+)/i);
    const frameNum = match ? parseInt(match[1], 10) : 0;
    const url = typeof mod === "string" ? mod : mod?.default || "";
    return { frameNum, url };
  })
  .filter((item) => item.frameNum > 0 && item.url)
  .sort((a, b) => a.frameNum - b.frameNum)
  .map((item) => item.url);

// Fallback helper in case glob does not match expected pattern
function getFrameSrc(index) {
  if (sortedFrameUrls[index]) {
    return sortedFrameUrls[index];
  }
  const frameNum = String(index + 1).padStart(3, "0");
  // Try pattern ezgif-frame-001(1).jpg or ezgif-frame-001 (1).jpg
  return new URL(`./assets/images/ezgif-frame-${frameNum} (1).jpg`, import.meta.url).href;
}

export default function App() {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);

  // Preloaded images stored in ref to prevent React re-renders
  const imagesRef = useRef([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Animation and background refs
  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(-1);
  const rafIdRef = useRef(null);
  const bgColorRef = useRef("#000000");

  // Framer Motion scroll progress linked to containerRef
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Requirement 14 & 15: Draw frame on canvas with contain scaling and matching background
  const renderFrame = useCallback((index) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cw = canvas.width;
    const ch = canvas.height;

    // Clear background with exact matching background color
    ctx.fillStyle = bgColorRef.current || "#000000";
    ctx.fillRect(0, 0, cw, ch);

    // Retrieve image or find nearest valid preloaded fallback image (Requirement 16)
    let img = imagesRef.current[index];
    if (!img || !img.complete || img.naturalWidth === 0) {
      // Find closest loaded frame if available
      img = imagesRef.current.find((i) => i && i.complete && i.naturalWidth > 0);
    }

    if (img && img.complete && img.naturalWidth > 0) {
      const imageAspect = img.naturalWidth / img.naturalHeight;
      const canvasAspect = cw / ch;

      let drawW, drawH, drawX, drawY;

      // Cover scaling logic to fill 100% of the viewport without black bars
      if (canvasAspect > imageAspect) {
        drawW = cw;
        drawH = cw / imageAspect;
        drawX = 0;
        drawY = (ch - drawH) / 2;
      } else {
        drawH = ch;
        drawW = ch * imageAspect;
        drawX = (cw - drawW) / 2;
        drawY = 0;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      currentFrameRef.current = index;
    }
  }, []);

  // Requirement 11: Request animation frame helper to throttle draws
  const requestDraw = useCallback(
    (index) => {
      const boundedIndex = Math.min(FRAME_COUNT - 1, Math.max(0, index));
      targetFrameRef.current = boundedIndex;

      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          renderFrame(targetFrameRef.current);
        });
      }
    },
    [renderFrame]
  );

  // Requirement 5 & 16: Load all frames before starting animation & handle failures gracefully
  useEffect(() => {
    let isCancelled = false;
    const loadedImages = new Array(FRAME_COUNT);
    let loadedCount = 0;

    const checkComplete = () => {
      if (isCancelled) return;
      loadedCount++;
      if (loadedCount >= FRAME_COUNT) {
        // Detect exact background color from first frame corner pixel
        const firstImg = loadedImages[0];
        if (firstImg && firstImg.naturalWidth > 0) {
          try {
            const sampleCanvas = document.createElement("canvas");
            sampleCanvas.width = 1;
            sampleCanvas.height = 1;
            const sampleCtx = sampleCanvas.getContext("2d");
            if (sampleCtx) {
              sampleCtx.drawImage(firstImg, 0, 0, 1, 1);
              const [r, g, b] = sampleCtx.getImageData(0, 0, 1, 1).data;
              bgColorRef.current = `rgb(${r}, ${g}, ${b})`;
            }
          } catch {
            bgColorRef.current = "#000000";
          }
        }

        imagesRef.current = loadedImages;
        setIsLoaded(true);
      }
    };

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = getFrameSrc(i);
      img.onload = () => {
        loadedImages[i] = img;
        checkComplete();
      };
      img.onerror = () => {
        console.warn(`Failed to load frame index ${i} (${img.src})`);
        loadedImages[i] = null;
        checkComplete();
      };
    }

    return () => {
      isCancelled = true;
    };
  }, []);

  // Requirement 12 & 13: Resize canvas ONLY when viewport changes using ResizeObserver & high-DPI scaling
  useEffect(() => {
    if (!isLoaded || !wrapperRef.current) return;

    const updateCanvasSize = (entries) => {
      const entry = entries[0];
      if (!entry || !canvasRef.current) return;

      const rect = entry.contentRect;
      const width = rect.width;
      const height = rect.height;

      if (width <= 0 || height <= 0) return;

      const dpr = window.devicePixelRatio || 1;
      const canvas = canvasRef.current;

      // Set hardware pixel dimensions for crisp high-DPI rendering
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      // Set display CSS dimensions
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Draw immediately on resize without waiting for scroll
      renderFrame(targetFrameRef.current);
    };

    const resizeObserver = new ResizeObserver(updateCanvasSize);
    resizeObserver.observe(wrapperRef.current);

    return () => {
      // Requirement 17: Clean up ResizeObserver
      resizeObserver.disconnect();
    };
  }, [isLoaded, renderFrame]);

  // Requirement 10 & 18: Map scroll progress (0 to 1) to frame index without React re-renders
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (!isLoaded) return;
    const calculatedIndex = Math.min(
      FRAME_COUNT - 1,
      Math.max(0, Math.floor(latest * FRAME_COUNT))
    );
    if (calculatedIndex !== targetFrameRef.current) {
      requestDraw(calculatedIndex);
    }
  });

  // Requirement 17: Cleanup requestAnimationFrame on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Requirement 6: Silent loading spinner while frames preload */}
      {!isLoaded && (
        <div className="loading-overlay">
          <div className="spinner" />
        </div>
      )}

      {/* Requirement 3 & 7: 400vh scroll container containing ONLY the sticky canvas animation */}
      <div ref={containerRef} className="scroll-container">
        <div ref={wrapperRef} className="sticky-wrapper">
          <canvas ref={canvasRef} className="sequence-canvas" />
        </div>
      </div>
    </>
  );
}