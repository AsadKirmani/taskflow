import { Router } from 'express';
import { authController } from './auth.controller';
import { asyncHandler } from '../../shared/utils/async-handler';
import { validate } from '../../middleware/validation.middleware';
import { loginDto, registerDto } from './auth.dto';
import { authMiddleware } from '../../middleware/auth.middleware';
import { uploadMiddleware } from '../../middleware/upload.middleware';

const router = Router();

router.post('/register', validate(registerDto), asyncHandler(authController.register));
router.post('/login', validate(loginDto), asyncHandler(authController.login));
router.get('/me', authMiddleware, asyncHandler(authController.me));
router.post('/refresh-token', asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));
router.post('/upload-avatar', authMiddleware, uploadMiddleware.single('avatar'), asyncHandler(authController.uploadAvatar));
router.post('/logout-all', authMiddleware, asyncHandler(authController.logoutAll));
router.patch('/reset-password', authMiddleware, asyncHandler(authController.updatePassword));
router.patch('/update-profile', authMiddleware, asyncHandler(authController.updateProfile));
export default router;