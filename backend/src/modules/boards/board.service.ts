import { CreateBoardDto } from "./board.dto";
import { boardRepository } from "./board.repository";

export const boardService = {
  async createBoard(
    input: CreateBoardDto,
    userId: string,
    workspaceId: string,
  ) {
    const board = await boardRepository.createBoard({
      ...input,
      createdBy: userId,
      workspaceId,
    });
    return board;
  },
  async getBoardById(boardId: string) {
    const board = await boardRepository.getBoardById(boardId);
    return board;
  },
  async getBoardsInWorkspace(workspaceId: string, userId: string) {
    const boards = await boardRepository.getBoardsInWorkspace(workspaceId);
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
  ) {
    const updatedBoard = await boardRepository.updateBoard(boardId, data);
    return updatedBoard;
  },
  async getBoards(userId: string) {
    const boards = await boardRepository.getBoardsForUser(userId);
    return boards;
  }
};
