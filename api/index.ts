import app from '../src/app';
import { connectToDatabase } from '../src/config/database';

export default async (req: any, res: any) => {
  try {
    await connectToDatabase(); 
  
    return app(req, res);
  } catch (error) {
    console.error('Serverless bootstrap execution failed:', error);
    res.status(500).json({ success: false, message: 'Internal Server Initialization Error' });
  }
};
