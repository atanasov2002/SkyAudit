function AuthButtonSkeleton() {
  return (
    <div style={{ display: "flex", gap: "1rem" }}>
      <div
        style={{
          width: "100px",
          height: "40px",
          borderRadius: "8px",
          backgroundColor: "#374151", // gray-700
          animation: "pulse 1.5s infinite",
        }}
      />
      <div
        style={{
          width: "120px",
          height: "40px",
          borderRadius: "8px",
          backgroundColor: "#4B5563", // gray-600
          animation: "pulse 1.5s infinite",
        }}
      />
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
export default AuthButtonSkeleton;
