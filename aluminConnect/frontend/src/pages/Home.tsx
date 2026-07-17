import { Link } from "react-router-dom";

const Home = () => {
  const features = [
    {
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "Alumni Network",
      desc: "Connect with thousands of graduates working across industries worldwide.",
    },
    {
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
      ),
      title: "Job Opportunities",
      desc: "Browse exclusive internships and jobs posted by alumni for students.",
    },
    {
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
      title: "Mentorship",
      desc: "Get career guidance from experienced alumni in your field of interest.",
    },
    {
      icon: (
        <svg
          className="w-7 h-7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
      title: "Events",
      desc: "Attend career fairs, alumni talks, and networking events on campus.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1e3a6e] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            className="w-6 h-6 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
          </svg>
          <span className="text-white font-bold text-lg">Alumni Connect</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="text-blue-200 hover:text-white text-sm font-medium transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/register"
            className="bg-[#d2621a] hover:bg-[#b85516] text-white text-sm font-semibold px-4 py-2 rounded transition-colors"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-[#1e3a6e] text-white py-20 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
          Bridge the Gap Between
          <br />
          <span className="text-[#f0a35c]">Students & Alumni</span>
        </h1>
        <p className="text-blue-200 text-lg max-w-xl mx-auto mb-8">
          A professional platform connecting university students with alumni for
          mentorship, jobs, and networking.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/register"
            className="bg-[#d2621a] hover:bg-[#b85516] text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Register as Student
          </Link>
          <Link
            to="/register"
            className="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            Join as Alumni
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center px-6">
          {[
            { value: "10,000+", label: "Alumni" },
            { value: "5,000+", label: "Students" },
            { value: "2,500+", label: "Jobs Posted" },
            { value: "500+", label: "Events Held" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-2xl font-bold text-[#1e3a6e]">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">
          Everything You Need to Succeed
        </h2>
        <p className="text-center text-gray-500 mb-10 text-sm">
          One platform. Endless opportunities.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-[#eef2f9] rounded-lg flex items-center justify-center text-[#1e3a6e] mb-4">
                {f.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#1e3a6e] py-14 px-6 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">
          Ready to Build Your Future?
        </h2>
        <p className="text-blue-200 mb-6 text-sm">
          Join thousands of students and alumni already on the platform.
        </p>
        <Link
          to="/register"
          className="bg-[#d2621a] hover:bg-[#b85516] text-white font-semibold px-8 py-3 rounded-lg transition-colors"
        >
          Create Your Account
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 text-center py-5 text-sm">
        © {new Date().getFullYear()} Alumni Connect. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
