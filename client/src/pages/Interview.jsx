import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { generateReport } from '../api/interview';

export default function Interview() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [selfDescription, setSelfDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const fileInputRef = useRef(null);

  if (authLoading) {
    return (
      <div className="page-wrapper">
        <div className="page-loader">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-wrapper">
        <div className="auth-card" style={{ maxWidth: '440px', textAlign: 'center' }}>
          <div className="auth-logo-wrap" style={{ margin: '0 auto 1.25rem' }}>
            <span style={{ fontSize: '1.6rem' }}>🔒</span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Authentication Required
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Please sign in to generate personalized AI interview prep reports.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/login" className="btn btn-primary">Sign In</Link>
            <Link to="/register" className="btn btn-secondary">Create Account</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
        setError('Please upload a PDF or TXT file.');
        return;
      }
      setError('');
      setResumeFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.endsWith('.pdf') && !file.name.endsWith('.txt')) {
        setError('Please upload a PDF or TXT resume file.');
        return;
      }
      setError('');
      setResumeFile(file);
    }
  };

  const toggleQuestion = (index) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!resumeFile) {
      setError('Please upload your resume (PDF or TXT).');
      return;
    }
    if (!jobDescription.trim()) {
      setError('Please provide the target job description.');
      return;
    }

    setLoading(true);
    setLoadingStep(1);

    const stepTimer1 = setTimeout(() => setLoadingStep(2), 2200);
    const stepTimer2 = setTimeout(() => setLoadingStep(3), 5000);

    try {
      const formData = new FormData();
      formData.append('resume', resumeFile);
      formData.append('jobDescription', jobDescription);
      if (selfDescription.trim()) {
        formData.append('selfDescription', selfDescription);
      }

      const res = await generateReport(formData);
      const report = res.data || res;
      setReportData(report);
      // Auto expand the first 2 questions
      setExpandedQuestions({ 'tech-0': true, 'tech-1': true, 'beh-0': true });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'Failed to generate report. Please try again.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setLoading(false);
      setLoadingStep(0);
    }
  };

  const handleReset = () => {
    setReportData(null);
    setResumeFile(null);
    setJobDescription('');
    setSelfDescription('');
    setError('');
    setExpandedQuestions({});
  };

  const score = reportData ? (reportData.matchScore ?? 75) : 0;
  const scorePercent = Math.min(100, Math.max(0, score));

  return (
    <div className="page-wrapper">
      <div className="interview-wrapper">
        {!reportData ? (
          <>
            <div className="interview-header text-center" style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div className="badge badge-purple" style={{ marginBottom: '0.75rem' }}>
                ✦ Powered by Gemini AI
              </div>
              <h1>Generate Interview Intelligence</h1>
              <p>
                Upload your resume and the target role description to receive comprehensive interview questions,
                tailored model answers, skill gap analysis, and a structured prep roadmap.
              </p>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                <span className="alert-icon">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="interview-form-card">
              <form onSubmit={handleSubmit}>
                {/* Resume Upload Section */}
                <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Candidate Resume <span style={{ color: 'var(--purple-light)' }}>*</span></span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PDF or TXT up to 10MB</span>
                  </label>

                  <div
                    className={`file-drop-zone ${isDragging ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.txt,application/pdf,text/plain"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                      id="resume-file-input"
                    />

                    <div className="file-drop-icon">📄</div>
                    <div className="file-drop-title">
                      {resumeFile ? resumeFile.name : 'Drop your resume here, or browse files'}
                    </div>
                    <div className="file-drop-sub">
                      {resumeFile
                        ? `${(resumeFile.size / 1024).toFixed(1)} KB — Click to change file`
                        : 'Supports PDF documents and plain text'}
                    </div>
                  </div>

                  {resumeFile && (
                    <div className="file-selected" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span className="file-selected-icon">✓</span>
                        <span>{resumeFile.name} ({(resumeFile.size / 1024).toFixed(1)} KB) ready</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setResumeFile(null);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--red-light)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Job Description */}
                <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                  <label className="form-label">
                    Target Job Description <span style={{ color: 'var(--purple-light)' }}>*</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={6}
                    placeholder="Paste the target job description, responsibilities, and qualifications here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    required
                    id="job-description-input"
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.35rem' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      {jobDescription.length} characters
                    </span>
                  </div>
                </div>

                {/* Self Description (Optional) */}
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Candidate Context / Strengths</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Optional</span>
                  </label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="E.g., 3 years of React/Node.js experience, leading microservices migration, aiming for Senior Full Stack Engineer role..."
                    value={selfDescription}
                    onChange={(e) => setSelfDescription(e.target.value)}
                    id="self-description-input"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.95rem', fontSize: '1rem' }}
                  disabled={loading}
                  id="generate-report-btn"
                >
                  {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div className="spinner" style={{ width: '18px', height: '18px' }} />
                      <span>
                        {loadingStep === 1 && 'Extracting resume & requirements...'}
                        {loadingStep === 2 && 'Evaluating match score & skill gaps...'}
                        {loadingStep === 3 && 'Formulating technical & behavioral questions...'}
                        {loadingStep === 0 && 'Generating report...'}
                      </span>
                    </div>
                  ) : (
                    '✦ Generate Comprehensive Report'
                  )}
                </button>
              </form>
            </div>

            {loading && (
              <div
                className="report-section"
                style={{
                  textAlign: 'center',
                  padding: '2.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem',
                  animation: 'fadeIn 0.3s ease',
                }}
              >
                <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>AI Analysis in Progress</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '420px' }}>
                  Our AI models are cross-analyzing your experience against the target role requirements. This typically takes 5–15 seconds.
                </p>
              </div>
            )}
          </>
        ) : (
          /* Report View */
          <div className="report-wrapper">
            <div className="report-header">
              <div>
                <div className="badge badge-purple" style={{ marginBottom: '0.5rem' }}>
                  ✦ Report Generated
                </div>
                <h2>Interview Readiness Assessment</h2>
                <p>
                  Comprehensive match insights, tailored questions, identified gaps, and day-by-day roadmap.
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div className="score-ring">
                  <div
                    className="score-circle"
                    style={{ '--pct': scorePercent }}
                  >
                    <span className="score-number">{score}%</span>
                  </div>
                  <span className="score-label">Role Match</span>
                </div>

                <button
                  onClick={handleReset}
                  className="btn btn-secondary"
                  id="new-report-btn"
                >
                  + New Analysis
                </button>
              </div>
            </div>

            <div className="report-grid">
              {/* Technical Questions */}
              <div className="report-section full">
                <div className="section-title">
                  <div className="section-icon purple">💻</div>
                  <span>Technical Questions & Ideal Responses ({reportData.technicalQuestions?.length || 0})</span>
                </div>

                <div className="question-list">
                  {reportData.technicalQuestions && reportData.technicalQuestions.length > 0 ? (
                    reportData.technicalQuestions.map((q, idx) => {
                      const key = `tech-${idx}`;
                      const isExpanded = !!expandedQuestions[key];
                      return (
                        <div key={key} className="question-card">
                          <button
                            type="button"
                            className="question-trigger"
                            onClick={() => toggleQuestion(key)}
                          >
                            <span className="q-num">{idx + 1}</span>
                            <span style={{ flex: 1 }}>{q.question}</span>
                            <span className={`q-chevron ${isExpanded ? 'open' : ''}`}>▼</span>
                          </button>

                          {isExpanded && (
                            <div className="question-body">
                              {q.intention && (
                                <div className="q-intention">
                                  <div className="q-intention-label">🎯 What the interviewer is evaluating</div>
                                  <div>{q.intention}</div>
                                </div>
                              )}
                              {q.answer && (
                                <div className="q-answer">
                                  <div className="q-answer-label">💡 Recommended High-Impact Answer</div>
                                  <div>{q.answer}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No technical questions returned.</p>
                  )}
                </div>
              </div>

              {/* Behavioral Questions */}
              <div className="report-section full">
                <div className="section-title">
                  <div className="section-icon blue">🤝</div>
                  <span>Behavioral & Situational Questions ({reportData.behaviouralQuestions?.length || 0})</span>
                </div>

                <div className="question-list">
                  {reportData.behaviouralQuestions && reportData.behaviouralQuestions.length > 0 ? (
                    reportData.behaviouralQuestions.map((q, idx) => {
                      const key = `beh-${idx}`;
                      const isExpanded = !!expandedQuestions[key];
                      return (
                        <div key={key} className="question-card">
                          <button
                            type="button"
                            className="question-trigger"
                            onClick={() => toggleQuestion(key)}
                          >
                            <span className="q-num">{idx + 1}</span>
                            <span style={{ flex: 1 }}>{q.question}</span>
                            <span className={`q-chevron ${isExpanded ? 'open' : ''}`}>▼</span>
                          </button>

                          {isExpanded && (
                            <div className="question-body">
                              {q.intention && (
                                <div className="q-intention">
                                  <div className="q-intention-label">🎯 Cultural & Leadership Intention</div>
                                  <div>{q.intention}</div>
                                </div>
                              )}
                              {q.answer && (
                                <div className="q-answer">
                                  <div className="q-answer-label">💡 Suggested STAR Method Response</div>
                                  <div>{q.answer}</div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No behavioral questions returned.</p>
                  )}
                </div>
              </div>

              {/* Skill Gap Analysis */}
              <div className="report-section">
                <div className="section-title">
                  <div className="section-icon amber">⚡</div>
                  <span>Skill Gap Analysis</span>
                </div>

                <div className="skill-list">
                  {reportData.skillGap && reportData.skillGap.length > 0 ? (
                    reportData.skillGap.map((item, idx) => {
                      const sev = (item.severity || 'medium').toLowerCase();
                      const sevClass =
                        sev === 'high'
                          ? 'severity-high'
                          : sev === 'low'
                          ? 'severity-low'
                          : 'severity-medium';
                      return (
                        <div key={idx} className="skill-item">
                          <span className="skill-name">{item.skill}</span>
                          <span className={`severity-badge ${sevClass}`}>
                            {item.severity || 'Medium'} Gap
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No significant skill gaps identified.</p>
                  )}
                </div>
              </div>

              {/* Preparation Plan */}
              <div className="report-section">
                <div className="section-title">
                  <div className="section-icon green">📅</div>
                  <span>Strategic Preparation Plan</span>
                </div>

                <div className="plan-list">
                  {reportData.preparationPlan && reportData.preparationPlan.length > 0 ? (
                    reportData.preparationPlan.map((plan, idx) => (
                      <div key={idx} className="plan-item">
                        <div className="plan-day">
                          <span className="plan-day-label">Day</span>
                          <span>{plan.day || idx + 1}</span>
                        </div>
                        <div className="plan-content">
                          <div className="plan-focus">{plan.focus}</div>
                          <div className="plan-task">{plan.task}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No preparation plan provided.</p>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => window.print()}
              >
                🖨️ Print / Save as PDF
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleReset}
              >
                Start New Evaluation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
