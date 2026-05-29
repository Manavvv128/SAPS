export const studentsByEmail = {
  "you@institution.edu": {
    name: "Arjun Mehta",
    firstName: "Arjun",
    initials: "AM",
    program: "Computer Science",
    year: "Year 2",
    rollNo: "CS2024-047",
    currentTerm: "Semester 4",
    academicYear: "2025-26",
    overallMarks: 74.2,
    attendance: 88,
    classRank: 12,
    totalStudents: 60,
    updatedAgo: "3 days ago",
    updatedBy: "Prof. Sharma",
    prediction: {
      label: "Good Performance",
      confidence: 81,
      generatedAgo: "3 days ago",
      modelVersion: "ML Model v2.1"
    },
    subjects: [
      { name: "Data Structures", marks: 82 },
      { name: "Operating Systems", marks: 70 },
      { name: "DBMS", marks: 76 },
      { name: "Computer Networks", marks: 63, status: "warning" },
      { name: "Software Engg.", marks: 79 }
    ],
    history: [
      { term: "Semester 4", date: "May 2, 2026", label: "Good" },
      { term: "Semester 3", date: "Dec 12, 2025", label: "Average" },
      { term: "Semester 2", date: "May 8, 2025", label: "Excellent" },
      { term: "Semester 1", date: "Nov 20, 2024", label: "Average" }
    ]
  },
  "riya@institution.edu": {
    name: "Riya Kapoor",
    firstName: "Riya",
    initials: "RK",
    program: "Computer Science",
    year: "Year 2",
    rollNo: "CS2024-052",
    currentTerm: "Semester 4",
    academicYear: "2025-26",
    overallMarks: 86.4,
    attendance: 94,
    classRank: 4,
    totalStudents: 60,
    updatedAgo: "1 day ago",
    updatedBy: "Prof. Sharma",
    prediction: {
      label: "Excellent Performance",
      confidence: 92,
      generatedAgo: "1 day ago",
      modelVersion: "ML Model v2.1"
    },
    subjects: [
      { name: "Data Structures", marks: 91 },
      { name: "Operating Systems", marks: 84 },
      { name: "DBMS", marks: 88 },
      { name: "Computer Networks", marks: 79 },
      { name: "Software Engg.", marks: 90 }
    ],
    history: [
      { term: "Semester 4", date: "May 2, 2026", label: "Excellent" },
      { term: "Semester 3", date: "Dec 12, 2025", label: "Good" },
      { term: "Semester 2", date: "May 8, 2025", label: "Good" },
      { term: "Semester 1", date: "Nov 20, 2024", label: "Average" }
    ]
  }
};

export const defaultStudentEmail = "you@institution.edu";
