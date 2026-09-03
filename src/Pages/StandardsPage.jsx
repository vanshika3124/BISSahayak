import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown } from "lucide-react";

import Sidebar from "../Components/Sidebar";
import TopBar from "../Components/TopBar";
import FilterBar from "../Components/FilterBar";
import StandardCard from "../Components/StandardCard";

const API_BASE_URL = "https://backend-fkpu.onrender.com/api";

export default function StandardsPage() {
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState(["mandatory"]);

  const [conversationId, setConversationId] = useState(null);

  const [results, setResults] = useState([]);
  const [sources, setSources] = useState([]);

  const [loading, setLoading] = useState(false);
  const [conversationLoading, setConversationLoading] = useState(true);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // CREATE CONVERSATION WHEN PAGE LOADS
  // --------------------------------------------------

  useEffect(() => {
    createConversation();
  }, []);

  const createConversation = async () => {
    try {
      setConversationLoading(true);
      setError("");

      const token = localStorage.getItem("bis_access_token");

      if (!token) {
        setError("Please login again.");
        return;
      }

      const { data } = await axios.post(
        `${API_BASE_URL}/conversations`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.success && data.conversation) {
        setConversationId(data.conversation._id);
      } else {
        setError("Unable to create conversation.");
      }
    } catch (err) {
      console.error("Create conversation error:", err);

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to create conversation."
        );
      }
    } finally {
      setConversationLoading(false);
    }
  };

  // --------------------------------------------------
  // FILTER HANDLER
  // --------------------------------------------------

  const toggleFilter = (key) => {
    setActiveFilters((prev) =>
      prev.includes(key)
        ? prev.filter((filter) => filter !== key)
        : [...prev, key]
    );
  };

  // --------------------------------------------------
  // CHAT / SEARCH API
  // --------------------------------------------------

  const handleSearch = async (searchQuery) => {
    const question = searchQuery.trim();

    if (!question) {
      return;
    }

    if (!conversationId) {
      setError("Conversation is not ready yet. Please try again.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSources([]);

      const token = localStorage.getItem("bis_access_token");

      if (!token) {
        setError("Please login again.");
        return;
      }

      const { data } = await axios.post(
        `${API_BASE_URL}/chat`,
        {
          conversationId: conversationId,
          question: question,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Chat API response:", data);

      if (data.success) {
        setQuery(question);

        // AI answer ko result ke form mein show karna
        setResults([
          {
            code: "BIS AI",
            status: "Active",
            category: "AI Answer",
            title: question,
            description:
              data.answer || "No answer received from AI.",
            aiInsight:
              data.answer || "No AI insight available.",
            relevanceMatch: 100,
          },
        ]);

        // Sources
        setSources(data.sources || []);
      } else {
        setError(data.message || "Failed to get AI response.");
      }
    } catch (err) {
      console.error("Chat API error:", err);

      if (err.response?.status === 401) {
        setError("Session expired. Please login again.");
      } else if (err.response?.status === 404) {
        setError("Conversation not found.");
      } else {
        setError(
          err.response?.data?.message ||
            "Failed to get response from BIS Sahayak."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* SIDEBAR */}
      <Sidebar active="standards" />

      <div className="flex-1 min-w-0">
        {/* TOP BAR */}
        <TopBar
          query={query}
          onQueryChange={setQuery}
          onSearch={handleSearch}
        />

        {/* FILTER BAR */}
        <FilterBar
          active={activeFilters}
          onToggle={toggleFilter}
        />

        {/* MAIN CONTENT */}
        <main className="px-8 py-6">
          {/* HEADER */}
          <div className="flex items-end justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">
                Search Results
              </h1>

              <p className="text-sm text-neutral-500 mt-1">
                {results.length > 0
                  ? `AI response for '${query}'`
                  : "Search Indian Standards using BIS Sahayak"}
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-sm text-neutral-700"
            >
              Sort by:
              <span className="font-semibold">
                Relevance
              </span>

              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* ERROR */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* CONVERSATION LOADING */}
          {conversationLoading && (
            <div className="mb-5 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-500">
              Preparing BIS Sahayak...
            </div>
          )}

          {/* AI LOADING */}
          {loading && (
            <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              BIS Sahayak is searching the standards...
            </div>
          )}

          {/* RESULTS */}
          {!loading && results.length > 0 && (
            <div className="space-y-4">
              {results.map((result, index) => (
                <StandardCard
                  key={`${result.code}-${index}`}
                  {...result}
                />
              ))}
            </div>
          )}

          {/* SOURCES */}
          {!loading && sources.length > 0 && (
            <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-5">
              <h2 className="text-sm font-semibold text-neutral-900 mb-3">
                Sources
              </h2>

              <ul className="space-y-2">
                {sources.map((source, index) => (
                  <li
                    key={`${source}-${index}`}
                    className="text-sm text-neutral-600"
                  >
                    • {source}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* EMPTY STATE */}
          {!loading &&
            !conversationLoading &&
            results.length === 0 &&
            !error && (
              <div className="rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center">
                <h2 className="text-lg font-semibold text-neutral-800">
                  Search Indian Standards
                </h2>

                <p className="text-sm text-neutral-500 mt-2">
                  Ask something like:
                  <br />
                  <span className="font-medium">
                    "What is BIS?"
                  </span>
                  <br />
                  or
                  <br />
                  <span className="font-medium">
                    "What standards apply to water purifiers?"
                  </span>
                </p>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}