import React, { useMemo, useState } from "react";
import { defaultStudentEmail, studentsByEmail } from "./data/students.js";

function App() {
  const [page, setPage] = useState(() => localStorage.getItem("saps-page") || "login");
  const [studentEmail, setStudentEmail] = useState(
    () => localStorage.getItem("saps-student-email") || defaultStudentEmail
  );

  const student = useMemo(
    () => studentsByEmail[studentEmail] || studentsByEmail[defaultStudentEmail],
    [studentEmail]
  );

  function handleStudentLogin(email) {
    const normalizedEmail = email.trim().toLowerCase();
    const nextEmail = studentsByEmail[normalizedEmail] ? normalizedEmail : defaultStudentEmail;
    localStorage.setItem("saps-page", "student");
    localStorage.setItem("saps-student-email", nextEmail);
    setStudentEmail(nextEmail);
    setPage("student");
  }

  function handleLogout() {
    localStorage.removeItem("saps-page");
    setPage("login");
  }

  if (page === "student") {
    return <StudentDashboard student={student} onLogout={handleLogout} />;
  }

  return <LoginPage onStudentLogin={handleStudentLogin} />;
}

function LoginPage({ onStudentLogin }) {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState(defaultStudentEmail);

  function handleSubmit(event) {
    event.preventDefault();

    if (role === "student") {
      onStudentLogin(email);
      return;
    }

    alert("Teacher dashboard will be added next.");
  }

  return (
    <main className="auth-page">
      <section className="brand-panel" aria-label="SAPS introduction">
        <div className="brand-inner">
          <a className="brand-mark" href="/" aria-label="SAPS home">
            <span className="logo" aria-hidden="true">
              <span />
              <span />
            </span>
            <span>SAPS</span>
          </a>

          <div className="brand-copy">
            <h1>Know where you stand. Before results day.</h1>
            <p>
              Your marks and attendance, turned into a clear picture of where you're headed so you
              can act early.
            </p>
          </div>

          <div className="benefit-grid" aria-label="SAPS benefits">
            <Benefit title="Early" text="Spot students who need help" />
            <Benefit title="Clear" text="See your progress at a glance" />
            <Benefit title="Fair" text="Predictions based on your data only" />
            <Benefit title="Private" text="Only you and your teacher can see" />
          </div>
        </div>
      </section>

      <section className="form-panel" aria-label="Sign in form">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="form-heading">
            <h2>Welcome back</h2>
            <p>Sign in to your account to continue</p>
          </div>

          <fieldset className="role-select" aria-label="Choose account type">
            <legend className="sr-only">Choose account type</legend>
            <RoleOption
              active={role === "student"}
              icon="student"
              title="Student"
              text="View progress & predictions"
              onClick={() => setRole("student")}
            />
            <RoleOption
              active={role === "teacher"}
              icon="teacher"
              title="Teacher"
              text="Manage data & predictions"
              onClick={() => setRole("teacher")}
            />
          </fieldset>

          <div className="field">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              defaultValue="password"
              autoComplete="current-password"
            />
          </div>

          <button className="sign-in-button" type="submit">
            Sign in
          </button>

          <p className="register-line">
            Don't have an account? <a href="/">Register here</a>
          </p>
        </form>
      </section>
    </main>
  );
}

function StudentDashboard({ student, onLogout }) {
  return (
    <main className="dashboard-shell">
      <header className="dashboard-topbar">
        <div className="topbar-brand">
          <a href="/" onClick={onLogout}>SAPS</a>
          <span>Student View</span>
        </div>
        <div className="topbar-user">
          <span>{student.name}</span>
          <button type="button" onClick={onLogout} aria-label="Sign out">
            {student.initials}
          </button>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="student-hero">
          <div>
            <h1>Good morning, {student.firstName}</h1>
            <p>
              {student.program} <span>/</span> {student.year} <span>/</span> Roll No. {student.rollNo}
            </p>
          </div>
          <span className="term-pill">
            {student.currentTerm} <span>/</span> {student.academicYear}
          </span>
        </div>

        <section className="stats-grid" aria-label="Student academic summary">
          <StatCard title="Overall Marks" value={`${student.overallMarks}%`} note={`Across ${student.subjects.length} subjects`} />
          <StatCard title="Attendance" value={`${student.attendance}%`} note="Above minimum" tone="success" />
          <StatCard title="Class Rank" value={student.classRank} note={`Out of ${student.totalStudents} students`} />
          <StatCard title="Last Updated" value={student.updatedAgo} note={`By ${student.updatedBy}`} />
        </section>

        <section className="prediction-card" aria-label="Latest prediction">
          <div className="prediction-icon" aria-hidden="true">
            <span />
          </div>
          <div>
            <p>Latest Prediction</p>
            <h2>{student.prediction.label}</h2>
            <span>
              Confidence: {student.prediction.confidence}% <strong>Generated {student.prediction.generatedAgo}</strong>
            </span>
          </div>
          <span className="model-pill">{student.prediction.modelVersion}</span>
        </section>

        <section className="dashboard-columns">
          <div>
            <h2 className="section-title">Subject-wise Marks</h2>
            <div className="marks-list">
              {student.subjects.map((subject) => (
                <SubjectMark key={subject.name} subject={subject} />
              ))}
            </div>
          </div>

          <div>
            <h2 className="section-title">Prediction History</h2>
            <div className="history-list">
              {student.history.map((item) => (
                <HistoryItem key={`${item.term}-${item.date}`} item={item} />
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}

function Benefit({ title, text }) {
  return (
    <article>
      <h2>{title}</h2>
      <p>{text}</p>
    </article>
  );
}

function RoleOption({ active, icon, title, text, onClick }) {
  return (
    <label className={`role-option ${active ? "selected" : ""}`}>
      <input type="radio" name="role" checked={active} onChange={onClick} />
      <span className={`role-icon ${icon}-icon`} aria-hidden="true">
        {icon === "teacher" ? <span /> : null}
      </span>
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
    </label>
  );
}

function StatCard({ title, value, note, tone }) {
  return (
    <article className="stat-card">
      <p>{title}</p>
      <strong className={tone === "success" ? "success-text" : ""}>{value}</strong>
      <span>{note}</span>
    </article>
  );
}

function SubjectMark({ subject }) {
  return (
    <div className="subject-row">
      <span>{subject.name}</span>
      <div className="track" aria-hidden="true">
        <span className={subject.status === "warning" ? "warning-bar" : ""} style={{ width: `${subject.marks}%` }} />
      </div>
      <strong className={subject.status === "warning" ? "warning-text" : ""}>{subject.marks}</strong>
    </div>
  );
}

function HistoryItem({ item }) {
  return (
    <article className="history-item">
      <div>
        <h3>{item.term}</h3>
        <p>{item.date}</p>
      </div>
      <span className={`history-badge ${item.label.toLowerCase()}`}>{item.label}</span>
    </article>
  );
}

export default App;
