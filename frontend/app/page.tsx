import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-8 text-primary-600">
          Ethio Tourism
        </h1>
        <p className="text-xl mb-8 text-gray-600">
          Discover the beauty of Ethiopia
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition"
          >
            Sign Up
          </Link>
          <Link
            href="/login"
            className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
