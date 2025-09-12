import { useRef, useEffect } from "react";
import { Box } from "@mui/material";

export default function EKGLine({ height = 150, color = "#00E5FF" }) {
  const pathRef = useRef(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const len = path.getTotalLength();
    path.style.strokeDasharray = `${len}`;
    let off = 0;
    let raf;

    const tick = () => {
      off = (off + 3) % len;
      path.style.strokeDashoffset = `${len - off}`;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ position: "relative", width: "100%", height, border:"1px solid #07f0ff",borderRadius:"20px" }}>
       <Box
            sx={{
              position: "absolute",
              top: "-3px",
              left: 0,
              right: 0,
              width: "80%",
              height: "3px",
              margin: "0 auto",
              background: "#0a0f1e",
              // boxShadow: "0 0 10px #00f0ff, 0 0 20px #00c4ff",
              borderRadius: "2px",
              animation: "moveLine 2s linear infinite",
              zIndex: 2,
            }}
          />
      <svg
        width="100%"
        height={height}
        viewBox="0 0 600 56"
        preserveAspectRatio="none"
        style={{
          display: "block",
          filter: "drop-shadow(0 0 8px rgba(0,229,255,.25))",
        }}
      >
        <defs>
          {/* Grid pattern */}
          <pattern
            id="grid"
            width="20"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 0 0 L 0 10 M 0 0 L 20 0"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="0.5"
            />
          </pattern>

          {/* Gradient for EKG line */}
          <linearGradient id="ekgGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="0.0" />
            <stop offset="15%" stopColor={color} stopOpacity="0.9" />
            <stop offset="85%" stopColor={color} stopOpacity="0.9" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid background */}
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* EKG line */}
        <path
          ref={pathRef}
          d="M0,28 L60,28 80,28 90,18 100,45 110,10 120,40 130,28 220,28 240,28 250,18 260,45 270,10 280,40 290,28 380,28 400,28 410,18 420,45 430,10 440,40 450,28 540,28 600,28"
          fill="none"
          stroke="url(#ekgGrad)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>

      {/* Optional faint baseline */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      />
     <Box
            sx={{
              position: "absolute",
              bottom: "-3px",
              left: 0,
              right: 0,
              width: "80%",
              height: "3px",
              margin: "0 auto",
              background: "#0a0f1e",
              // boxShadow: "0 0 10px #00f0ff, 0 0 20px #00c4ff",
              borderRadius: "2px",
              animation: "moveLine 2s linear infinite",
              zIndex: 2,
            }}
          />
    </div>
  );
}
