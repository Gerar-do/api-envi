import express from 'express';
import cors from 'cors';
import userRoutes from './infrastructure/routes/UserRoutes';
import config from './config/config';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/users', userRoutes);

app.listen(config.port, () => {
  console.log(`UserService server running on port ${config.port}`);
});
