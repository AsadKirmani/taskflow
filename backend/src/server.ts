/// <reference path="./shared/types/express.d.ts" />
import app from './app';
import { connectToDatabase } from './config/database';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await connectToDatabase();
    console.log('MongoDB connected');

    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
}

bootstrap();