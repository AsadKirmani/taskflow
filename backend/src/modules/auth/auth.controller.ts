import { Request, Response } from "express";
import { CookieOptions } from "express";
import { jwtConfig } from "../../config/jwt.config";
import { AppError } from "../../shared/errors/app-error";
import { authService } from "./auth.service";
import { WorkspaceMemberModel } from "../../models/workspace-member.model";
import { redisClient } from "../../config/redis";
import { hashToken } from "../../shared/utils/token";

const isProduction = process.env.NODE_ENV === "production";

const prodCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  path: "/",
};

const devCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  path: "/",
};

const baseCookieOptions = isProduction ? prodCookieOptions : devCookieOptions;
console.log(
  `AuthController: Running in ${isProduction ? "production" : "development"} mode. Cookie options:`,
  isProduction ? prodCookieOptions : devCookieOptions,
);

const cookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: jwtConfig.refreshTokenExpiresInDays * 24 * 60 * 60 * 1000,
};
const accessTokenCookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: 15 * 60 * 1000,
};

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body, {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.cookie(jwtConfig.refreshCookieName, result.refreshToken, cookieOptions);
    res.cookie("accessToken", result.accessToken, accessTokenCookieOptions);
    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: result.user,
      },
    });
  },

  async login(req: Request, res: Response) {
    let clientIp: string | string[] | undefined = req.headers["x-forwarded-for"] || req.ip;
    if (typeof clientIp === "string") {
      clientIp = clientIp.split(",").map(ip => ip.trim());
    }
    const result = await authService.login(req.body, {
      ip: clientIp,
      userAgent: req.headers["user-agent"],
    });

    const tokenHash = hashToken(result.refreshToken);
    const cacheKey = `refresh_token:${tokenHash}`;
    const sessionData = {
      sub: result.user.id.toString(),
      email: result.user.email,
      user: result.user,
    };

    await redisClient.set(cacheKey, JSON.stringify(sessionData), {
      ex: 604800,
    });

    res.cookie(jwtConfig.refreshCookieName, result.refreshToken, cookieOptions);
    res.cookie("accessToken", result.accessToken, accessTokenCookieOptions);

    return res.json({
      success: true,
      message: "Login successful",
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  },

  async me(req: Request, res: Response) {
    const user = await authService.getCurrentUser(req.auth!.userId);
    const cacheKey = `user:${user.id}:profile`;

    const cachedProfile = await redisClient.get(cacheKey);

    if (cachedProfile) {
      return res.status(200).json(cachedProfile);
    }

    const memberships = await WorkspaceMemberModel.find({
      userId: req.auth!.userId,
    }).populate("workspaceId");

    const responsePayload = {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          preferences: user.preferences,
        },
        workspaces: memberships.map((m) => ({
          id: m.workspaceId._id,
          name: m.workspaceName,
          role: m.role,
        })),
      },
    };

    await redisClient.set(cacheKey, JSON.stringify(responsePayload), {
      ex: 86400,
    });

    return res.status(200).json(responsePayload);
  },
  async updateUserPassword(req: Request, res: Response) {
    const { currentPassword, newPassword } = req.body;
    const updatedUser = await authService.updatePassword(
      req.auth!.userId,
      currentPassword,
      newPassword,
    );
    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
      data: {
        user: updatedUser,
      },
    });
  },
  async updateProfile(req: Request, res: Response) {
    const { name, email, avatarUrl, preferences } = req.body;
    const userId = req.auth!.userId;
    const updatedUser = await authService.updateProfile(userId, {
      name,
      email,
      avatarUrl,
      preferences,
    });
    redisClient.del(`user:${userId}:profile`);
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser,
      },
    });
  },
  async updatePassword(req: Request, res: Response) {
    const { currentPassword, newPassword } = req.body;
    const updatedUser = await authService.updatePassword(
      req.auth!.userId,
      currentPassword,
      newPassword,
    );
    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
      data: {
        user: updatedUser,
      },
    });
  },
  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.[jwtConfig.refreshCookieName];

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        data: null,
      });
    }
    let clientIp: string | string[] | undefined = req.headers["x-forwarded-for"] || req.ip;
    if (typeof clientIp === "string") {
      clientIp = clientIp.split(",").map(ip => ip.trim());
    }
    const result = await authService.refresh(refreshToken, {
      ip: clientIp,
      userAgent: req.headers["user-agent"],
    });
    res.cookie(jwtConfig.refreshCookieName, result.refreshToken, cookieOptions);
    res.cookie("accessToken", result.accessToken, accessTokenCookieOptions);
    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    });
  },

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.[jwtConfig.refreshCookieName];

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    res.clearCookie(jwtConfig.refreshCookieName, baseCookieOptions);
    res.clearCookie("accessToken", baseCookieOptions);

    res.json({
      success: true,
      message: "Logged out successfully",
      data: null,
    });
  },
  async uploadAvatar(req: Request, res: Response) {
    const file = req.file;
    if (!file) {
      throw new AppError("No file uploaded", 400, "NO_FILE_UPLOADED");
    }
    const updatedUser = await authService.uploadAvatar(req.auth!.userId, file);
    redisClient.del(`user:${req.auth!.userId}:profile`);
    return res.status(200).json({
      success: true,
      message: "Avatar updated successfully",
      data: {
        user: updatedUser,
      },
    });
  },

  async logoutAll(req: Request, res: Response) {
    await authService.logoutAll(req.auth!.userId);
    res.clearCookie(jwtConfig.refreshCookieName, baseCookieOptions);
    res.clearCookie("accessToken", baseCookieOptions);

    res.json({
      success: true,
      message: "Logged out from all devices",
      data: null,
    });
  },
};
