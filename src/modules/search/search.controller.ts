import { TaskModel  } from '../../models/task.model';
import { Request, Response } from 'express';

const searchTasks = async (req: Request, res: Response) => {
  try {
    const searchQuery = req.query.q;

    if (!searchQuery || searchQuery.toString().trim() === '') {
      return res.status(200).json([]);
    }

    const tasks = await TaskModel.find({
      $or: [
        { title: { $regex: searchQuery, $options: 'i' } }
      ]
    })
    .limit(10) 
    .lean();

    return res.status(200).json(tasks);

  } catch (error) {
    console.error('Search API Error:', error);
    return res.status(500).json({ message: 'Internal server error during search' });
  }
};

export { searchTasks };