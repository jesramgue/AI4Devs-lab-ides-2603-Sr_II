import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { CandidateController } from '../presentation/controllers/candidateController';

export function createCandidateRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const candidateController = new CandidateController(prisma);

  /**
   * POST /candidates
   * Create a new candidate with education, work experience, and resume
   */
  router.post('/candidates', candidateController.createCandidate);

  return router;
}
