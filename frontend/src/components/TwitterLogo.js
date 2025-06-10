const TwitterLogo = ({ style }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ...style }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {/* Generic chat bubble icon */}
      <svg
        width="42"
        height="42"
        viewBox="0 0 24 24"
        fill="#1DA1F2"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginRight: 12 }}
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H6l-4 4V6c0-1.1.9-2 2-2z" />
      </svg>

      <span
        style={{
          color: '#1DA1F2',
          fontWeight: 'bold',
          fontSize: 32,
          letterSpacing: 1,
        }}
      >
        Social Media Platform
      </span>
    </div>

    {/* Optional tagline */}
    {/* <div style={{ fontSize: 16, color: '#888', marginTop: 4 }}>Connect. Share. Discover.</div> */}
  </div>
);

export default TwitterLogo;