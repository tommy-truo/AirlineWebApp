import express from 'express';
import * as PassengerController from '../controllers/passenger-controller.js';

const router = express.Router({ mergeParams: true });

//      PASSENGER CONTROLLER ROUTES

// GET /users/:userID/passengers
router.get('/users/:userID/passengers', PassengerController.getPassengersByUser);

// POST /users/:userID/passengers
router.post('/users/:userID/passengers', PassengerController.createAndLinkPassenger);

// PUT /passengers/:passengerID
// Updates FULL passenger fields
router.put('/passengers/:passengerID', PassengerController.updatePassenger);

// PATCH /users/:userID/passengers/:passengerID
// Updates ONLY SPECIFIED passenger fields
router.patch('/users/:userID/passengers/:passengerID', PassengerController.patchPassenger);

// DELETE /users/:userID/passengers/:passengerID
router.delete('/users/:userID/passengers/:passengerID', PassengerController.unlinkPassenger);

// (Leave at the Bottom) Redirect trailing slash URLs to non-trailing slash version
router.use((req, res, next) => {
    if (req.path.endsWith('/') && req.path.length > 1) {
        const query = req.url.slice(req.path.length);
        res.redirect(301, req.path.slice(0, -1) + query);
    } else {
        next();
    }
});

export default router;