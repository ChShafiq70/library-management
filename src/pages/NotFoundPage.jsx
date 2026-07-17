import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h3 className="text-2xl font-semibold text-gray-700 mb-2">Page not found</h3>
        <p className="text-gray-500">This shelf is empty. <Link to="/books" className="text-blue-500 hover:underline">Return to the catalog</Link>.</p>
      </div>
    </div>
  );
}