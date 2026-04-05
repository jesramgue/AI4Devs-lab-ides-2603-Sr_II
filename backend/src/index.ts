import { Request, Response, NextFunction } from 'express';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import uploadRoutes from './routes/uploadRoutes';
import { createCandidateRoutes } from './routes/candidateRoutes';

dotenv.config();
const prisma = new PrismaClient();

export const app = express();
export default prisma;

const port = 3010;

// Middleware
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hola LTI!');
});

// Register upload routes
app.use(uploadRoutes);

// Register candidate routes
app.use(createCandidateRoutes(prisma));

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.type('text/plain'); 
  res.status(500).send('Something broke!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
