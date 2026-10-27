export function Fallback() {
  return (
    <div className="sculpture-fallback" aria-hidden="true">
      {Array.from({ length: 8 }, (_, i) => (
        <i
          key={i}
          style={{
            transform: `translate(-50%,-50%) rotate(${i * 22.5}deg) rotateY(48deg)`,
          }}
        />
      ))}
      <span />
    </div>
  );
}
