import React, { useEffect, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';

import { CandidateFormData } from '../../types/candidate.types';

const AddCandidate: React.FC = () => {
  const [formData, setFormData] = useState<CandidateFormData | null>(null);

  useEffect(() => {
    setFormData(null);
  }, []);

  return (
    <Container className="py-4">
      <h1>Add Candidate</h1>
      <Form>
        <p>This is the initial Add Candidate scaffold component.</p>
        <Button type="button" variant="primary" disabled={!formData}>
          Continue
        </Button>
      </Form>
    </Container>
  );
};

export default AddCandidate;
