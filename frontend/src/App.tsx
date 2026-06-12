import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

type ApplicationStatus = 'applied' | 'interview' | 'offer' | 'rejected';

type JobApplication = {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  createdAt: string;
};

const storageKey = 'job-tracker-applications';

const statusLabels: Record<ApplicationStatus, string> = {
  applied: 'Ansökt',
  interview: 'Intervju',
  offer: 'Erbjudande',
  rejected: 'Avslag',
};

const statusOptions = Object.entries(statusLabels) as [
  ApplicationStatus,
  string,
][];

function loadApplications() {
  const savedApplications = localStorage.getItem(storageKey);

  if (!savedApplications) {
    return [];
  }

  try {
    const parsedApplications = JSON.parse(savedApplications);

    return Array.isArray(parsedApplications)
      ? (parsedApplications as JobApplication[])
      : [];
  } catch {
    return [];
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('sv-SE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

function App() {
  const [applications, setApplications] =
    useState<JobApplication[]>(loadApplications);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');

  const activeApplications = applications.filter(
    (application) => application.status !== 'rejected',
  ).length;
  const interviewApplications = applications.filter(
    (application) => application.status === 'interview',
  ).length;

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(applications));
  }, [applications]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedCompany = company.trim();
    const trimmedRole = role.trim();

    if (!trimmedCompany || !trimmedRole) {
      return;
    }

    const newApplication: JobApplication = {
      id: crypto.randomUUID(),
      company: trimmedCompany,
      role: trimmedRole,
      status: 'applied',
      createdAt: new Date().toISOString(),
    };

    setApplications((currentApplications) => [
      newApplication,
      ...currentApplications,
    ]);
    setCompany('');
    setRole('');
  }

  function updateStatus(id: string, status: ApplicationStatus) {
    setApplications((currentApplications) =>
      currentApplications.map((application) =>
        application.id === id ? { ...application, status } : application,
      ),
    );
  }

  function deleteApplication(id: string) {
    setApplications((currentApplications) =>
      currentApplications.filter((application) => application.id !== id),
    );
  }

  return (
    <main className="app">
      <section className="page-header">
        <p className="eyebrow">Job Tracker</p>
        <div className="header-content">
          <div>
            <h1>Håll koll på dina jobbansökningar.</h1>
            <p>
              Lägg till jobb, uppdatera status och ta bort ansökningar som inte
              längre är aktuella.
            </p>
          </div>

          <dl className="summary">
            <div>
              <dt>Totalt</dt>
              <dd>{applications.length}</dd>
            </div>
            <div>
              <dt>Aktiva</dt>
              <dd>{activeApplications}</dd>
            </div>
            <div>
              <dt>Intervjuer</dt>
              <dd>{interviewApplications}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="workspace" aria-label="Jobbansökningar">
        <form className="application-form" onSubmit={handleSubmit}>
          <div>
            <h2>Lägg till ansökan</h2>
            <p>Fyll i företaget och rollen du har sökt.</p>
          </div>

          <label>
            Företag
            <input
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Exempel: Spotify"
            />
          </label>

          <label>
            Roll
            <input
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="Exempel: Frontend Developer"
            />
          </label>

          <button type="submit">Lägg till</button>
        </form>

        <section className="application-list" aria-live="polite">
          <div className="list-header">
            <div>
              <h2>Ansökningar</h2>
              <p>Uppdatera status när processen går vidare.</p>
            </div>
            <span>{applications.length} st</span>
          </div>

          {applications.length === 0 ? (
            <p className="empty-state">
              Inga ansökningar ännu. Lägg till din första ansökan i formuläret.
            </p>
          ) : (
            <ul>
              {applications.map((application) => (
                <li key={application.id} className="application-item">
                  <div className="application-main">
                    <span
                      className={`status-badge status-badge--${application.status}`}
                    >
                      {statusLabels[application.status]}
                    </span>
                    <h3>{application.role}</h3>
                    <p>{application.company}</p>
                    <span className="date">
                      Tillagd {formatDate(application.createdAt)}
                    </span>
                  </div>

                  <label className="status-field">
                    Status
                    <select
                      value={application.status}
                      onChange={(event) =>
                        updateStatus(
                          application.id,
                          event.target.value as ApplicationStatus,
                        )
                      }
                    >
                      {statusOptions.map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button
                    className="delete-button"
                    type="button"
                    onClick={() => deleteApplication(application.id)}
                  >
                    Ta bort
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}

export default App;
