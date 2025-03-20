import Layout from "./layout";
import Link from "next/link";

export default function Home() {
  return (
    <Layout>
      <h1 className="text-2xl font-bold text-center mb-4">Select Dashboard</h1>
      <div className="flex flex-col space-y-4">
        <Link href="/dashboard/student">
          <button className="w-full p-3 bg-blue-500 text-white rounded-md">Student Dashboard</button>
        </Link>
        <Link href="/dashboard/mentor">
          <button className="w-full p-3 bg-green-500 text-white rounded-md">Mentor Dashboard</button>
        </Link>
        <Link href="/dashboard/agent">
          <button className="w-full p-3 bg-gray-500 text-white rounded-md cursor-not-allowed">
            Agent Dashboard (View Only)
          </button>
        </Link>
      </div>
    </Layout>
  );
}
