export default function FaceCircle({ state, detectedDir }) {
    const dot = (direction) => {
        const active = state[direction];
        const detecting = detectedDir === direction && !active;
        return {
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: active
                ? "#059669"
                : detecting
                    ? "#fbbf24"
                    : "rgba(255, 255, 255, 0.15)",
            border: active
                ? "2px solid #34d399"
                : detecting
                    ? "2px solid #f59e0b"
                    : "2px solid rgba(255,255,255,0.3)",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 700,
            color: active ? "#fff" : detecting ? "#111" : "rgba(255,255,255,0.7)",
        };
    };

    const label = (dir) => {
        const short = { front: "F", left: "L", right: "R", up: "U", down: "D" };
        return state[dir] ? "✓" : short[dir];
    };

    const positions = {
        up: { position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)" },
        down: { position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)" },
        left: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" },
        right: { position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" },
        front: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
    };

    return (
        <>
            {["front", "left", "right", "up", "down"].map((dir) => (
                <div key={dir} style={{ ...positions[dir], zIndex: 3 }}>
                    <div style={dot(dir)}>{label(dir)}</div>
                </div>
            ))}
        </>
    );
}
