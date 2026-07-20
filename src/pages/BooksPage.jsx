import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Stamp from "../components/Stamp";

const emptyForm = { title: "", author: "", isbn: "", description: "", quantity: 1 };

export default function BooksPage() {
  const { role, user } = useAuth();
  const isLibrarian = role === "librarian";
  const isSuperadmin = role === "superadmin";
  const canManageBooks = isLibrarian || isSuperadmin;

  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [borrowingId, setBorrowingId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [borrowQuantity, setBorrowQuantity] = useState(1);

  const fetchBooks = async (searchTerm = "") => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/books", { params: searchTerm ? { search: searchTerm } : {} });
      setBooks(data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load the catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks(search);
  };

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (book) => {
    setForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      description: book.description || "",
      quantity: book.quantity,
    });
    setEditingId(book.id);
    setShowForm(true);
  };

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await api.patch(`/books/${editingId}`, { ...form, quantity: Number(form.quantity) });
      } else {
        await api.post("/books", { ...form, quantity: Number(form.quantity) });
      }
      setShowForm(false);
      fetchBooks(search);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the book.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this title from the catalog?")) return;
    try {
      await api.delete(`/books/${id}`);
      fetchBooks(search);
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete the book.");
    }
  };

  const handleBorrow = async (bookId) => {
    const book = books.find(b => b.id === bookId);
    setSelectedBook(book);
    setBorrowQuantity(1);
    setShowBorrowModal(true);
  };

  const confirmBorrow = async () => {
    setBorrowingId(selectedBook.id);
    setFeedback("");
    setError("");
    try {
      await api.post("/borrow", { bookId: selectedBook.id, quantity: borrowQuantity });
      setFeedback(`Request submitted for ${borrowQuantity} book(s) — waiting on librarian approval.`);
      setShowBorrowModal(false);
      fetchBooks(search);
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit borrow request.");
    } finally {
      setBorrowingId(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <span className="text-sm text-gray-500 uppercase tracking-wide">Card catalog</span>
        <h1 className="text-3xl font-bold mt-2">Browse the collection</h1>
        <p className="text-gray-600 mt-1">{books.length} title{books.length === 1 ? "" : "s"} on record</p>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {feedback && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{feedback}</div>}

      <div className="flex gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1">
          <input
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by title or author…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors">Search</button>
        </form>
        {canManageBooks && (
          <button className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors" onClick={openCreateForm}>+ Add book</button>
        )}
      </div>

      {showForm && (
        <form className="bg-white p-6 rounded-lg shadow-md mb-6" onSubmit={handleFormSubmit}>
          <h3 className="text-xl font-semibold mb-4">{editingId ? "Edit title" : "New title"}</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Title</label>
              <input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" name="title" value={form.title} onChange={handleFormChange} required />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Author</label>
              <input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" name="author" value={form.author} onChange={handleFormChange} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">ISBN</label>
              <input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" name="isbn" value={form.isbn} onChange={handleFormChange} required />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Copies</label>
              <input className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" type="number" min="0" name="quantity" value={form.quantity} onChange={handleFormChange} required />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Description</label>
            <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" name="description" rows={3} value={form.description} onChange={handleFormChange} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">{editingId ? "Save changes" : "Add to catalog"}</button>
            <button type="button" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Pulling the drawers open…</p>
      ) : books.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-700">No titles found</h3>
          <p className="text-gray-500 mt-2">Try a different search, or check back later.</p>
        </div>
      ) : (
        books.map((book) => (
          <div className="bg-white p-4 rounded-lg shadow-md mb-4 flex items-center gap-4" key={book.id}>
            <div className="flex-1">
              <div className="text-lg font-semibold">{book.title}</div>
              <div className="text-gray-600">{book.author}</div>
              <div className="text-sm text-gray-500 mt-1">
                ISBN {book.isbn} · {book.availableQuantity}/{book.quantity} available
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Stamp
                label={book.availableQuantity > 0 ? "Available" : "None left"}
                variant={book.availableQuantity > 0 ? "available" : "unavailable"}
              />
              {(role === "student" || role === "superadmin") && (
                <button
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors disabled:bg-gray-400"
                  disabled={book.availableQuantity < 1 || borrowingId === book.id}
                  onClick={() => handleBorrow(book.id)}
                >
                  {borrowingId === book.id ? "Requesting…" : "Borrow"}
                </button>
              )}
              {canManageBooks && (
                <>
                  <button className="px-3 py-1 border border-gray-300 text-sm rounded-md text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => openEditForm(book)}>Edit</button>
                  <button className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors" onClick={() => handleDelete(book.id)}>Delete</button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}