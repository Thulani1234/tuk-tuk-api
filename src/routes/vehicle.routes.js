
import { Router }      from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireRole }  from '../middleware/roles.js';
import {
  getAllVehicles, getVehicleById,
  createVehicle, updateVehicle, deleteVehicle,
} from '../controllers/vehicle.controller.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Vehicles
 *   description: Tuk-tuk vehicle management
 */

/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Get all vehicles
 *     tags: [Vehicles]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: district_id
 *         schema: { type: integer }
 *       - in: query
 *         name: province_id
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [active, inactive, flagged] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 50 }
 *     responses:
 *       200:
 *         description: List of vehicles
 *       401:
 *         description: Unauthorized
 */
router.get('/',       authenticate, getAllVehicles);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   get:
 *     summary: Get vehicle by ID
 *     tags: [Vehicles]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Vehicle details
 *       404:
 *         description: Vehicle not found
 */
router.get('/:id',    authenticate, getVehicleById);

/**
 * @swagger
 * /api/vehicles:
 *   post:
 *     summary: Register a new vehicle
 *     tags: [Vehicles]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [registration_number]
 *             properties:
 *               registration_number: { type: string, example: "WP 1234" }
 *               driver_name:         { type: string, example: "Kamal Perera" }
 *               driver_nic:          { type: string, example: "901234567V" }
 *               contact_number:      { type: string, example: "0771234567" }
 *               district_id:         { type: integer, example: 1 }
 *               device_id:           { type: string, example: "DEVICE-0201" }
 *     responses:
 *       201:
 *         description: Vehicle registered
 *       409:
 *         description: Registration number already exists
 */
router.post('/',      authenticate, requireRole('hq_admin','provincial_admin'), createVehicle);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   put:
 *     summary: Update a vehicle
 *     tags: [Vehicles]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               driver_name:    { type: string }
 *               driver_nic:     { type: string }
 *               contact_number: { type: string }
 *               district_id:    { type: integer }
 *               status:         { type: string, enum: [active, inactive, flagged] }
 *               device_id:      { type: string }
 *     responses:
 *       200:
 *         description: Vehicle updated
 *       404:
 *         description: Vehicle not found
 */
router.put('/:id',    authenticate, requireRole('hq_admin','provincial_admin'), updateVehicle);

/**
 * @swagger
 * /api/vehicles/{id}:
 *   delete:
 *     summary: Delete a vehicle
 *     tags: [Vehicles]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Vehicle deleted
 *       404:
 *         description: Vehicle not found
 */
router.delete('/:id', authenticate, requireRole('hq_admin'), deleteVehicle);

export default router;