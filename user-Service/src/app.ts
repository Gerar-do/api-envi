import express from 'express';
import cors from 'cors';
import userRoutes from './infrastructure/adapters/routes/UserRoutes';
import authRoutes from './infrastructure/adapters/routes/AuthRoutes';
import config from './config/config';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/', userRoutes);
app.use('/auth', authRoutes);

app.listen(config.port, () => {
  console.log(`UserService server running on port ${config.port}`);
});
