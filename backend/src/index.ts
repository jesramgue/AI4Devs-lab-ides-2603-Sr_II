import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import uploadRoutes from './routes/uploadRoutes';
import { createCandidateRoutes } from './routes/candidateRoutes';
import { securityHeaders } from './middleware/securityHeaders';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();
const prisma = new PrismaClient();

export const app = express();
export default prisma;

const port = 3010;

// Security headers — must be first
app.use(securityHeaders);

// Body parsing
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hola LTI!');
});

// Routes
app.use(uploadRoutes);
app.use(createCandidateRoutes(prisma));

// Centralized error handler — must be last
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
