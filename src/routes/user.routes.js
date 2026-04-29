import { Router }      from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole }  from '../middleware/roles.js';
import { createUser, listUsers, deleteUser } from '../controllers/user.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management - HQ admin only
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of users
 *       403:
 *         description: Forbidden
 */
router.get('/',       authenticate, requireRole('hq_admin'), listUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, role]
 *             properties:
 *               username:   { type: string,  example: "station_officer1" }
 *               password:   { type: string,  example: "Password@123" }
 *               role:       { type: string,  enum: [hq_admin, provincial_admin, station_user, device] }
 *               station_id: { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: User created
 *       409:
 *         description: Username already exists
 */
router.post('/',      authenticate, requireRole('hq_admin'), createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 */
router.delete('/:id', authenticate, requireRole('hq_admin'), deleteUser);

export default router;