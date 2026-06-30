import { TaskModel  } from '../../models/task.model';
import { Request, Response } from 'express';
import { WorkspaceMemberModel } from '../../models/workspace-member.model';
import { PermissionService } from '../../services/permission.service';
import { PERMISSION } from '../../config/roles';

const searchTasks = async (req: Request, res: Response) => {
  try {
    const searchQuery = typeof req.query.q === 'string' ? req.query.q : '';

    if (!searchQuery) {
      return res.status(200).json([]);
    }
    const memberships = await WorkspaceMemberModel.find({ userId: req.auth!.userId, workspaceId: { $exists: true } })
    .select('workspaceId')
    .lean();
    const userWorkspaceIds = memberships.map(membership => membership.workspaceId.toString());
    const tasks = await TaskModel.find({
      workspaceId: { $in: userWorkspaceIds },
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