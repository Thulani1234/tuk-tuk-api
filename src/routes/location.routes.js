import { Router }      from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole }  from '../middleware/roles.js';
import {
  addPing, getLastKnown, getLiveAll, getHistory,
} from '../controllers/location.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: GPS location tracking
 */

/**
 * @swagger
 * /api/locations/ping:
 *   post:
 *     summary: Submit a GPS ping from a device
 *     tags: [Locations]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [vehicle_id, latitude, longitude]
 *             properties:
 *               vehicle_id: { type: integer, example: 1 }
 *               latitude:   { type: number,  example: 6.9271 }
 *               longitude:  { type: number,  example: 79.8612 }
 *               speed:      { type: number,  example: 42.5 }
 *               heading:    { type: number,  example: 180.0 }
 *     responses:
 *       201:
 *         description: Ping recorded
 *       400:
 *         description: Missing required fields
 */
router.post('/ping',              authenticate, requireRole('device','hq_admin'), addPing);

/**
 * @swagger
 * /api/locations/live:
 *   get:
 *     summary: Get last known position of all active vehicles
 *     tags: [Locations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: district_id
 *         schema: { type: integer }
 *       - in: query
 *         name: province_id
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Live positions of all active vehicles
 */
router.get('/live',               authenticate, getLiveAll);

/**
 * @swagger
 * /api/locations/history:
 *   get:
 *     summary: Get location history across all vehicles
 *     tags: [Locations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time, example: "2025-01-01T00:00:00Z" }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time, example: "2025-01-08T00:00:00Z" }
 *       - in: query
 *         name: district_id
 *         schema: { type: integer }
 *       - in: query
 *         name: province_id
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 200 }
 *     responses:
 *       200:
 *         description: Location history
 */
router.get('/history',            authenticate, getHistory);

/**
 * @swagger
 * /api/locations/{vehicleId}/last:
 *   get:
 *     summary: Get last known position of a specific vehicle
 *     tags: [Locations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Last known location
 *       404:
 *         description: Vehicle not found
 */
router.get('/:vehicleId/last',    authenticate, getLastKnown);

/**
 * @swagger
 * /api/locations/{vehicleId}/history:
 *   get:
 *     summary: Get location history for a specific vehicle
 *     tags: [Locations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: vehicleId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 200 }
 *     responses:
 *       200:
 *         description: Vehicle location history
 */
router.get('/:vehicleId/history', authenticate, getHistory);

export default router;