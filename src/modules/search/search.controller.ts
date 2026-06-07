import { TaskModel  } from '../../models/task.model';
import { Request, Response } from 'express';

const searchTasks = async (req: Request, res: Response) => {
  try {
    // Frontend se bheji hui query nikal rahe hain
    const searchQuery = req.query.q;

    // 1. Validation: Agar query empty hai toh turant khali array bhej do (DB call bachao)
    if (!searchQuery || searchQuery.toString().trim() === '') {
      return res.status(200).json([]);
    }

    // 2. Database Query (MongoDB/Mongoose)
    // $regex aur $options: 'i' ka matlab hai case-insensitive search
    const tasks = await TaskModel.find({
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } }
        // Agar tasks mein description bhi hai, toh usko bhi search me add kar sakte ho:
        // { description: { $regex: searchQuery, $options: 'i' } }
      ]
    })
    .limit(10) // Hamesha limit lagao taaki response fast rahe aur server par load na pade
    .lean(); // .lean() Mongoose ko plain JSON return karne bolta hai (bahut fast hota hai)

    // 3. Response bhejo
    return res.status(200).json(tasks);

  } catch (error) {
    console.error('Search API Error:', error);
    return res.status(500).json({ message: 'Internal server error during search' });
  }
};

export { searchTasks };