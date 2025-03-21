import Layout from "./layout";
import Link from "next/link";

export default function Home() {
  return (
    <Layout>
      <h1 className="h1">Select Dashboard</h1>
      <div className="main-window">
        <Link href="/dashboard/student">
        <br></br>
          <button className="dashboard-button">Student Dashboard</button>
        </Link>

        <br></br>
        <br></br>

        <Link href="/dashboard/mentor">
          <button className="dashboard-button">Mentor Dashboard</button>
        </Link>
        
        <br></br>
        <br></br>

        <Link href="/dashboard/agent">
          <button className="dashboard-button">
            Agent Dashboard (View Only)
          </button>
        </Link>
      </div>
    </Layout>
  );
}
