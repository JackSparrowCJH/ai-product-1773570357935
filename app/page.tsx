"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface FloatingText {
  id: number;
  x: number;
  y: number;
}

export default function Home() {
  const [merit, setMerit] = useState(0);
  const [combo, setCombo] = useState(0);
  const [pressed, setPressed] = useState(false);
  const [floats, setFloats] = useState<FloatingText[]>([]);
  const comboTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const floatId = useRef(0);
  const userId = useRef("user_" + Math.random().toString(36).slice(2, 8));
  const pendingTaps = useRef(0);
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const syncToServer = useCallback(() => {
    if (pendingTaps.current <= 0) return;
    const taps = pendingTaps.current;
    pendingTaps.current = 0;
    fetch("/api/merit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userId.current, taps }),
    }).catch(() => {});
  }, []);

  const schedulSync = useCallback(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(syncToServer, 500);
  }, [syncToServer]);

  useEffect(() => {
    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
      syncToServer();
    };
  }, [syncToServer]);

  const handleTap = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();

      const now = Date.now();
      setMerit((m) => m + 1);
      setCombo((c) => c + 1);
      pendingTaps.current += 1;
      schedulSync();

      setPressed(true);
      setTimeout(() => setPressed(false), 50);

      if (comboTimer.current) clearTimeout(comboTimer.current);
      comboTimer.current = setTimeout(() => setCombo(0), 1000);

      const id = ++floatId.current;
      const offsetX = (Math.random() - 0.5) * 60;
      setFloats((f) => [...f, { id, x: offsetX, y: 0 }]);
      setTimeout(() => {
        setFloats((f) => f.filter((item) => item.id !== id));
      }, 700);
    },
    [schedulSync]
  );

  const formatMerit = (n: number): string => {
    if (n >= 1_0000_0000) return (n / 1_0000_0000).toFixed(1) + "亿";
    if (n >= 1_0000) return (n / 1_0000).toFixed(1) + "万";
    return n.toLocaleString("zh-CN");
  };

  const comboTier = combo >= 100 ? 3 : combo >= 50 ? 2 : combo >= 10 ? 1 : 0;

  return (
    <div style={styles.container}>
      <style>{cssAnimations}</style>

      <div style={styles.meritDisplay}>
        <span style={styles.meritLabel}>功德</span>
        <span style={styles.meritValue} data-testid="merit-count">
          {formatMerit(merit)}
        </span>
      </div>

      {comboTier > 0 && (
        <div style={{ ...styles.comboLabel, color: comboTier >= 3 ? "#FFD700" : comboTier >= 2 ? "#FF6B6B" : "#FFA500" }}>
          {combo} 连击！
          {comboTier >= 3 && " 🌟 金光普照"}
          {comboTier === 2 && " 🪷 莲花绽放"}
          {comboTier === 1 && " ✨"}
        </div>
      )}

      <div style={styles.woodfishArea}>
        {comboTier >= 1 && (
          <div
            style={{
              ...styles.aura,
              boxShadow:
                comboTier >= 3
                  ? "0 0 80px 40px rgba(255,215,0,0.6), 0 0 160px 80px rgba(255,215,0,0.3)"
                  : comboTier >= 2
                  ? "0 0 60px 30px rgba(255,107,107,0.5), 0 0 120px 60px rgba(255,107,107,0.2)"
                  : "0 0 40px 20px rgba(255,165,0,0.4)",
            }}
          />
        )}

        <div
          onMouseDown={handleTap}
          onTouchStart={handleTap}
          style={{
            ...styles.woodfish,
            transform: pressed ? "scale(0.92)" : "scale(1)",
            transition: "transform 50ms ease-out",
          }}
          role="button"
          aria-label="敲木鱼"
          data-testid="woodfish"
        >
          <svg viewBox="0 0 200 200" width="180" height="180">
            <ellipse cx="100" cy="115" rx="80" ry="60" fill="#8B4513" />
            <ellipse cx="100" cy="115" rx="70" ry="50" fill="#A0522D" />
            <ellipse cx="100" cy="110" rx="55" ry="38" fill="#8B4513" />
            <circle cx="100" cy="108" r="18" fill="#654321" stroke="#D2691E" strokeWidth="2" />
            <circle cx="100" cy="108" r="8" fill="#A0522D" />
            <path d="M60 80 Q100 30 140 80" fill="none" stroke="#8B4513" strokeWidth="8" strokeLinecap="round" />
            <ellipse cx="100" cy="170" rx="60" ry="8" fill="rgba(0,0,0,0.15)" />
          </svg>
        </div>

        {floats.map((f) => (
          <div key={f.id} style={{ ...styles.floatText, left: `calc(50% + ${f.x}px)` }} className="float-up">
            功德 +1
          </div>
        ))}
      </div>

      <div style={styles.hint}>点击木鱼 · 积累功德</div>
    </div>
  );
}

const cssAnimations = `
  @keyframes floatUp {
    0% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-100px); }
  }
  .float-up {
    animation: floatUp 0.7s ease-out forwards;
  }
  body {
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }
`;

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    background: "linear-gradient(180deg, #1a0a2e 0%, #2d1b4e 50%, #1a0a2e 100%)",
    fontFamily: "'PingFang SC', 'Microsoft YaHei', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  meritDisplay: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 40,
  },
  meritLabel: {
    color: "#B8860B",
    fontSize: 18,
    letterSpacing: 4,
    marginBottom: 8,
  },
  meritValue: {
    color: "#FFD700",
    fontSize: 48,
    fontWeight: "bold",
    textShadow: "0 0 20px rgba(255,215,0,0.5)",
  },
  comboLabel: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textShadow: "0 0 10px currentColor",
  },
  woodfishArea: {
    position: "relative",
    width: 200,
    height: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  aura: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: "50%",
    pointerEvents: "none",
    transition: "box-shadow 300ms ease",
  },
  woodfish: {
    cursor: "pointer",
    zIndex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    WebkitTapHighlightColor: "transparent",
  },
  floatText: {
    position: "absolute",
    top: 0,
    color: "#FFD700",
    fontSize: 22,
    fontWeight: "bold",
    pointerEvents: "none",
    whiteSpace: "nowrap",
    textShadow: "0 0 8px rgba(255,215,0,0.8)",
    zIndex: 10,
  },
  hint: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 14,
    marginTop: 60,
    letterSpacing: 2,
  },
};
