import { CreateBoardDto } from "./board.dto";
import { boardRepository } from "./board.repository";
import { activityService } from "../activity/activity.service";

export const boardService = {
  async createBoard(
    input: CreateBoardDto,
    userId: string,
  ) {
    const board = await boardRepository.createBoard({
      ...input,
      createdBy: userId,
    });


    await activityService.logActivity({
      workspaceId: board.workspaceId.toString(),
      boardId: board._id.toString(),
      userId,
      actionType: 'board_created',
      entityType: 'board',
      entityId: board._id.toString(),
      metadata: {
        name: board.name,
        visibility: board.visibility
      }
    });

    return board;
  },
  async getBoardById(userId: string, boardId: string) {
    const board = await boardRepository.getBoardById(boardId);
    return board;
  },
  async getBoardsInWorkspace(workspaceId: string, userId: string) {
    const boards = await boardRepository.getBoardsInWorkspace(workspaceId, userId);
    return boards;
  },
  async updateBoard(
    boardId: string,
    data: {
      name?: string;
      description?: string;
      visibility?: "private" | "workspace";
      archived?: boolean;
    },
    userId?: string,
  ) {
    const updatedBoard = await boardRepository.updateBoard(boardId, data);

    if (updatedBoard && userId) {
      await activityService.logActivity({
        workspaceId: updatedBoard.workspaceId.toString(),
        boardId: boardId,
        userId,
        actionType: data.archived === true ? 'board_archived' : 'board_updated',
        entityType: 'board',
        entityId: boardId,
        metadata: {
          updatedFields: Object.keys(data)
        }
      });
    }

    return updatedBoard;
  },
  async getBoards(userId: string) {
    const boards = await boardRepository.getBoardsForUser(userId);
    return boards;
  },
  async reorderColumns(boardId: string, columnOrder: string[], userId: string) {
      return await boardRepository.reorderColumns(boardId, columnOrder);
    },
    async deleteBoard(boardId: string, userId: string) {
      const deletedBoard = await boardRepository.deleteBoard(boardId);
    }
};
