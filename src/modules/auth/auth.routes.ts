import { Router } from 'express';
import { authController } from './auth.controller';
import { asyncHandler } from '../../shared/utils/async-handler';
import { validate } from '../../middleware/validation.middleware';
import { loginDto, registerDto } from './auth.dto';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.post('/register', validate(registerDto), asyncHandler(authController.register));
router.post('/login', validate(loginDto), asyncHandler(authController.login));
router.get('/me', authMiddleware, asyncHandler(authController.me));
router.post('/refresh-token', asyncHandler(authController.refresh));
router.post('/logout', asyncHandler(authController.logout));
router.post('/logout-all', authMiddleware, asyncHandler(authController.logoutAll));

export default router;