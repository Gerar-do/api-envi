// app.ts
import express, { Application } from 'express';
import cors from 'cors';
import { config } from './infrastructure/config/config';
import { connectDB } from './infrastructure/config/MongoDB';
import { initDB as initializePostgresDatabase } from './infrastructure/config/PostgresDB';
import setupPublicationRoutes from './infrastructure/adapters/routes/PublicationRoutes';
import commentRoutes from './infrastructure/adapters/routes/CommentRoutes';

const app: Application = express();

// Middleware
app.use(cors());
app.use(express.json());

// Configure routes
app.use('/', setupPublicationRoutes());
app.use('/comments', commentRoutes);

// Connect to databases and start the server
Promise.all([connectDB(), initializePostgresDatabase()])
  .then(() => {
    app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });
  })
  .catch(error => {
    console.error('Error starting server:', error);
    process.exit(1);
  });

export default app;