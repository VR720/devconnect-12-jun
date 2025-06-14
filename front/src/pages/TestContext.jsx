import { useAuth } from "../context/AuthContext";

const TestContext = () => {
  const { user, accessToken, login, logout, getCurrentUser, loading } =
    useAuth();

  const handleLogin = () => {
    login("vivek.chigure@vernost.com", "12345");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Auth Context Tester</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p>User: {user ? JSON.stringify(user) : "Not logged in"}</p>
          <p>Access Token: {accessToken ? "✅ Exists" : "❌ None"}</p>
          <button
            onClick={handleLogin}
            className="bg-green-500 text-white px-4 py-2 rounded m-2"
          >
            Login
          </button>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded m-2"
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
};

export default TestContext;
