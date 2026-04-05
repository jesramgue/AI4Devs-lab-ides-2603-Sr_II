import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { Server } from 'http';
import uploadRoutes from './routes/uploadRoutes';
import { createCandidateRoutes } from './routes/candidateRoutes';
import { corsMiddleware } from './middleware/cors';
import { securityHeaders } from './middleware/securityHeaders';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();
const prisma = new PrismaClient();

export const app = express();
export default prisma;

const port = 3010;

// Security headers — must be first
app.use(securityHeaders);

// Allow the frontend dev servers to call the API.
app.use(corsMiddleware);

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

let server: Server | undefined;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
  });
}

export { server };
