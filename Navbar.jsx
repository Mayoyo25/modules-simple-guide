export function Navbar({ title, sourcePath }) {
  const baseRepoUrl = "http://github.com/Mayoyo25/modules-simple-guide/tree/master/infinite-scroll/react-hookz-web/";

  return (
    <nav className="navbar">
      {/* Left Side - Social Icons */}
      <div className="social-icons">
        <a href="https://github.com/mayoyo25" target="_blank" rel="noopener noreferrer" className="icon">
          <svg viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.043-1.61-4.043-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.744.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.834 2.805 1.304 3.49.997.107-.775.42-1.305.76-1.605-2.665-.3-5.467-1.332-5.467-5.93 0-1.31.467-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.56 11.56 0 013.004-.404c1.02.005 2.045.137 3.003.404 2.295-1.552 3.3-1.23 3.3-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.375.81 1.103.81 2.22 0 1.604-.015 2.896-.015 3.286 0 .32.21.69.825.573C20.565 22.092 24 17.595 24 12.297c0-6.627-5.373-12-12-12z"/></svg>
        </a>
        <a href="https://twitter.com/FranklinMayoyo" target="_blank" rel="noopener noreferrer" className="icon">
          <svg viewBox="0 0 24 24"><path d="M23.954 4.569c-.885.392-1.83.656-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.554-3.594-1.554-2.717 0-4.92 2.203-4.92 4.917 0 .386.045.762.127 1.124-4.09-.205-7.72-2.165-10.15-5.144-.423.723-.664 1.56-.664 2.465 0 1.703.87 3.205 2.191 4.087-.807-.026-1.566-.247-2.229-.616v.061c0 2.385 1.693 4.374 3.946 4.828-.413.111-.849.171-1.296.171-.318 0-.626-.031-.927-.088.627 1.956 2.445 3.377 4.604 3.417-1.684 1.318-3.809 2.103-6.102 2.103-.396 0-.788-.023-1.175-.068 2.179 1.397 4.768 2.211 7.557 2.211 9.054 0 14.002-7.496 14.002-13.986 0-.213-.005-.425-.014-.636.961-.695 1.797-1.56 2.457-2.549z"/></svg>
        </a>
        <a href="https://linkedin.com/in/FranklinMayoyo" target="_blank" rel="noopener noreferrer" className="icon">
          <svg viewBox="0 0 24 24"><path d="M22.23 0H1.77C.79 0 0 .774 0 1.727v20.545C0 23.226.79 24 1.77 24h20.46c.98 0 1.77-.774 1.77-1.727V1.727C24 .774 23.21 0 22.23 0zM7.118 20.452H3.562V9.116h3.556v11.336zM5.34 7.738c-1.14 0-2.063-.923-2.063-2.063S4.2 3.612 5.34 3.612s2.063.923 2.063 2.063-.923 2.063-2.063 2.063zM20.453 20.452h-3.556v-5.504c0-1.313-.025-3.003-1.83-3.003-1.83 0-2.11 1.433-2.11 2.91v5.597H9.401V9.116h3.412v1.554h.048c.476-.9 1.637-1.83 3.367-1.83 3.602 0 4.267 2.37 4.267 5.456v6.156z"/></svg>
        </a>
      </div>

      {/* Center - Dynamic Title */}
      <h1 className="title">{title}</h1>

      {/* Right Side - Source Code Link */}
      <a href={`${baseRepoUrl}${sourcePath}`} target="_blank" rel="noopener noreferrer" className="source-code">
        Source Code
      </a>

      <style>
  {`
    .navbar {
      position: fixed; /* Keeps it at the top */
      top: 0;
      left: 0;
      width: 100%;
      background: #1a1a1a; /* Dark background */
      color: white;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 1000;
      box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    }

    .title {
      font-size: 1.5rem;
      font-weight: bold;
      text-align: center;
      flex-grow: 1; /* Centers the title */
    }

    .social-icons {
      display: flex;
      gap: 15px;
    }

    .icon {
      color: white;
      text-decoration: none;
      font-size: 1.5rem;
      transition: transform 0.2s;
    }

    .icon:hover {
      transform: scale(1.1);
    }

    .source-link {
      color: white;
      font-size: 1rem;
      text-decoration: none;
      margin-left: auto;
    }

    /* Responsive Design */
    @media (max-width: 600px) {
      .title {
        font-size: 1.2rem;
      }
      
      .icon {
        font-size: 1.2rem;
      }
    }

    /* Add padding to body so content isn't hidden behind navbar */
    body {
      padding-top: 60px;
    }
  `}
</style>

    </nav>
  );
}
