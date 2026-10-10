import type { CSSProperties } from "react";

export interface ManoBalamLoadingScreenProps {
  /** Reassuring status copy shown below the animation. */
  message?: string;
  /** Controls one complete grow, bloom, and breathe cycle. */
  estimatedDurationMs?: number;
  className?: string;
}

type LoaderStyle = CSSProperties & {
  "--mbhc-loader-duration": string;
};

/**
 * A full-viewport, accessible loading overlay for ManoBalamHealthCare.
 * The visual is entirely inline SVG and CSS, so it has no image dependency.
 */
export function ManoBalamLoadingScreen({
  message = "Getting things ready for you...",
  estimatedDurationMs = 6000,
  className = "",
}: ManoBalamLoadingScreenProps) {
  const duration = Math.min(Math.max(estimatedDurationMs, 3000), 12000);
  const style: LoaderStyle = { "--mbhc-loader-duration": `${duration}ms` };

  return (
    <div
      className={`mbhc-loading-screen ${className}`}
      style={style}
      role="status"
      aria-live="polite"
      aria-label={message}
    >
      <div className="mbhc-loading-content">
        <div className="mbhc-loading-visual" aria-hidden="true">
          <div className="mbhc-loading-halo" />

          <span className="mbhc-orbit-icon mbhc-orbit-heart">
            <svg viewBox="0 0 24 24">
              <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z" />
            </svg>
          </span>
          <span className="mbhc-orbit-icon mbhc-orbit-leaf">
            <svg viewBox="0 0 24 24">
              <path d="M20.8 3.2C12.5 3.5 6.5 6.6 4.2 12.1c-1.1 2.6-.4 5.5 1.7 7.1 2.3 1.7 5.5 1.3 7.4-.9 3.7-4.3 5.9-9.2 7.5-15.1Z" />
              <path d="M4.9 19.2c2.8-4.2 6.5-7.6 11.1-10.1" />
            </svg>
          </span>
          <span className="mbhc-orbit-icon mbhc-orbit-shield">
            <svg viewBox="0 0 24 24">
              <path d="M12 3 20 6v5.5c0 4.8-3.2 8-8 9.5-4.8-1.5-8-4.7-8-9.5V6l8-3Z" />
              <path d="m8.5 12 2.2 2.2 4.8-5" />
            </svg>
          </span>
          <span className="mbhc-orbit-icon mbhc-orbit-chat">
            <svg viewBox="0 0 24 24">
              <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
              <path d="M8 10h8M8 13h5" />
            </svg>
          </span>

          <svg className="mbhc-tree" viewBox="0 0 280 300" focusable="false">
            <defs>
              <linearGradient id="mbhc-trunk" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#5b21b6" />
              </linearGradient>
              <radialGradient id="mbhc-leaf-light" cx="38%" cy="28%" r="72%">
                <stop offset="0" stopColor="#f5f3ff" />
                <stop offset="0.45" stopColor="#c4b5fd" />
                <stop offset="1" stopColor="#7c3aed" />
              </radialGradient>
              <radialGradient id="mbhc-leaf-deep" cx="35%" cy="25%" r="78%">
                <stop offset="0" stopColor="#ddd6fe" />
                <stop offset="0.5" stopColor="#8b5cf6" />
                <stop offset="1" stopColor="#6d28d9" />
              </radialGradient>
            </defs>

            <ellipse className="mbhc-tree-ground" cx="140" cy="269" rx="66" ry="12" fill="#8b5cf6" />

            <g className="mbhc-tree-trunk">
              <path d="M128 270c8-39 10-80 10-126h12c0 45 2 86 11 126Z" fill="url(#mbhc-trunk)" />
              <path d="M140 205c-18-18-31-35-39-54" />
              <path d="M146 183c19-18 33-39 42-61" />
              <path d="M141 165c-5-24-5-44 0-62" />
              <path d="M136 222c-21-14-38-28-51-45" />
              <path d="M151 226c20-13 37-29 52-49" />
            </g>

            <g className="mbhc-canopy mbhc-canopy-back" fill="url(#mbhc-leaf-deep)">
              <circle cx="84" cy="139" r="32" />
              <circle cx="196" cy="132" r="34" />
              <circle cx="114" cy="95" r="37" />
              <circle cx="169" cy="88" r="39" />
              <circle cx="141" cy="61" r="34" />
            </g>

            <g className="mbhc-canopy mbhc-canopy-front" fill="url(#mbhc-leaf-light)">
              <circle cx="112" cy="146" r="35" />
              <circle cx="170" cy="145" r="36" />
              <circle cx="141" cy="116" r="42" />
              <circle cx="94" cy="107" r="24" />
              <circle cx="192" cy="101" r="25" />
            </g>

            <g className="mbhc-tree-sparkles" fill="#f5f3ff">
              <circle cx="103" cy="75" r="3" />
              <circle cx="181" cy="69" r="2.5" />
              <circle cx="72" cy="121" r="2.5" />
              <circle cx="211" cy="118" r="3" />
              <circle cx="150" cy="42" r="2.5" />
            </g>
          </svg>
        </div>

        <p className="mbhc-loading-message">{message}</p>
      </div>

      <style>{`
        .mbhc-loading-screen {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: grid;
          min-height: 100dvh;
          place-items: center;
          overflow: hidden;
          padding: 1.5rem;
          background:
            radial-gradient(circle at 50% 42%, rgba(196, 181, 253, 0.5), transparent 35%),
            linear-gradient(145deg, rgba(245, 243, 255, 0.96), rgba(237, 233, 254, 0.94));
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          animation: mbhc-loading-fade-in 500ms ease-out both;
        }

        .mbhc-loading-content {
          display: grid;
          justify-items: center;
          width: min(92vw, 34rem);
        }

        .mbhc-loading-visual {
          position: relative;
          display: grid;
          width: min(76vw, 21rem);
          aspect-ratio: 1 / 1;
          place-items: center;
          isolation: isolate;
        }

        .mbhc-loading-halo {
          position: absolute;
          inset: 16%;
          z-index: -1;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(124, 58, 237, 0.28), rgba(167, 139, 250, 0.13) 48%, transparent 72%);
          filter: blur(18px);
          animation: mbhc-loading-breathe var(--mbhc-loader-duration) ease-in-out infinite;
          will-change: transform, opacity;
        }

        .mbhc-tree {
          width: 78%;
          overflow: visible;
          filter: drop-shadow(0 22px 35px rgba(91, 33, 182, 0.18));
          animation: mbhc-loading-breathe var(--mbhc-loader-duration) ease-in-out infinite;
          will-change: transform, opacity;
        }

        .mbhc-tree-ground {
          opacity: 0.14;
        }

        .mbhc-tree-trunk,
        .mbhc-canopy,
        .mbhc-tree-sparkles {
          transform-box: fill-box;
          transform-origin: center bottom;
          will-change: transform, opacity;
        }

        .mbhc-tree-trunk {
          animation: mbhc-trunk-grow var(--mbhc-loader-duration) ease-in-out infinite;
        }

        .mbhc-tree-trunk path:not(:first-child) {
          fill: none;
          stroke: #7c3aed;
          stroke-width: 6;
          stroke-linecap: round;
        }

        .mbhc-canopy-back {
          animation: mbhc-canopy-bloom var(--mbhc-loader-duration) 180ms ease-in-out infinite;
        }

        .mbhc-canopy-front {
          animation: mbhc-canopy-bloom var(--mbhc-loader-duration) 420ms ease-in-out infinite;
        }

        .mbhc-tree-sparkles {
          transform-origin: center;
          animation: mbhc-sparkle var(--mbhc-loader-duration) 650ms ease-in-out infinite;
        }

        .mbhc-orbit-icon {
          position: absolute;
          display: grid;
          width: 2.6rem;
          height: 2.6rem;
          place-items: center;
          border: 1px solid rgba(124, 58, 237, 0.12);
          border-radius: 1rem;
          color: #7c3aed;
          background: rgba(255, 255, 255, 0.76);
          box-shadow: 0 12px 30px rgba(91, 33, 182, 0.11);
          opacity: 0.72;
          backdrop-filter: blur(8px);
          animation: mbhc-icon-float var(--mbhc-loader-duration) ease-in-out infinite;
          will-change: transform, opacity;
        }

        .mbhc-orbit-icon svg {
          width: 1.15rem;
          height: 1.15rem;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.8;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .mbhc-orbit-heart { top: 19%; left: 2%; animation-delay: -400ms; }
        .mbhc-orbit-leaf { top: 8%; right: 10%; animation-delay: -1600ms; }
        .mbhc-orbit-shield { right: 0; bottom: 25%; animation-delay: -2700ms; }
        .mbhc-orbit-chat { bottom: 17%; left: 5%; animation-delay: -3800ms; }

        .mbhc-loading-message {
          max-width: 28rem;
          margin: 0.25rem 0 0;
          color: #6b6480;
          font-family: inherit;
          font-size: 0.925rem;
          font-weight: 600;
          line-height: 1.6;
          text-align: center;
          text-wrap: balance;
        }

        @keyframes mbhc-loading-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes mbhc-loading-breathe {
          0%, 100% { opacity: 0.86; transform: scale(0.96); }
          50% { opacity: 1; transform: scale(1.04); }
        }

        @keyframes mbhc-trunk-grow {
          0%, 100% { opacity: 0.7; transform: scaleY(0.76); }
          48%, 72% { opacity: 1; transform: scaleY(1); }
        }

        @keyframes mbhc-canopy-bloom {
          0%, 100% { opacity: 0.24; transform: scale(0.62); }
          50%, 76% { opacity: 1; transform: scale(1); }
        }

        @keyframes mbhc-sparkle {
          0%, 25%, 100% { opacity: 0; transform: scale(0.75); }
          58%, 78% { opacity: 0.9; transform: scale(1); }
        }

        @keyframes mbhc-icon-float {
          0%, 100% { opacity: 0.48; transform: translate3d(0, 5px, 0) scale(0.97); }
          50% { opacity: 0.86; transform: translate3d(0, -5px, 0) scale(1.02); }
        }

        @media (max-width: 480px) {
          .mbhc-loading-screen { padding: 1rem; }
          .mbhc-loading-visual { width: min(88vw, 19rem); }
          .mbhc-orbit-icon { width: 2.35rem; height: 2.35rem; border-radius: 0.875rem; }
          .mbhc-loading-message { font-size: 0.875rem; }
        }

        @media (prefers-reduced-motion: reduce) {
          .mbhc-loading-screen {
            animation: mbhc-loading-fade-in 240ms ease-out both !important;
          }

          .mbhc-loading-halo,
          .mbhc-tree,
          .mbhc-tree-trunk,
          .mbhc-canopy,
          .mbhc-tree-sparkles,
          .mbhc-orbit-icon {
            animation: none !important;
            opacity: 1;
            transform: none;
          }

          .mbhc-tree-sparkles { opacity: 0.7; }
          .mbhc-orbit-icon { opacity: 0.72; }
        }
      `}</style>
    </div>
  );
}
