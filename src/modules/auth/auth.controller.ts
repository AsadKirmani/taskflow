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

  // Upar file me import zaroor karna: 
// import { hashToken } from '../utils/hash'; (Ya jo bhi tera path ho)

async login(req: Request, res: Response) {
    // 1. Pehle user ko authenticate karo
    const result = await authService.login(req.body, {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    // 2. Redis ke liye Key aur Value tayyar karo (EXACTLY jaisa /refresh ko chahiye)
    const tokenHash = hashToken(result.refreshToken);
    const cacheKey = `refresh_token:${tokenHash}`;
    const sessionData = {
      sub: result.user.id.toString(), // (ya result.user.id, jo bhi tere DB ka format ho)
      email: result.user.email,
    };

    // 3. 💾 REDIS MEIN SAVE KARO (Response bhejne se PEHLE!)
    // 7 din = 604800 seconds
    //await redisClient.set(cacheKey, sessionData, { ex: 604800 });

    // 4. Khushi-khushi Response bhej do
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
    
    // 1. ⚡ Check in Redis
    // const cachedProfile = await redisClient.get(cacheKey);

    // if (cachedProfile) {
    //   return res.status(200).json(cachedProfile);
    // }
    // 2. 🐌 Fetch from MongoDB
    const memberships = await WorkspaceMemberModel.find({
      userId: req.auth!.userId,
    }).populate("workspaceId");

    // 3. 📦 Response ka format taiyar karo
    const responsePayload = {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        workspaces: memberships.map((m) => ({
          id: m.workspaceId._id,
          name: m.workspaceName, // Ensure workspaceName exists on m, or use m.workspaceId.name
          role: m.role,
        })),
      },
    };

    // 4. 💾 REDIS MEIN SAVE KARO (Yeh missing tha)
    // ex: 86400 matlab 24 ghante ke liye cache hoga
    //await redisClient.set(cacheKey, responsePayload, { ex: 86400 });

    // 5. User ko response bhejo
    return res.status(200).json(responsePayload);
},

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.[jwtConfig.refreshCookieName];

    if (!refreshToken) {
      throw new AppError("Refresh token missing", 401, "REFRESH_TOKEN_MISSING");
    }

    const result = await authService.refresh(refreshToken, {
      ip: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.cookie(jwtConfig.refreshCookieName, result.refreshToken, cookieOptions);
    res.cookie("accessToken", result.accessToken, accessTokenCookieOptions);
    res.json({
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken: result.accessToken,
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
