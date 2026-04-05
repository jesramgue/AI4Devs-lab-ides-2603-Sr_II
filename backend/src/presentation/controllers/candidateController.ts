import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { CandidateService } from '../../application/services/candidateService';
import { CreateCandidatePayload } from '../../application/dto/candidate.dto';

export class CandidateController {
  private candidateService: CandidateService;

  constructor(prisma: PrismaClient) {
    this.candidateService = new CandidateService(prisma);
  }

  /**
   * Create a new candidate
   * POST /candidates
   * Domain / validation errors are forwarded to the centralized error handler via next().
   */
  createCandidate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const payload: CreateCandidatePayload = req.body;
      const data = await this.candidateService.createCandidate(payload);
      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };
}
