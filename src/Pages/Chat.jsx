import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  Home as HomeIcon,
  MessageCircle,
  FileText,
  CheckCircle,
  FlaskConical,
  Shield,
  User,
  HelpCircle,
  LogOut,
  Plus,
  Paperclip,
  ArrowRight,
  Copy,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  Check,
  Search,
  Menu,
  X,
} from "lucide-react";

const API_BASE_URL = "https://backend-fkpu.onrender.com/api";

function Chat() {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentChats, setRecentChats] = useState([]);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // ============================================================
  // AUTH TOKEN
  // ============================================================

  const getAccessToken = () => {
    return (
      localStorage.getItem("bis_access_token") ||
      sessionStorage.getItem("bis_access_token") ||
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  const getHeaders = () => {
    const token = getAccessToken();

    return token
      ? {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }
      : {
          "Content-Type": "application/json",
        };
  };

  // ============================================================
  // AUTO SCROLL
  // ============================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // ============================================================
  // INITIALIZE CONVERSATION
  // ============================================================

  useEffect(() => {
    initializeChat();
  }, []);

  const initializeChat = async () => {
    try {
      setInitializing(true);
      setError("");

      const token = getAccessToken();

      console.log("CHAT ACCESS TOKEN:", token ? "FOUND" : "NOT FOUND");

      if (!token) {
        setError("Your session has expired. Please login again.");
        setInitializing(false);
        return;
      }

      // ----------------------------------------------------------
      // GET EXISTING CONVERSATIONS
      // ----------------------------------------------------------

      const response = await axios.get(
        `${API_BASE_URL}/conversations`,
        {
          headers: getHeaders(),
          withCredentials: true,
        }
      );

      console.log("CONVERSATIONS RESPONSE:", response.data);

      const conversations =
        response.data?.conversations || [];

      setRecentChats(conversations);

      let activeConversationId;

      // ----------------------------------------------------------
      // EXISTING CONVERSATION
      // ----------------------------------------------------------

      if (conversations.length > 0) {
        activeConversationId = conversations[0]._id;
      }

      // ----------------------------------------------------------
      // CREATE NEW CONVERSATION
      // ----------------------------------------------------------

      else {
        const newConversationResponse =
          await axios.post(
            `${API_BASE_URL}/conversations`,
            {},
            {
              headers: getHeaders(),
              withCredentials: true,
            }
          );

        console.log(
          "NEW CONVERSATION RESPONSE:",
          newConversationResponse.data
        );

        activeConversationId =
          newConversationResponse.data?.conversation?._id;

        if (!activeConversationId) {
          throw new Error(
            "Conversation ID was not returned by the server."
          );
        }
      }

      console.log(
        "ACTIVE CONVERSATION ID:",
        activeConversationId
      );

      setConversationId(activeConversationId);

      // ----------------------------------------------------------
      // HOME SE INITIAL QUESTION
      // ----------------------------------------------------------

      const storedQuestion =
        sessionStorage.getItem("initialQuestion");

      if (storedQuestion) {
        sessionStorage.removeItem("initialQuestion");

        await sendQuestion(
          storedQuestion,
          activeConversationId
        );
      }
    } catch (err) {
      console.error(
        "CHAT INITIALIZATION ERROR:",
        err
      );

      console.error(
        "STATUS:",
        err.response?.status
      );

      console.error(
        "DATA:",
        err.response?.data
      );

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error;

      setError(
        backendMessage ||
          "Unable to initialize the conversation. Please try again."
      );
    } finally {
      setInitializing(false);
    }
  };
  // ============================================================
  // SEND QUESTION
  // ============================================================

  const sendQuestion = async (
    questionText = question,
    activeConversationId = conversationId
  ) => {
    const cleanQuestion = questionText.trim();

    if (!cleanQuestion || loading) return;

    if (!activeConversationId) {
      setError("Conversation is not ready yet.");
      return;
    }

    setError("");

    // ----------------------------------------------------------
    // ADD USER MESSAGE IMMEDIATELY
    // ----------------------------------------------------------

    const temporaryUserMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: cleanQuestion,
    };

    setMessages((prev) => [
      ...prev,
      temporaryUserMessage,
    ]);

    setQuestion("");
    setLoading(true);

    try {
      // --------------------------------------------------------
      // CHAT API
      // --------------------------------------------------------

      const response = await axios.post(
        `${API_BASE_URL}/chat`,
        {
          conversationId: activeConversationId,
          question: cleanQuestion,
        },
        {
          headers: getHeaders(),
          withCredentials: true,
        }
      );

      const data = response.data;

      // --------------------------------------------------------
      // ADD AI RESPONSE
      // --------------------------------------------------------

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content:
          data.answer ||
          "I couldn't find an answer to your question.",
        sources: data.sources || [],
      };

      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);

      // update recent chats
      setRecentChats((prev) => {
        if (!prev.length) return prev;

        const updated = [...prev];

        updated[0] = {
          ...updated[0],
          updatedAt: new Date().toISOString(),
        };

        return updated;
      });
    } catch (err) {
      console.error("CHAT API ERROR:", err);

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error;

      setError(
        backendMessage ||
          "Unable to get a response. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FORM SUBMIT
  // ============================================================

  const handleSubmit = (e) => {
    e.preventDefault();

    sendQuestion();
  };

  // ============================================================
  // ENTER KEY
  // ============================================================

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion();
    }
  };

  // ============================================================
  // COPY RESPONSE
  // ============================================================

  const copyMessage = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(id);

      setTimeout(() => {
        setCopied(null);
      }, 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  // ============================================================
  // NEW CHAT
  // ============================================================

  const startNewChat = async () => {
    try {
      setLoading(false);
      setError("");

      const response = await axios.post(
        `${API_BASE_URL}/conversations`,
        {},
        {
          headers: getHeaders(),
          withCredentials: true,
        }
      );

      const newId =
        response.data?.conversation?._id;

      if (!newId) {
        throw new Error("New conversation ID not received.");
      }

      setConversationId(newId);
      setMessages([]);

      setRecentChats((prev) => [
        response.data.conversation,
        ...prev,
      ]);
    } catch (err) {
      console.error("NEW CHAT ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Unable to start a new conversation."
      );
    }
  };

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (initializing) {
    return (
      <div className="chat-loading-screen">
        <div className="loading-logo">
          <MessageCircle size={30} />
        </div>

        <div className="loading-title">
          BIS Sahayak
        </div>

        <div className="loading-subtitle">
          Preparing your secure conversation...
        </div>

        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>

        <style>{styles}</style>
      </div>
    );
  }

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="chat-page">

      {/* ======================================================
          MOBILE OVERLAY
      ======================================================= */}

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ======================================================
          SIDEBAR
      ======================================================= */}

      <aside
        className={`chat-sidebar ${
          sidebarOpen ? "sidebar-open" : ""
        }`}
      >
        <div className="sidebar-top">

          {/* Logo */}
          <div className="brand">
            <div className="brand-logo">
              <span className="brand-symbol">◆</span>
            </div>

            <div>
              <div className="brand-name">
                BIS Sahayak
              </div>

              <div className="brand-subtitle">
                OFFICIAL AI ASSISTANT
              </div>
            </div>

            <button
              className="mobile-close"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={21} />
            </button>
          </div>

          {/* Certification */}
          <button className="certification-button">
            <Plus size={17} />
            <span>Start Certification</span>
          </button>

          {/* Navigation */}
          <nav className="sidebar-nav">

            <button
              className="nav-item"
              onClick={() =>
                (window.location.href = "/home")
              }
            >
              <HomeIcon size={22} />
              <span>Home</span>
            </button>

            <button className="nav-item active">
              <MessageCircle size={22} />
              <span>AI Assistant</span>
            </button>

            <button
              className="nav-item"
              onClick={() =>
                (window.location.href = "/standards")
              }
            >
              <FileText size={22} />
              <span>Standards</span>
            </button>

            <button className="nav-item">
              <CheckCircle size={22} />
              <span>Certification</span>
            </button>

            <button className="nav-item">
              <FlaskConical size={22} />
              <span>Testing Labs</span>
            </button>

            <button className="nav-item">
              <Shield size={22} />
              <span>Hallmarking</span>
            </button>
          </nav>

          {/* Recent Chats */}
          <div className="recent-section">

            <div className="recent-title">
              RECENT CHATS
            </div>

            {recentChats.length === 0 ? (
              <div className="no-chats">
                No recent chats
              </div>
            ) : (
              recentChats
                .slice(0, 5)
                .map((chat) => (
                  <button
                    key={chat._id}
                    className="recent-chat"
                    onClick={() => {
                      setConversationId(chat._id);
                      setMessages([]);
                      setSidebarOpen(false);
                    }}
                  >
                    {chat.title || "New Conversation"}
                  </button>
                ))
            )}
          </div>
        </div>

        {/* Bottom Sidebar */}
        <div className="sidebar-bottom">

          <button
            className="sidebar-bottom-item"
            onClick={startNewChat}
          >
            <MessageCircle size={21} />
            <span>New Chat</span>
          </button>

          <button className="sidebar-bottom-item">
            <User size={21} />
            <span>Profile</span>
          </button>

          <button className="sidebar-bottom-item">
            <HelpCircle size={21} />
            <span>Help</span>
          </button>

          <button
            className="sidebar-bottom-item"
            onClick={() =>
              (window.location.href = "/login")
            }
          >
            <LogOut size={21} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ======================================================
          MAIN
      ======================================================= */}

      <main className="chat-main">

        {/* Mobile Header */}
        <div className="mobile-header">
          <button
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="mobile-title">
            BIS Sahayak
          </div>

          <button onClick={startNewChat}>
            <Plus size={22} />
          </button>
        </div>

        {/* ====================================================
            CHAT CONTENT
        ===================================================== */}

        <div className="chat-content">

          {/* Empty State */}
          {messages.length === 0 && !loading && (
            <div className="empty-chat">

              <div className="empty-icon">
                <MessageCircle size={32} />
              </div>

              <h1>
                How can I help you today?
              </h1>

              <p>
                Ask about Indian Standards, certification,
                ISI Mark, HUID, testing requirements, or
                BIS services.
              </p>

              <div className="suggestions">

                <button
                  onClick={() =>
                    sendQuestion(
                      "What are the main activities of BIS?"
                    )
                  }
                >
                  What are the main activities of BIS?
                </button>

                <button
                  onClick={() =>
                    sendQuestion(
                      "What is the ISI Mark?"
                    )
                  }
                >
                  What is the ISI Mark?
                </button>

                <button
                  onClick={() =>
                    sendQuestion(
                      "How can I verify a BIS licence?"
                    )
                  }
                >
                  How can I verify a BIS licence?
                </button>

              </div>
            </div>
          )}

          {/* ==================================================
              MESSAGES
          =================================================== */}

          {messages.length > 0 && (
            <div className="messages-container">

              {/* Date */}
              <div className="chat-date">
                Today
              </div>

              {messages.map((message) => {

                if (message.role === "user") {
                  return (
                    <div
                      className="user-message-row"
                      key={message.id}
                    >
                      <div className="user-message">
                        {message.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    className="assistant-message"
                    key={message.id}
                  >

                    {/* Header */}
                    <div className="answer-header">

                      <div className="verified-title">
                        <span className="verified-icon">
                          <Check size={14} />
                        </span>

                        <span>
                          Verified Standard Information
                        </span>
                      </div>

                      <div className="confidence">
                        <span>
                          Confidence Score:
                        </span>

                        <div className="confidence-bar">
                          <div className="confidence-fill"></div>
                        </div>

                        <strong>98%</strong>
                      </div>
                    </div>

                    {/* Answer */}
                    <div className="answer-content">
                      {message.content}
                    </div>

                    {/* Information Cards */}
                    <div className="info-grid">

                      <div className="info-card">
                        <div className="info-card-header">
                          <div className="info-card-title">
                            <Shield size={21} />
                            <span>
                              Safety Parameters
                            </span>
                          </div>

                          <ChevronDown size={19} />
                        </div>

                        <ul>
                          <li>
                            Protection against electric shock
                          </li>
                          <li>
                            Heating under normal operation
                          </li>
                          <li>
                            Leakage current and electric strength
                          </li>
                        </ul>
                      </div>

                      <div className="info-card">
                        <div className="info-card-header">
                          <div className="info-card-title">
                            <CheckCircle size={21} />
                            <span>
                              Performance Test
                            </span>
                          </div>

                          <ChevronDown size={19} />
                        </div>

                        <ul>
                          <li>
                            Abnormal operation tests
                          </li>
                          <li>
                            Mechanical strength
                          </li>
                          <li>
                            Internal wiring integrity
                          </li>
                          <li>
                            Resistance to heat and fire
                          </li>
                        </ul>
                      </div>

                    </div>

                    {/* Sources */}
                    {message.sources?.length > 0 && (
                      <div className="sources-section">

                        {message.sources.map(
                          (source, index) => (
                            <div
                              className="source-card"
                              key={`${source}-${index}`}
                            >
                              <div className="source-left">
                                <div className="source-line"></div>

                                <div>
                                  <div className="source-name">
                                    {source}
                                  </div>

                                  <div className="source-description">
                                    Verified BIS source document
                                  </div>
                                </div>
                              </div>

                              <button className="source-button">
                                <Search size={16} />
                                View Source
                              </button>
                            </div>
                          )
                        )}

                      </div>
                    )}

                    {/* Actions */}
                    <div className="message-actions">

                      <button
                        onClick={() =>
                          copyMessage(
                            message.content,
                            message.id
                          )
                        }
                        title="Copy"
                      >
                        {copied === message.id ? (
                          <Check size={18} />
                        ) : (
                          <Copy size={18} />
                        )}
                      </button>

                      <button title="Helpful">
                        <ThumbsUp size={18} />
                      </button>

                      <button title="Not helpful">
                        <ThumbsDown size={18} />
                      </button>

                    </div>

                  </div>
                );
              })}

              {/* Loading */}
              {loading && (
                <div className="typing-message">

                  <div className="typing-icon">
                    <MessageCircle size={18} />
                  </div>

                  <div className="typing-content">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                  <div className="typing-text">
                    BIS Sahayak is thinking...
                  </div>

                </div>
              )}

              <div ref={messagesEndRef} />

            </div>
          )}

        </div>

        {/* ====================================================
            ERROR
        ===================================================== */}

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {/* ====================================================
            INPUT
        ===================================================== */}

        <div className="input-wrapper">

          <form
            className="chat-input-container"
            onSubmit={handleSubmit}
          >

            <button
              type="button"
              className="attach-button"
              title="Attach document"
            >
              <Paperclip size={23} />
            </button>

            <textarea
              ref={textareaRef}
              value={question}
              onChange={(e) =>
                setQuestion(e.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask about standards, certification processes, or upload documents for review..."
              rows={1}
              disabled={loading || !conversationId}
            />

            <button
              type="submit"
              className="send-button"
              disabled={
                loading ||
                !question.trim() ||
                !conversationId
              }
            >
              <ArrowRight size={25} />
            </button>

          </form>

          <div className="input-disclaimer">
            BIS Sahayak provides information based on
            available BIS standards and official sources.
          </div>

        </div>

      </main>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
* {
  box-sizing: border-box;
}

.chat-page {
  min-height: 100vh;
  width: 100%;
  display: flex;
  background: #f5f7fa;
  color: #17202b;
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

/* ============================================================
   SIDEBAR
============================================================ */

.chat-sidebar {
  width: 286px;
  min-width: 286px;
  height: 100vh;
  background: #e9edef;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px 22px 24px;
  position: sticky;
  top: 0;
  z-index: 20;
}

.sidebar-top {
  width: 100%;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 25px;
}

.brand-logo {
  width: 47px;
  height: 47px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  color: #063461;
  font-size: 22px;
}

.brand-symbol {
  transform: rotate(45deg);
  display: inline-block;
}

.brand-name {
  font-size: 18px;
  font-weight: 750;
  color: #111827;
}

.brand-subtitle {
  margin-top: 2px;
  font-size: 9px;
  letter-spacing: .4px;
  color: #82909e;
  font-weight: 600;
}

.certification-button {
  width: 100%;
  height: 47px;
  border: none;
  border-radius: 25px;
  background: #062e59;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 20px;
}

.certification-button:hover {
  background: #073c70;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  border: none;
  background: transparent;
  height: 47px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 13px;
  font-size: 15px;
  color: #20252b;
  cursor: pointer;
  text-align: left;
  transition: .2s;
}

.nav-item:hover {
  background: rgba(255,255,255,.7);
}

.nav-item.active {
  color: white;
  background: #11ae99;
}

.nav-item svg {
  stroke-width: 1.8;
}

.recent-section {
  margin-top: 28px;
}

.recent-title {
  font-size: 11px;
  font-weight: 800;
  color: #66727e;
  margin-bottom: 9px;
  letter-spacing: .4px;
}

.recent-chat {
  display: block;
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  color: #27313a;
  font-size: 13px;
  padding: 7px 0;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-chat:hover {
  color: #079d89;
}

.no-chats {
  color: #9aa5af;
  font-size: 12px;
}

.sidebar-bottom {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar-bottom-item {
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 13px;
  color: #87939e;
  padding: 8px 8px;
  cursor: pointer;
  font-size: 14px;
  text-align: left;
}

.sidebar-bottom-item:hover {
  color: #25313c;
}

.mobile-close {
  display: none;
}

/* ============================================================
   MAIN
============================================================ */

.chat-main {
  flex: 1;
  min-width: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.chat-content {
  flex: 1;
  overflow-y: auto;
  padding: 42px 5.2% 150px;
}

.messages-container {
  max-width: 1170px;
  margin: 0 auto;
}

.chat-date {
  text-align: center;
  color: #8d9aa7;
  font-size: 13px;
  margin-bottom: 13px;
}

/* ============================================================
   EMPTY STATE
============================================================ */

.empty-chat {
  max-width: 800px;
  margin: 11vh auto 0;
  text-align: center;
}

.empty-icon {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background: #dff7f2;
  color: #0da994;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 23px;
}

.empty-chat h1 {
  font-size: clamp(30px, 3vw, 45px);
  margin: 0 0 12px;
  color: #101820;
  letter-spacing: -1.2px;
}

.empty-chat p {
  color: #6c7884;
  max-width: 650px;
  line-height: 1.6;
  margin: 0 auto;
  font-size: 16px;
}

.suggestions {
  margin-top: 35px;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.suggestions button {
  border: 1px solid #dce2e7;
  background: white;
  border-radius: 25px;
  padding: 11px 17px;
  color: #475461;
  cursor: pointer;
  font-size: 13px;
}

.suggestions button:hover {
  border-color: #0db09a;
  color: #079b89;
}

/* ============================================================
   USER MESSAGE
============================================================ */

.user-message-row {
  display: flex;
  justify-content: flex-end;
  margin: 10px 0 30px;
}

.user-message {
  max-width: 690px;
  background: #0c1117;
  color: white;
  padding: 18px 25px;
  border-radius: 19px 19px 5px 19px;
  font-size: 15px;
  line-height: 1.55;
  box-shadow: 0 3px 10px rgba(0,0,0,.06);
}

/* ============================================================
   ASSISTANT
============================================================ */

.assistant-message {
  background: white;
  border: 1px solid #e1e6ea;
  border-radius: 20px;
  padding: 20px 25px 16px;
  margin-bottom: 35px;
  box-shadow: 0 4px 18px rgba(22,35,50,.035);
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding-bottom: 17px;
  border-bottom: 1px solid #e8ecef;
}

.verified-title {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 16px;
  font-weight: 750;
}

.verified-icon {
  width: 19px;
  height: 19px;
  border-radius: 50%;
  background: #d9f7ed;
  color: #0eaa91;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confidence {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #8996a2;
  font-size: 12px;
  white-space: nowrap;
}

.confidence strong {
  color: #08a88e;
  font-size: 14px;
}

.confidence-bar {
  width: 100px;
  height: 8px;
  background: #dfe6e9;
  border-radius: 10px;
  overflow: hidden;
}

.confidence-fill {
  width: 98%;
  height: 100%;
  background: #12b19a;
  border-radius: inherit;
}

.answer-content {
  padding: 15px 0 21px;
  color: #45515d;
  font-size: 15px;
  line-height: 1.55;
}

/* ============================================================
   INFO CARDS
============================================================ */

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-card {
  background: #f7f9fa;
  border: 1px solid #e1e6e9;
  border-radius: 15px;
  padding: 17px 18px;
}

.info-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #8794a0;
}

.info-card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #1b242c;
  font-size: 15px;
  font-weight: 700;
}

.info-card-title svg {
  color: #0aa991;
}

.info-card ul {
  margin: 12px 0 0;
  padding-left: 22px;
}

.info-card li {
  color: #4f5b67;
  font-size: 13.5px;
  line-height: 1.5;
  padding: 4px 0;
}

.info-card li::marker {
  color: #10b49a;
}

/* ============================================================
   SOURCES
============================================================ */

.sources-section {
  margin-top: 25px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.source-card {
  min-height: 57px;
  background: #edf4fc;
  border-radius: 9px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 14px 9px 0;
  overflow: hidden;
}

.source-left {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.source-line {
  width: 4px;
  align-self: stretch;
  min-height: 40px;
  background: #0eb39a;
  border-radius: 0 3px 3px 0;
}

.source-name {
  color: #18212a;
  font-size: 14px;
  font-weight: 750;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.source-description {
  margin-top: 3px;
  color: #74818d;
  font-size: 12px;
}

.source-button {
  flex-shrink: 0;
  border: 1px solid #0ca895;
  background: white;
  color: #078f80;
  border-radius: 20px;
  padding: 8px 13px;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.source-button:hover {
  background: #e9faf6;
}

/* ============================================================
   ACTIONS
============================================================ */

.message-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 15px;
}

.message-actions button {
  border: none;
  background: transparent;
  color: #9ba7b1;
  cursor: pointer;
  padding: 5px;
}

.message-actions button:hover {
  color: #0ca991;
}

/* ============================================================
   TYPING
============================================================ */

.typing-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 10px 25px;
  color: #8b98a3;
}

.typing-icon {
  color: #0aa993;
}

.typing-content {
  display: flex;
  gap: 4px;
}

.typing-content span {
  width: 6px;
  height: 6px;
  background: #0ba993;
  border-radius: 50%;
  animation: typing 1.2s infinite;
}

.typing-content span:nth-child(2) {
  animation-delay: .15s;
}

.typing-content span:nth-child(3) {
  animation-delay: .3s;
}

@keyframes typing {
  0%, 60%, 100% {
    opacity: .3;
    transform: translateY(0);
  }

  30% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

.typing-text {
  font-size: 12px;
}

/* ============================================================
   INPUT
============================================================ */

.input-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 15px 5.2% 17px;
  background: linear-gradient(
    to top,
    #f5f7fa 72%,
    rgba(245,247,250,0)
  );
}

.chat-input-container {
  max-width: 1170px;
  margin: 0 auto;
  min-height: 63px;
  border: 1px solid #dde3e7;
  border-radius: 34px;
  background: white;
  display: flex;
  align-items: center;
  padding: 7px 9px 7px 17px;
  box-shadow: 0 4px 20px rgba(24,37,49,.05);
}

.chat-input-container textarea {
  flex: 1;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  font-family: inherit;
  color: #26313b;
  font-size: 14px;
  line-height: 1.5;
  padding: 11px 10px;
  max-height: 100px;
}

.chat-input-container textarea::placeholder {
  color: #a1acb8;
}

.attach-button {
  border: none;
  background: transparent;
  color: #a0acb6;
  cursor: pointer;
  padding: 7px;
}

.attach-button:hover {
  color: #0ba993;
}

.send-button {
  width: 45px;
  height: 45px;
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  background: #11ae99;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.send-button:hover {
  background: #079982;
}

.send-button:disabled {
  background: #b8dcd6;
  cursor: not-allowed;
}

.input-disclaimer {
  max-width: 1170px;
  margin: 6px auto 0;
  text-align: center;
  color: #a0aab4;
  font-size: 10px;
}

/* ============================================================
   ERROR
============================================================ */

.error-banner {
  position: absolute;
  bottom: 96px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff0ef;
  border: 1px solid #ffc5c1;
  color: #c53b32;
  padding: 9px 17px;
  border-radius: 8px;
  font-size: 12px;
  z-index: 10;
}

/* ============================================================
   LOADING SCREEN
============================================================ */

.chat-loading-screen {
  width: 100%;
  height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #18222d;
}

.loading-logo {
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background: #dff7f2;
  color: #0ba992;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.loading-title {
  font-size: 21px;
  font-weight: 750;
}

.loading-subtitle {
  color: #8996a3;
  font-size: 13px;
  margin-top: 5px;
}

.loading-dots {
  display: flex;
  gap: 5px;
  margin-top: 20px;
}

.loading-dots span {
  width: 7px;
  height: 7px;
  background: #0ba993;
  border-radius: 50%;
  animation: typing 1.2s infinite;
}

.loading-dots span:nth-child(2) {
  animation-delay: .15s;
}

.loading-dots span:nth-child(3) {
  animation-delay: .3s;
}

/* ============================================================
   MOBILE
============================================================ */

.mobile-header {
  display: none;
}

.sidebar-overlay {
  display: none;
}

@media (max-width: 900px) {

  .chat-sidebar {
    position: fixed;
    left: -300px;
    top: 0;
    bottom: 0;
    transition: left .25s ease;
    box-shadow: 5px 0 25px rgba(0,0,0,.1);
  }

  .chat-sidebar.sidebar-open {
    left: 0;
  }

  .mobile-close {
    display: block;
    margin-left: auto;
    border: none;
    background: transparent;
    color: #6e7b87;
    cursor: pointer;
  }

  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.25);
    z-index: 15;
  }

  .mobile-header {
    height: 62px;
    background: white;
    border-bottom: 1px solid #e4e8eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px;
  }

  .mobile-header button {
    border: none;
    background: transparent;
    color: #23303a;
    cursor: pointer;
  }

  .mobile-title {
    font-weight: 750;
  }

  .chat-content {
    padding: 28px 20px 145px;
  }

  .input-wrapper {
    padding: 10px 15px 12px;
  }
}

@media (max-width: 650px) {

  .answer-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .confidence {
    width: 100%;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .assistant-message {
    padding: 16px;
    border-radius: 15px;
  }

  .user-message {
    max-width: 88%;
    padding: 14px 17px;
  }

  .source-card {
    align-items: flex-start;
    gap: 10px;
    flex-direction: column;
    padding: 10px 12px 10px 0;
  }

  .source-button {
    margin-left: 18px;
  }

  .empty-chat {
    margin-top: 7vh;
  }

  .empty-chat h1 {
    font-size: 29px;
  }

  .empty-chat p {
    font-size: 14px;
  }

  .suggestions {
    flex-direction: column;
  }

  .suggestions button {
    width: 100%;
  }

  .input-disclaimer {
    display: none;
  }
}
`;

export default Chat;