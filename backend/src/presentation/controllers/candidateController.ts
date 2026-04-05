import { Request, Response } from 'express';
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
   */
  createCandidate = async (req: Request, res: Response): Promise<void> => {
    try {
      const payload: CreateCandidatePayload = req.body;

      // Delegate to service
      const result = await this.candidateService.createCandidate(payload);

      if (result.success && result.data) {
        res.status(201).json({
          success: true,
          data: result.data,
        });
      } else if (result.errors) {
        // Validation errors
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          errors: result.errors,
        });
      } else {
        // Business logic error (e.g., duplicate email)
        res.status(409).json({
          success: false,
          error: result.error || 'Failed to create candidate',
        });
      }
    } catch (error) {
      console.error('Create candidate error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message:
          error instanceof Error ? error.message : 'An error occurred',
      });
    }
  };
}
