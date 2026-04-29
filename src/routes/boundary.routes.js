import { Router }      from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getProvinces, getDistricts, getStations,
} from '../controllers/boundary.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Boundaries
 *   description: Provinces, districts and police stations
 */

/**
 * @swagger
 * /api/boundaries/provinces:
 *   get:
 *     summary: Get all 9 provinces
 *     tags: [Boundaries]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of provinces
 */
router.get('/provinces', authenticate, getProvinces);

/**
 * @swagger
 * /api/boundaries/districts:
 *   get:
 *     summary: Get all 25 districts
 *     tags: [Boundaries]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: province_id
 *         schema: { type: integer }
 *         description: Filter by province
 *     responses:
 *       200:
 *         description: List of districts
 */
router.get('/districts', authenticate, getDistricts);

/**
 * @swagger
 * /api/boundaries/stations:
 *   get:
 *     summary: Get all police stations
 *     tags: [Boundaries]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: district_id
 *         schema: { type: integer }
 *         description: Filter by district
 *     responses:
 *       200:
 *         description: List of police stations
 */
router.get('/stations',  authenticate, getStations);

export default router;