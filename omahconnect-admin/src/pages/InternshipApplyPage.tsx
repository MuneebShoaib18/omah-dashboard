import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { fetchPublicInternships, submitApplication, type Job } from "../services/api";

interface FormState {
  jobId: string;
  userName: string;
  userEmail: string;
  phone: string;
  education: string;
  skills: string;
  portfolioUrl: string;
  resumeUrl: string;
  coverLetter: string;
}

const initialForm: FormState = {
  jobId: "",
  userName: "",
  userEmail: "",
  phone: "",
  education: "",
  skills: "",
  portfolioUrl: "",
  resumeUrl: "",
  coverLetter: "",
};

export function InternshipApplyPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [internships, setInternships] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInternships() {
      try {
        const jobs = await fetchPublicInternships();
        setInternships(jobs);
        if (jobs.length > 0) {
          setForm((prev) => ({ ...prev, jobId: jobs[0].id }));
        }
      } catch {
        setError("Could not load internship positions. Make sure the backend server is running.");
      } finally {
        setLoadingJobs(false);
      }
    }
    loadInternships();
  }, []);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.jobId || !form.userName.trim() || !form.userEmail.trim()) {
      setError("Please fill in your name, email, and select an internship position.");
      return;
    }

    try {
      setSubmitting(true);
      await submitApplication({
        jobId: form.jobId,
        userName: form.userName.trim(),
        userEmail: form.userEmail.trim(),
        phone: form.phone.trim(),
        education: form.education.trim(),
        skills: form.skills.trim(),
        portfolioUrl: form.portfolioUrl.trim(),
        resumeUrl: form.resumeUrl.trim(),
        coverLetter: form.coverLetter.trim(),
      });
      setSubmitted(true);
      setForm(initialForm);
      if (internships.length > 0) {
        setForm((prev) => ({ ...initialForm, jobId: internships[0].id }));
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : null;
      setError(message || "Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-4">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
          <h1 className="text-2xl font-bold text-white">Application Submitted!</h1>
          <p className="text-slate-400 text-sm">
            Your internship application has been saved to our database. Our team will review it and contact you soon.
          </p>
          <button
            type="button"
            onClick={() => setSubmitted(false)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            OMAHCONNECT Careers
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Internship Application</h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Complete the form below. Your application will be stored securely and reviewed by our hiring team.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-5"
        >
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Internship Position <span className="text-red-400">*</span>
            </label>
            {loadingJobs ? (
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading positions...
              </div>
            ) : (
              <select
                value={form.jobId}
                onChange={(e) => updateField("jobId", e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              >
                {internships.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.title} — {job.companyName}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.userName}
                onChange={(e) => updateField("userName", e.target.value)}
                placeholder="Jane Doe"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={form.userEmail}
                onChange={(e) => updateField("userEmail", e.target.value)}
                placeholder="jane@email.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Education</label>
              <input
                type="text"
                value={form.education}
                onChange={(e) => updateField("education", e.target.value)}
                placeholder="University, Degree"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Skills</label>
            <input
              type="text"
              value={form.skills}
              onChange={(e) => updateField("skills", e.target.value)}
              placeholder="React, TypeScript, Node.js"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Portfolio / LinkedIn URL</label>
              <input
                type="url"
                value={form.portfolioUrl}
                onChange={(e) => updateField("portfolioUrl", e.target.value)}
                placeholder="https://linkedin.com/in/you"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-300">Resume URL</label>
              <input
                type="url"
                value={form.resumeUrl}
                onChange={(e) => updateField("resumeUrl", e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Cover Letter / Statement of Purpose</label>
            <textarea
              value={form.coverLetter}
              onChange={(e) => updateField("coverLetter", e.target.value)}
              rows={4}
              placeholder="Tell us why you're interested in this internship..."
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || loadingJobs}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Submit Application
              </>
            )}
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-600">
          © {new Date().getFullYear()} OMAHCONNECT. Applications are stored in MongoDB.
        </p>
      </div>
    </div>
  );
}
