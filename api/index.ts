import app from '../src/app';
import { connectToDatabase } from '../src/config/database';

export default async (req: any, res: any) => {
  try {
    // 🚀 Fast-resolving serverless cache pool check
    await connectToDatabase(); 
    
    // Pass execution payload directly to your Express middleware routing tree
    return app(req, res);
  } catch (error) {
    console.error('Serverless bootstrap execution failed:', error);
    res.status(500).json({ success: false, message: 'Internal Server Initialization Error' });
  }
};
