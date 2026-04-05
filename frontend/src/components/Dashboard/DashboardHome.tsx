import React from 'react';
import { Alert, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

interface DashboardLocationState {
  successMessage?: string;
}

const DashboardHome: React.FC = () => {
  const location = useLocation();
  const locationState = location.state as DashboardLocationState | null;

  return (
    <Container className="app-shell py-5">
      <header className="dashboard-hero">
        <p className="dashboard-eyebrow">Candidate Management</p>
        <h1>Candidate Dashboard</h1>
        <p className="dashboard-description">
          Start a new candidate intake flow and manage submissions from one place.
        </p>
      </header>

      {locationState?.successMessage ? (
        <Alert variant="success" role="alert" className="dashboard-alert mt-4">
          {locationState.successMessage}
        </Alert>
      ) : null}

      <section className="dashboard-card mt-4" aria-labelledby="dashboard-actions-heading">
        <h2 id="dashboard-actions-heading">Quick Actions</h2>
        <p>Use the primary action below to open the Add Candidate form.</p>
        <Link
          className="app-link-button"
          to="/candidates/new"
          aria-label="Add a new candidate"
        >
          + Add Candidate
        </Link>
      </section>
    </Container>
  );
};

export default DashboardHome;
