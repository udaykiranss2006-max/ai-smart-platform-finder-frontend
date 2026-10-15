import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { api } from "./services/api";
import "./index.css";

const demoResults = [
  {
    name: "TechMart Hyderabad",
    category: "Electronics",
    description: "Laptops and accessories for programming.",
    rating: 4.6,
  },
  {
    name: "CityCart Hyderabad",
    category: "Shopping",
    description: "Everyday products with local delivery.",
    rating: 4.3,
  },
  {
    name: "Goa Stay Collective",
    category: "Hotels",
    description: "Comfortable stays near beaches and cafes.",
    rating: 4.7,
  },
];

function App() {
  const [page, setPage] = useState("home");
  const [authMode, setAuthMode] = useState("login");
  const [authMessage, setAuthMessage] = useState("");
  const [user, setUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchMessage, setSearchMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function openLogin() {
    setAuthMode("login");
    setAuthMessage("");
    setPage("auth");
  }

  function openRegister() {
    setAuthMode("register");
    setAuthMessage("");
    setPage("auth");
  }

  async function handleAuthentication(event) {
    event.preventDefault();
    setAuthMessage("");
    setLoading(true);

    const form = new FormData(event.currentTarget);

    try {
      let response;

      if (authMode === "login") {
        response = await api.login({
          email: form.get("email"),
          password: form.get("password"),
        });
      } else {
        response = await api.register({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
        });
      }

      const loggedInUser = {
        id: response.userId || "",
        name: response.name || form.get("name") || "User",
        email: response.email || form.get("email"),
      };

      localStorage.setItem("authToken", response.token || "");
      localStorage.setItem("userId", loggedInUser.id);
      localStorage.setItem("userName", loggedInUser.name);
      localStorage.setItem("userEmail", loggedInUser.email);

      setUser(loggedInUser);
      setAuthMessage("Authentication successful.");

      // This redirects after both login and registration.
      setPage("dashboard");
    } catch (error) {
      setAuthMessage(
        error.message || "Request failed. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(event) {
    event.preventDefault();

    if (!searchText.trim()) {
      setSearchMessage("Enter something to search for.");
      return;
    }

    setLoading(true);
    setSearchMessage("");

    try {
      const analysis = await api.analyze(searchText);

      const recommendations = await api.recommendation({
        category: analysis.category,
        location: analysis.location,
        budget: analysis.budget,
        preferences: analysis.preferences || [],
      });

      if (recommendations.length > 0) {
        setSearchResults(
          recommendations.map((item) => ({
            name: item.platform.name,
            category: item.platform.category,
            description: item.platform.description,
            rating: item.platform.rating,
            score: item.recommendationScore,
          }))
        );
      } else {
        setSearchResults(demoResults);
      }

      setPage("dashboard");
    } catch (error) {
      setSearchResults(demoResults);
      setSearchMessage(
        "Backend is unavailable. Demo results are displayed."
      );
      setPage("dashboard");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");

    setUser(null);
    setSearchResults([]);
    setPage("home");
  }

  return (
    <>
      <header className="navbar">
        <button className="brand" onClick={() => setPage("home")}>
          <span>✦</span> orbit/local
        </button>

        <nav>
          <button onClick={() => setPage("home")}>Home</button>
          <button onClick={() => setPage("dashboard")}>Dashboard</button>
        </nav>

        {user ? (
          <button className="outline-button" onClick={logout}>
            Logout
          </button>
        ) : (
          <button className="outline-button" onClick={openLogin}>
            Sign in
          </button>
        )}
      </header>

      {page === "home" && (
        <main className="home-page">
          <div className="eyebrow">SMART SEARCH FOR REAL LIFE</div>

          <h1>
            Find your next
            <br />
            <em>good decision.</em>
          </h1>

          <p className="lead">
            Search for products, hotels, restaurants, services, courses,
            vehicles, and travel plans.
          </p>

          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="What are you looking for?"
            />

            <button type="submit" className="primary-button">
              {loading ? "Searching..." : "Find it"}
            </button>
          </form>

          {searchMessage && (
            <p className="message">{searchMessage}</p>
          )}

          <div className="auth-shortcut">
            <button onClick={openLogin}>Already have an account? Sign in</button>
            <button onClick={openRegister}>Create a new account</button>
          </div>
        </main>
      )}

      {page === "auth" && (
        <main className="auth-page">
          <div className="eyebrow">
            {authMode === "login" ? "WELCOME BACK" : "CREATE ACCOUNT"}
          </div>

          <h1>
            {authMode === "login" ? (
              <>
                Sign in to
                <br />
                <em>continue.</em>
              </>
            ) : (
              <>
                Start your
                <br />
                <em>journey.</em>
              </>
            )}
          </h1>

          <form className="auth-form" onSubmit={handleAuthentication}>
            {authMode === "register" && (
              <label>
                Name
                <input name="name" type="text" required />
              </label>
            )}

            <label>
              Email
              <input name="email" type="email" required />
            </label>

            <label>
              Password
              <input
                name="password"
                type="password"
                minLength="6"
                required
              />
            </label>

            <button type="submit" className="primary-button">
              {loading
                ? "Please wait..."
                : authMode === "login"
                ? "Sign in"
                : "Create account"}
            </button>
          </form>

          {authMessage && (
            <p className="message">{authMessage}</p>
          )}

          <button
            className="switch-button"
            onClick={() => {
              setAuthMessage("");
              setAuthMode(
                authMode === "login" ? "register" : "login"
              );
            }}
          >
            {authMode === "login"
              ? "Need an account? Register"
              : "Already registered? Sign in"}
          </button>
        </main>
      )}

      {page === "dashboard" && (
        <main className="dashboard-page">
          <div className="eyebrow">PERSONAL DASHBOARD</div>

          <h1>
            Hello,{" "}
            <em>
              {user?.name ||
                localStorage.getItem("userName") ||
                "there"}
              .
            </em>
          </h1>

          <p className="lead">
            Your account is active. Search results and recommendations appear
            below.
          </p>

          <div className="dashboard-actions">
            <button
              className="primary-button"
              onClick={() => setPage("home")}
            >
              Search again
            </button>

            <button
              className="outline-button"
              onClick={logout}
            >
              Sign out
            </button>
          </div>

          {searchMessage && (
            <p className="message">{searchMessage}</p>
          )}

          <section className="result-section">
            <div className="eyebrow">RECOMMENDATIONS</div>
            <h2>Options worth your time</h2>

            <div className="result-grid">
              {searchResults.length === 0 ? (
                <p>No search results yet. Start a search from the home page.</p>
              ) : (
                searchResults.map((result, index) => (
                  <article className="result-card" key={index}>
                    <div className="result-icon">✦</div>

                    <div>
                      <span className="category-label">
                        {result.category}
                      </span>

                      <h3>{result.name}</h3>
                      <p>{result.description}</p>

                      <div className="rating">
                        ★ {Number(result.rating || 4.3).toFixed(1)}
                        {result.score && (
                          <span>
                            {" "}
                            · {Math.round(result.score)}% match
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        </main>
      )}

      <footer className="footer">
        orbit/local
        <span>AI Smart Platform Finder</span>
      </footer>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);