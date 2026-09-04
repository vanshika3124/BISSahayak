import React from "react";
import {
  Home as HomeIcon,
  MessageCircle,
  FileText,
  CheckCircle2,
  FlaskConical,
  Shield,
  User,
  CircleHelp,
  LogOut,
  Search,
  Mic,
  ChevronRight,
  Clock3,
  QrCode,
} from "lucide-react";

const Home = () => {
  const quickServices = [
    {
      icon: QrCode,
      title: "Verify HUID",
      description: "Check authenticity of hallmarked jewellery.",
    },
    {
      icon: CheckCircle2,
      title: "Check IS Mark",
      description: "Verify licenses and ISI mark validity.",
    },
    {
      icon: Search,
      title: "Product Finder",
      description: "Search standards by product category.",
    },
    {
      icon: CircleHelp,
      title: "Cert Help",
      description: "Guide for certification process.",
    },
  ];

  const recentActivities = [
    {
      icon: Clock3,
      title: "IS 1293: Plugs and Socket-Outlets",
      description: "Viewed standard details and testing requirements.",
      time: "2 hours ago",
    },
    {
      icon: MessageCircle,
      title: '"What is the fee for factory inspection?"',
      description: "AI Assistant chat query regarding Scheme-I.",
      time: "Yesterday",
    },
    {
      icon: FileText,
      title: "IS 456: Plain and Reinforced Concrete",
      description: "Downloaded PDF document.",
      time: "Oct 21, 2023",
    },
  ];

  const goToChat = (question = "") => {
    if (question.trim()) {
      sessionStorage.setItem("initialQuestion", question.trim());
    }

    window.location.href = "/chat";
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "/login";
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI",
            Roboto, Arial, sans-serif;
          background: #f7f8fa;
          color: #161b22;
        }

        button,
        input {
          font-family: inherit;
        }

        button {
          border: none;
        }

        .home-page {
          width: 100%;
          min-height: 100vh;
          display: flex;
          background: #f7f8fa;
        }

        /* ================= SIDEBAR ================= */

        .sidebar {
          width: 280px;
          min-width: 280px;
          height: 100vh;
          position: sticky;
          top: 0;
          display: flex;
          flex-direction: column;
          padding: 18px 20px 20px;
          background: #edf0f2;
          border-right: 1px solid #e0e4e7;
        }

        .sidebar-logo {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 28px;
        }

        .logo-mark {
          width: 43px;
          height: 43px;
          position: relative;
          flex-shrink: 0;
        }

        .logo-circle {
          width: 31px;
          height: 31px;
          position: absolute;
          left: 5px;
          top: 3px;
          border: 4px solid #0b3970;
          border-radius: 50%;
        }

        .logo-circle::after {
          content: "";
          width: 11px;
          height: 11px;
          position: absolute;
          left: 6px;
          top: 6px;
          background: #ef3434;
          border-radius: 50%;
        }

        .logo-lines {
          position: absolute;
          right: 0;
          top: 3px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .logo-lines span {
          width: 10px;
          height: 3px;
          background: #00a88f;
          border-radius: 3px;
        }

        .logo-lines span:nth-child(2) {
          width: 7px;
        }

        .logo-lines span:nth-child(3) {
          width: 4px;
        }

        .logo-text h2 {
          margin: 0;
          font-size: 19px;
          line-height: 22px;
          font-weight: 700;
          color: #11161c;
        }

        .logo-text span {
          display: block;
          margin-top: 3px;
          font-size: 9px;
          letter-spacing: 0.7px;
          color: #84909a;
          font-weight: 500;
        }

        /* ================= NAV ================= */

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .nav-item {
          width: 100%;
          height: 46px;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 0 12px;
          border-radius: 11px;
          background: transparent;
          color: #20252b;
          font-size: 15px;
          cursor: pointer;
          text-align: left;
          transition: 0.2s ease;
        }

        .nav-item:hover {
          background: #dfe5e7;
        }

        .nav-item.active {
          background: linear-gradient(135deg, #12b89e, #099f8d);
          color: white;
          box-shadow: 0 4px 10px rgba(0, 160, 140, 0.15);
        }

        .nav-item svg {
          flex-shrink: 0;
        }

        /* ================= SIDEBAR BOTTOM ================= */

        .sidebar-bottom {
          margin-top: auto;
        }

        .certification-btn {
          width: 100%;
          height: 48px;
          margin-bottom: 20px;
          border-radius: 25px;
          background: #073564;
          color: white;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .certification-btn:hover {
          background: #052c53;
          transform: translateY(-1px);
        }

        .bottom-links {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .bottom-link {
          width: 100%;
          height: 42px;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 0 10px;
          background: transparent;
          color: #96a0a8;
          font-size: 14px;
          text-align: left;
          border-radius: 8px;
        }

        .bottom-link.logout {
          cursor: pointer;
        }

        .bottom-link.logout:hover {
          background: #dfe4e7;
          color: #26323a;
        }

        .bottom-link.disabled {
          cursor: default;
        }

        /* ================= MAIN ================= */

        .main-content {
          flex: 1;
          min-width: 0;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 28px;
          padding: 0 24px 24px 50px;
        }

        .dashboard {
          min-width: 0;
          padding-top: 82px;
        }

        /* ================= HERO ================= */

        .hero-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .hero-section h1 {
          margin: 0;
          font-size: 34px;
          line-height: 1.2;
          font-weight: 750;
          letter-spacing: -1px;
          color: #171c23;
        }

        .hero-section > p {
          margin: 8px 0 25px;
          color: #687582;
          font-size: 16px;
        }

        .chat-search {
          width: min(660px, 100%);
          height: 58px;
          display: flex;
          align-items: center;
          padding: 0 9px 0 22px;
          border: 1px solid #dce1e5;
          border-radius: 31px;
          background: white;
          box-shadow: 0 2px 8px rgba(20, 30, 40, 0.03);
        }

        .search-icon {
          color: #99a6b2;
          flex-shrink: 0;
        }

        .chat-search input {
          flex: 1;
          min-width: 0;
          height: 100%;
          padding: 0 13px;
          border: none;
          outline: none;
          background: transparent;
          color: #20252b;
          font-size: 15px;
        }

        .chat-search input::placeholder {
          color: #adb7c2;
        }

        .voice-btn {
          width: 41px;
          height: 41px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50%;
          background: #12b49c;
          color: white;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .voice-btn:hover {
          background: #079e89;
          transform: scale(1.03);
        }

        /* ================= QUICK SERVICES ================= */

        .quick-services {
          margin-top: 28px;
        }

        .section-heading h2,
        .news-heading h2 {
          margin: 0;
          font-size: 19px;
          font-weight: 700;
          color: #1b222a;
        }

        .services-grid {
          margin-top: 17px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 17px;
        }

        .service-card {
          min-height: 153px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 21px;
          text-align: left;
          border: 1px solid #e0e4e8;
          border-radius: 17px;
          background: white;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .service-card:hover {
          transform: translateY(-2px);
          border-color: #b8ded7;
          box-shadow: 0 7px 20px rgba(20, 40, 50, 0.06);
        }

        .service-icon {
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          border-radius: 13px;
          background: #dcf7f1;
          color: #00a991;
        }

        .service-content h3 {
          margin: 0 0 5px;
          font-size: 16px;
          font-weight: 700;
          color: #1d242b;
        }

        .service-content p {
          max-width: 270px;
          margin: 0;
          color: #687582;
          font-size: 14px;
          line-height: 1.35;
        }

        /* ================= NEWS ================= */

        .news-section {
          margin-top: 43px;
        }

        .news-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .view-all-btn {
          background: transparent;
          color: #009b87;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .news-card {
          min-height: 108px;
          position: relative;
          display: flex;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 14px;
          padding: 18px 18px 18px 16px;
          border: 1px solid #e1e5e8;
          border-radius: 16px;
          background: white;
        }

        .news-status {
          width: 8px;
          height: 8px;
          margin-top: 5px;
          flex-shrink: 0;
          border-radius: 50%;
        }

        .news-status.alert {
          background: #e94747;
        }

        .news-status.update {
          background: #21b982;
        }

        .news-details {
          flex: 1;
          min-width: 0;
        }

        .news-meta {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 5px;
          color: #9aa4ad;
          font-size: 12px;
        }

        .news-label {
          padding: 3px 8px;
          border-radius: 5px;
          font-size: 9px;
          font-weight: 800;
        }

        .alert-label {
          background: #ffe8e8;
          color: #e34b4b;
        }

        .update-label {
          background: #dcf7ea;
          color: #18a66e;
        }

        .news-details h3 {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 700;
          color: #1d2329;
        }

        .news-details p {
          max-width: 700px;
          margin: 0;
          color: #697681;
          font-size: 13px;
          line-height: 1.4;
        }

        .news-arrow {
          align-self: center;
          color: #aab5bd;
          flex-shrink: 0;
        }

        /* ================= RECENT ACTIVITY ================= */

        .recent-panel {
          height: calc(100vh - 36px);
          min-height: 620px;
          position: sticky;
          top: 18px;
          align-self: start;
          display: flex;
          flex-direction: column;
          padding: 24px 21px 14px;
          margin-top: 18px;
          border-radius: 22px;
          background: #000;
          color: white;
        }

        .recent-content {
          flex: 1;
          min-height: 0;
        }

        .recent-panel h2 {
          margin: 0 0 17px;
          font-size: 17px;
          font-weight: 700;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
        }

        .activity-item {
          display: flex;
          gap: 12px;
          padding: 14px 0;
          border-bottom: 1px solid #202020;
        }

        .activity-item:first-child {
          padding-top: 0;
        }

        .activity-icon {
          width: 35px;
          height: 35px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 10px;
          background: #002f2a;
          color: #00c6a7;
        }

        .activity-details {
          min-width: 0;
        }

        .activity-details h3 {
          margin: 0 0 5px;
          color: #f2f2f2;
          font-size: 13px;
          line-height: 1.3;
          font-weight: 700;
        }

        .activity-details p {
          margin: 0 0 5px;
          color: #90969c;
          font-size: 12px;
          line-height: 1.4;
        }

        .activity-details span {
          color: #777d82;
          font-size: 11px;
        }

        .history-btn {
          width: 100%;
          height: 47px;
          flex-shrink: 0;
          border-radius: 11px;
          background: #484d55;
          color: white;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s ease;
        }

        .history-btn:hover {
          background: #575d66;
        }

        /* ================= TABLET ================= */

        @media (max-width: 1200px) {
          .sidebar {
            width: 245px;
            min-width: 245px;
          }

          .main-content {
            grid-template-columns: minmax(0, 1fr) 300px;
            gap: 20px;
            padding-left: 30px;
          }

          .hero-section h1 {
            font-size: 30px;
          }
        }

        /* ================= SMALL TABLET ================= */

        @media (max-width: 950px) {
          .sidebar {
            width: 210px;
            min-width: 210px;
            padding-left: 14px;
            padding-right: 14px;
          }

          .main-content {
            grid-template-columns: 1fr;
            padding: 0 25px 30px;
          }

          .recent-panel {
            position: relative;
            top: auto;
            height: auto;
            min-height: 400px;
            margin-top: 0;
          }

          .dashboard {
            padding-top: 45px;
          }
        }

        /* ================= MOBILE ================= */

        @media (max-width: 700px) {
          .home-page {
            display: block;
          }

          .sidebar {
            width: 100%;
            min-width: 0;
            height: auto;
            position: relative;
            padding: 14px 16px;
            border-right: none;
            border-bottom: 1px solid #dde2e5;
          }

          .sidebar-logo {
            margin-bottom: 12px;
          }

          .sidebar-nav {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 5px;
          }

          .nav-item {
            height: 42px;
            justify-content: center;
            padding: 0 5px;
            gap: 6px;
            font-size: 11px;
          }

          .nav-item svg {
            width: 19px;
            height: 19px;
          }

          .sidebar-bottom {
            display: none;
          }

          .main-content {
            display: block;
            padding: 0 15px 25px;
          }

          .dashboard {
            padding-top: 35px;
          }

          .hero-section h1 {
            font-size: 27px;
            letter-spacing: -0.6px;
          }

          .hero-section > p {
            font-size: 14px;
            margin-bottom: 20px;
          }

          .chat-search {
            height: 54px;
            padding-left: 15px;
          }

          .chat-search input {
            font-size: 13px;
            padding: 0 8px;
          }

          .services-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .service-card {
            min-height: 130px;
          }

          .news-section {
            margin-top: 32px;
          }

          .news-card {
            padding: 15px 13px;
          }

          .news-details h3 {
            font-size: 14px;
          }

          .news-details p {
            font-size: 12px;
          }

          .recent-panel {
            min-height: 430px;
            margin-top: 25px;
            border-radius: 18px;
          }
        }

        /* ================= VERY SMALL MOBILE ================= */

        @media (max-width: 430px) {
          .sidebar-nav {
            grid-template-columns: repeat(2, 1fr);
          }

          .nav-item {
            justify-content: flex-start;
            padding-left: 12px;
          }

          .hero-section h1 {
            font-size: 24px;
          }

          .chat-search {
            height: 51px;
          }

          .voice-btn {
            width: 37px;
            height: 37px;
          }
        }
      `}</style>

      <div className="home-page">

        {/* ================= SIDEBAR ================= */}
        <aside className="sidebar">

          <div className="sidebar-logo">
            <div className="logo-mark">
              <div className="logo-circle"></div>

              <div className="logo-lines">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>

            <div className="logo-text">
              <h2>BIS Sahayak</h2>
              <span>OFFICIAL AI ASSISTANT</span>
            </div>
          </div>

          <nav className="sidebar-nav">

            <button className="nav-item active">
              <HomeIcon size={24} strokeWidth={1.8} />
              <span>Home</span>
            </button>

            <button
              className="nav-item"
              onClick={() => goToChat()}
            >
              <MessageCircle size={24} strokeWidth={1.8} />
              <span>AI Assistant</span>
            </button>

            <button className="nav-item">
              <FileText size={24} strokeWidth={1.8} />
              <span>Standards</span>
            </button>

            <button className="nav-item">
              <CheckCircle2 size={24} strokeWidth={1.8} />
              <span>Certification</span>
            </button>

            <button className="nav-item">
              <FlaskConical size={24} strokeWidth={1.8} />
              <span>Testing Labs</span>
            </button>

            <button className="nav-item">
              <Shield size={24} strokeWidth={1.8} />
              <span>Hallmarking</span>
            </button>

          </nav>

          <div className="sidebar-bottom">

            <button className="certification-btn">
              Start Certification
            </button>

            <div className="bottom-links">

              <button className="bottom-link disabled">
                <User size={23} />
                <span>Profile</span>
              </button>

              <button className="bottom-link disabled">
                <CircleHelp size={23} />
                <span>Help</span>
              </button>

              <button
                className="bottom-link logout"
                onClick={handleLogout}
              >
                <LogOut size={23} />
                <span>Logout</span>
              </button>

            </div>
          </div>

        </aside>


        {/* ================= MAIN ================= */}
        <main className="main-content">

          <section className="dashboard">

            {/* HERO */}
            <div className="hero-section">

              <h1>How can I help you today?</h1>

              <p>
                Ask about ISI Mark, HUID, or search standards.
              </p>

              <div className="chat-search">

                <Search
                  size={24}
                  className="search-icon"
                />

                <input
                  type="text"
                  placeholder="e.g., How to apply for ISI mark for cement?"
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      e.target.value.trim()
                    ) {
                      goToChat(e.target.value);
                    }
                  }}
                />

                <button
                  className="voice-btn"
                  title="Voice input"
                >
                  <Mic size={23} />
                </button>

              </div>

            </div>


            {/* QUICK SERVICES */}
            <section className="quick-services">

              <div className="section-heading">
                <h2>Quick Services</h2>
              </div>

              <div className="services-grid">

                {quickServices.map((service, index) => {
                  const Icon = service.icon;

                  return (
                    <button
                      className="service-card"
                      key={index}
                      onClick={() => {
                        if (service.title === "Cert Help") {
                          goToChat(
                            "I need help with the BIS certification process."
                          );
                        }
                      }}
                    >

                      <div className="service-icon">
                        <Icon
                          size={27}
                          strokeWidth={1.8}
                        />
                      </div>

                      <div className="service-content">

                        <h3>{service.title}</h3>

                        <p>
                          {service.description}
                        </p>

                      </div>

                    </button>
                  );
                })}

              </div>

            </section>


            {/* NEWS */}
            <section className="news-section">

              <div className="news-heading">

                <h2>News & Amendments</h2>

                <button className="view-all-btn">
                  View All
                </button>

              </div>


              <div className="news-card">

                <div className="news-status alert"></div>

                <div className="news-details">

                  <div className="news-meta">
                    <span className="news-label alert-label">
                      ALERT
                    </span>

                    <span>Oct 24, 2023</span>
                  </div>

                  <h3>
                    Mandatory Certification for Footwear
                  </h3>

                  <p>
                    QCO implementation date for footwear
                    products extended. Check updated
                    guidelines for compliance.
                  </p>

                </div>

                <ChevronRight
                  size={26}
                  className="news-arrow"
                />

              </div>


              <div className="news-card">

                <div className="news-status update"></div>

                <div className="news-details">

                  <div className="news-meta">

                    <span className="news-label update-label">
                      UPDATE
                    </span>

                    <span>Oct 20, 2023</span>

                  </div>

                  <h3>
                    Revision of IS 10500: Drinking Water
                  </h3>

                  <p>
                    New amendments published regarding heavy
                    metal limits. Effective from next month.
                  </p>

                </div>

                <ChevronRight
                  size={26}
                  className="news-arrow"
                />

              </div>

            </section>

          </section>


          {/* ================= RECENT ACTIVITY ================= */}
          <aside className="recent-panel">

            <div className="recent-content">

              <h2>Recent Activity</h2>

              <div className="activity-list">

                {recentActivities.map((activity, index) => {

                  const Icon = activity.icon;

                  return (
                    <div
                      className="activity-item"
                      key={index}
                    >

                      <div className="activity-icon">
                        <Icon
                          size={21}
                          strokeWidth={1.8}
                        />
                      </div>

                      <div className="activity-details">

                        <h3>
                          {activity.title}
                        </h3>

                        <p>
                          {activity.description}
                        </p>

                        <span>
                          {activity.time}
                        </span>

                      </div>

                    </div>
                  );
                })}

              </div>

            </div>

            <button className="history-btn">
              View All History
            </button>

          </aside>

        </main>

      </div>
    </>
  );
};

export default Home;