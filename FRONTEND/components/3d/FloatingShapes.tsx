export const FloatingShapes = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full animate-pulse"
          style={{
            width: `${2 + (i % 2)}px`,
            height: `${2 + (i % 2)}px`,
            background: 'rgba(255,255,255,0.40)',
            top: `${(i * 8.3) % 100}%`,
            left: `${(i * 9.1) % 100}%`,
            animationDelay: `${(i * 0.3) % 2}s`,
          }}
        />
      ))}
    </div>
  );
};