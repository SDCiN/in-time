import express from 'express'
import { AuthController } from '../controllers/auth.controller.js'

const router = express.Router()
const authController = new AuthController()

// POST /api/v1/auth/login
router.post('/login', authController.login)

// POST /api/v1/auth/logout
router.post('/logout', authController.logout)

// POST /api/v1/auth/refresh
router.post('/refresh', authController.refresh)

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword)

// POST /api/v1/auth/reset-password
router.post('/reset-password', authController.resetPassword)

export default router
