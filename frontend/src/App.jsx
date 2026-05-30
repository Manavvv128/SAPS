import React, { useMemo, useState } from "react";
import { defaultStudentEmail, studentsByEmail } from "./data/students.js";

const teacherProfile = {
  name: "Prof. R. Sharma",
  initials: "RS",
  department: "CS Department",
  semester: "Semester 4"
};

const initialTeacherStudents = [
  {
    user_id: "CS2024-047",
    name: "Arjun Mehta",
    marks: 74.2,
    attendance: 88,
    latest_prediction: "Good"
  },
  {
    user_id: "CS2024-012",
    name: "Priya Singh",
    marks: 88.5,
    attendance: 95,
    latest_prediction: "Excellent"
  },
  {
    user_id: "CS2024-031",
    name: "Rohan Das",
    marks: 51,
    attendance: 62,
    latest_prediction: "At Risk"
  },
  {
    user_id: "CS2024-058",
    name: "Neha Kapoor",
    marks: 66.7,
    attendance: 74,
    latest_prediction: "Average"
  },
  {
    user_id: "CS2024-003",
    name: "Karan Iyer",
    marks: 91.2,
    attendance: 97,
    latest_prediction: "Excellent"
  }
];

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

  function handleTeacherLogin() {
    localStorage.setItem("saps-page", "teacher");
    setPage("teacher");
  }

  function handleLogout() {
    localStorage.removeItem("saps-page");
    setPage("login");
  }

  if (page === "student") {
    return <StudentDashboard student={student} onLogout={handleLogout} />;
  }

  if (page === "teacher") {
    return <TeacherDashboard teacher={teacherProfile} onLogout={handleLogout} />;
  }

  return <LoginPage onStudentLogin={handleStudentLogin} onTeacherLogin={handleTeacherLogin} />;
}

function LoginPage({ onStudentLogin, onTeacherLogin }) {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState(defaultStudentEmail);

  function handleSubmit(event) {
    event.preventDefault();

    if (role === "student") {
      onStudentLogin(email);
      return;
    }

    onTeacherLogin();
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

function TeacherDashboard({ teacher, onLogout }) {
  const [students, setStudents] = useState(initialTeacherStudents);
  const [query, setQuery] = useState("");
  const [uploadName, setUploadName] = useState("");

  const distribution = useMemo(
    () =>
      students.reduce(
        (acc, student) => {
          acc[student.latest_prediction] = (acc[student.latest_prediction] || 0) + 1;
          return acc;
        },
        { Excellent: 0, Good: 0, Average: 0, "At Risk": 0 }
      ),
    [students]
  );

  const stats = useMemo(() => {
    const total = Math.max(students.length, 60);
    const marksTotal = students.reduce((sum, student) => sum + student.marks, 0);
    const atRisk = students.filter((student) => student.latest_prediction === "At Risk").length;

    return {
      total,
      predictionsRun: students.length,
      pending: Math.max(total - students.length, 0),
      average: marksTotal / students.length,
      atRisk
    };
  }, [students]);

  const filteredStudents = students.filter((student) => {
    const needle = query.trim().toLowerCase();
    return (
      student.name.toLowerCase().includes(needle) ||
      student.user_id.toLowerCase().includes(needle)
    );
  });

  function handlePredict(studentId) {
    setStudents((current) =>
      current.map((student) =>
        student.user_id === studentId
          ? { ...student, latest_prediction: getPredictionFromScores(student.marks, student.attendance) }
          : student
      )
    );
  }

  function handleExport() {
    const csvRows = [
      ["Student", "Roll Number", "Marks %", "Attendance %", "Prediction"],
      ...students.map((student) => [
        student.name,
        student.user_id,
        student.marks,
        student.attendance,
        student.latest_prediction
      ])
    ];
    const csv = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "saps-teacher-records.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  function handleUpload(event) {
    const file = event.target.files?.[0];
    if (file) {
      setUploadName(file.name);
    }
  }

  return (
    <main className="dashboard-shell teacher-shell">
      <header className="dashboard-topbar teacher-topbar">
        <div className="topbar-brand">
          <a href="/" onClick={onLogout}>
            SAPS
          </a>
          <span>Teacher View</span>
        </div>
        <div className="topbar-user">
          <span>{teacher.name}</span>
          <button type="button" onClick={onLogout} aria-label="Sign out">
            {teacher.initials}
          </button>
        </div>
      </header>

      <section className="dashboard-content teacher-content">
        <div className="teacher-heading">
          <div>
            <h1>Class Overview</h1>
            <p>
              {teacher.department} <span>/</span> {teacher.semester} <span>/</span>{" "}
              {stats.total} students enrolled
            </p>
          </div>
          <div className="teacher-actions">
            <button type="button" onClick={handleExport}>
              Export CSV
            </button>
            <label>
              <input type="file" accept=".csv,.xlsx" onChange={handleUpload} />
              <span aria-hidden="true">+</span> Upload Data
            </label>
          </div>
        </div>

        <section className="stats-grid teacher-stats" aria-label="Teacher class summary">
          <StatCard title="Total Students" value={stats.total} note="Enrolled this semester" />
          <StatCard
            title="Predictions Run"
            value={stats.predictionsRun}
            note={`${stats.pending} pending upload`}
          />
          <StatCard
            title="Class Average"
            value={`${stats.average.toFixed(1)}%`}
            note="Across all subjects"
          />
          <StatCard title="At Risk" value={stats.atRisk} note="Below threshold" tone="danger" />
        </section>

        <section className="teacher-workspace">
          <aside className="upload-panel" aria-label="Upload and prediction distribution">
            <h2>Upload Student Data</h2>
            <label className="drop-zone">
              <input type="file" accept=".csv,.xlsx" onChange={handleUpload} />
              <span aria-hidden="true">⇧</span>
              <strong>Drop marks or attendance file</strong>
              <small>{uploadName || "Accepts .xlsx · .csv · Max 5 MB"}</small>
              <em>Browse files</em>
            </label>

            <h2>Prediction Distribution</h2>
            <div className="distribution-list">
              {Object.entries(distribution).map(([label, count]) => (
                <DistributionRow key={label} label={label} count={count} />
              ))}
            </div>
          </aside>

          <section className="records-panel" aria-label="Student records">
            <h2>Student Records</h2>
            <div className="records-table">
              <div className="search-row">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by name or roll number..."
                />
              </div>

              <div className="table-head">
                <span>Student</span>
                <span>Marks %</span>
                <span>Attendance</span>
                <span>Prediction</span>
                <span className="sr-only">Action</span>
              </div>

              {filteredStudents.map((student) => (
                <article className="student-record" key={student.user_id}>
                  <div>
                    <strong>{student.name}</strong>
                    <small>{student.user_id}</small>
                  </div>
                  <span>{student.marks.toFixed(1)}%</span>
                  <span>{student.attendance}%</span>
                  <PredictionBadge label={student.latest_prediction} />
                  <button type="button" onClick={() => handlePredict(student.user_id)}>
                    Predict
                  </button>
                </article>
              ))}
            </div>
          </section>
        </section>
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
      <strong
        className={`${tone === "success" ? "success-text" : ""} ${
          tone === "danger" ? "danger-text" : ""
        }`}
      >
        {value}
      </strong>
      <span>{note}</span>
    </article>
  );
}

function PredictionBadge({ label }) {
  return <span className={`prediction-badge ${label.toLowerCase().replace(" ", "-")}`}>{label}</span>;
}

function DistributionRow({ label, count }) {
  return (
    <div className={`distribution-row ${label.toLowerCase().replace(" ", "-")}`}>
      <span>{label}</span>
      <div aria-hidden="true">
        <span style={{ width: `${Math.max(count * 18, count ? 12 : 0)}%` }} />
      </div>
      <strong>{count}</strong>
    </div>
  );
}

function getPredictionFromScores(marks, attendance) {
  const score = marks * 0.75 + attendance * 0.25;

  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 60) return "Average";
  return "At Risk";
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
