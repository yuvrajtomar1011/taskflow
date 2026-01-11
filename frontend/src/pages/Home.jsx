import { Link } from "react-router-dom";

function Home() {
  return (
    <main style={{ maxWidth: "800px", margin: "60px auto", padding: "20px" }}>
      <h1>TaskFlow</h1>

      <p style={{ fontSize: "18px", marginTop: "20px" }}>
        TaskFlow is a simple and secure task management platform designed to help
        users organize their work efficiently.
      </p>

      <ul style={{ marginTop: "20px" }}>
        <li>Create and manage personal tasks</li>
        <li>Secure login with protected access</li>
        <li>Responsive design for all devices</li>
      </ul>

      <div style={{ marginTop: "30px" }}>
        <Link to="/login">
          <button style={{ padding: "10px 16px", fontSize: "16px" }}>
            Login to Get Started
          </button>
        </Link>
      </div>
    </main>
  );
}

export default Home;
