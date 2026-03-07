"use client";

import { useState, useEffect, useRef } from "react";

// ============================================================
// TYPES
// ============================================================
interface Repo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
}

// ============================================================
// STICKY NAV COMPONENT
// ============================================================
function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-black/80 backdrop-blur border-b border-white/10 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
        <span className="font-bold text-white text-lg tracking-tight">
          Dan<span className="text-blue-400">.</span>dev
        </span>
        <div className="flex gap-6 text-sm text-gray-400">
          {["about", "projects", "github", "contact"].map((section) => (
            <button
              key={section}
              onClick={() => scrollTo(section)}
              className="capitalize hover:text-white transition-colors cursor-pointer"
            >
              {section}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ============================================================
// ANIMATED PROJECT CARD COMPONENT
// ============================================================
interface ProjectCardProps {
  title: string;
  description: string;
  link: string;
  tags: string[];
  delay?: number;
}

function ProjectCard({ title, description, link, tags, delay = 0 }: ProjectCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <a
    
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      ref={ref}
      className={`group relative bg-gray-900 border border-white/5 rounded-xl p-6 
        transition-all duration-700 ease-out cursor-pointer
        hover:border-blue-500/40 hover:bg-gray-800 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/10
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div className="absolute inset-0 rounded-xl bg-blue-500/0 group-hover:bg-blue-500/5 transition-all duration-300" />

      <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-blue-300 transition-colors">
        {title}
      </h3>
      <p className="text-gray-400 text-sm mb-4 leading-relaxed">{description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-xs bg-white/5 text-gray-300 px-2 py-1 rounded-md border border-white/10"
          >
            {tag}
          </span>
        ))}
      </div>

      <span className="text-blue-400 text-sm hover:text-blue-300 font-medium transition-colors">
        View Project →
      </span>
    </a>
  );
}
// ============================================================
// GITHUB REPOS SECTION
// ============================================================
function GitHubRepos() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 👉 CHANGE "yourusername" to your actual GitHub username!
  const GITHUB_USERNAME = "dbro-10";

  useEffect(() => {
    fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=6`
    )
      .then((res) => {
        if (!res.ok) throw new Error("GitHub user not found");
        return res.json();
      })
      .then((data: Repo[]) => {
        setRepos(data.filter((r) => !r.name.includes(GITHUB_USERNAME)));
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <section id="github" className="px-6 py-24 max-w-5xl mx-auto">
      <h2 className="text-4xl font-bold mb-3 text-center">GitHub</h2>
      <p className="text-gray-400 text-center mb-12">
        Live from my GitHub — updated automatically
      </p>

      {loading && (
        <div className="flex justify-center">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <p className="text-center text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-4">
          ⚠️ Could not load repos: {error}
          <br />
          <span className="text-sm text-gray-400 mt-1 block">
            Make sure you updated GITHUB_USERNAME in the code.
          </span>
        </p>
      )}

      {!loading && !error && (
        <div className="grid md:grid-cols-2 gap-4">
          {repos.map((repo, i) => (
            <a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gray-900 border border-white/5 rounded-xl p-5
                hover:border-blue-500/40 hover:bg-gray-800 hover:-translate-y-0.5
                transition-all duration-200 flex flex-col gap-2"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                  {repo.name}
                </span>
                {repo.stargazers_count > 0 && (
                  <span className="text-xs text-yellow-400 flex items-center gap-1">
                    ★ {repo.stargazers_count}
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                {repo.description || "No description provided."}
              </p>
              {repo.language && (
                <span className="text-xs text-blue-400 mt-auto">{repo.language}</span>
              )}
            </a>
          ))}
        </div>
      )}
    </section>
  );
}

// ============================================================
// CONTACT FORM SECTION
// ============================================================
function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus("sending");

    // ✅ This simulates sending — replace with a real service later
    // (e.g. Formspree, EmailJS, or a Next.js API route)
    await new Promise((res) => setTimeout(res, 1500));
    setStatus("sent");
  };

  const inputClass =
    "w-full bg-gray-900 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500/60 transition-colors";

  return (
    <section id="contact" className="px-6 py-24 max-w-2xl mx-auto">
      <h2 className="text-4xl font-bold mb-3 text-center">Contact</h2>
      <p className="text-gray-400 text-center mb-12">
        Have a project in mind? Let's talk.
      </p>

      {status === "sent" ? (
        <div className="text-center bg-green-500/10 border border-green-500/20 rounded-xl p-10">
          <div className="text-4xl mb-3">✅</div>
          <h3 className="text-xl font-semibold text-green-400">Message sent!</h3>
          <p className="text-gray-400 mt-2 text-sm">I'll get back to you soon.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <input
            name="name"
            type="text"
            placeholder="Your name"
            value={formData.name}
            onChange={handleChange}
            className={inputClass}
          />
          <input
            name="email"
            type="email"
            placeholder="Your email"
            value={formData.email}
            onChange={handleChange}
            className={inputClass}
          />
          <textarea
            name="message"
            placeholder="Your message..."
            rows={5}
            value={formData.message}
            onChange={handleChange}
            className={inputClass + " resize-none"}
          />
          <button
            onClick={handleSubmit}
            disabled={status === "sending"}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-lg transition-colors text-sm cursor-pointer"
          >
            {status === "sending" ? "Sending..." : "Send Message →"}
          </button>
        </div>
      )}
    </section>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================
export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Feature 2: Sticky Nav */}
      <Nav />

      {/* Hero */}
      <section className="flex flex-col items-center justify-center h-screen text-center px-6">
        <div className="inline-block text-xs font-mono text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full mb-6">
          Available for work
        </div>
        <h1 className="text-6xl font-bold mb-4 tracking-tight">
          Dan's Portfolio
        </h1>
        <p className="text-xl text-gray-400 mb-10">
          Python Developer • Software Engineer
        </p>
        <div className="flex gap-4">
          <a
            href="https://github.com/dbro-10"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            GitHub
          </a>
          <button
            onClick={() =>
              document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })
            }
            className="border border-white/20 px-6 py-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            {/* Feature 3: Smooth scroll on button click */}
            View Projects
          </button>
        </div>
      </section>

      {/* About */}
      <section id="about" className="px-6 py-24 max-w-3xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">About Me</h2>
        <p className="text-gray-400 text-lg leading-relaxed">
          I'm a software developer focused on building useful tools, automation systems,
          and modern web applications. My main language is Python, and I enjoy creating
          projects that solve real problems.
        </p>

        {/* Tech stack badges */}
        <div className="flex flex-wrap justify-center gap-2 mt-10">
          {["Python", "JavaScript", "TypeScript", "Next.js", "React", "SQL", "Git"].map(
            (tech) => (
              <span
                key={tech}
                className="text-sm bg-white/5 text-gray-300 px-3 py-1.5 rounded-full border border-white/10 hover:border-blue-500/40 transition-colors"
              >
                {tech}
              </span>
            )
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="border-t border-white/5" />
      </div>

      {/* Feature 1: Animated Project Cards */}
      <section id="projects" className="px-6 py-24 max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold mb-3 text-center">Projects</h2>
        <p className="text-gray-400 text-center mb-12">A few things I've built</p>

        <div className="grid md:grid-cols-3 gap-6">
          <ProjectCard
            title="Heart Disease Predictor"
            description="A machine learning model that predicts the likelihood of heart disease based on patient data. Built with Python and scikit-learn."
            link="https://github.com/dbro-10/first_machine_learning_for_heart_disease/blob/main/final_heart_disease_model.ipynb"
            tags={["Python", "scikit-learn", "Jupyter"]}
            delay={0}
          />

          {/* Uncomment and fill in when your next project is ready */}
          {/* <ProjectCard
            title="Your Next Project"
            description="Description here."
            link="#"
            tags={["Python"]}
            delay={150}
          /> */}
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6">
        <div className="border-t border-white/5" />
      </div>

      {/* Feature 4: GitHub Repos */}
      <GitHubRepos />

      <div className="max-w-5xl mx-auto px-6">
        <div className="border-t border-white/5" />
      </div>

      {/* Feature 5: Contact Form */}
      <ContactForm />

      {/* Footer */}
      <footer className="text-center text-gray-600 text-sm py-10 border-t border-white/5">
        © {new Date().getFullYear()} Dan. Built with Next.js & Tailwind CSS.
      </footer>
    </main>
  );
}
