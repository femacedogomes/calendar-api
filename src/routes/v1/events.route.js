const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const eventValidation = require('../../validations/events.validation');
const eventController = require('../../controllers/events.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(eventValidation.createEvent), eventController.createEvent)
  .get(auth(), validate(eventValidation.getEvents), eventController.getEvents);

router
  .route('/:id')
  .get(auth(), validate(eventValidation.getEvent), eventController.getEvent)
  .put(auth(), validate(eventValidation.updateEvent), eventController.updateEvent)
  .delete(auth(), validate(eventValidation.deleteEvent), eventController.deleteEvent);

router.route('/:id/invite').post(auth(), validate(eventValidation.inviteUser), eventController.inviteUser);

module.exports = router;
