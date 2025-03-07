const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { eventsService } = require('../services');
const ApiError = require('../utils/ApiError');

const createEvent = catchAsync(async (req, res) => {
  const event = await eventsService.createEvent({
    ...req.body,
    createdBy: req.user.id,
  });
  res.status(httpStatus.CREATED).send(event);
});

const getEvents = catchAsync(async (req, res) => {
  const filter = {
    createdBy: req.user.id,
    ...(req.query.startDate && { startTime: { $gte: new Date(req.query.startDate) } }),
    ...(req.query.endDate && { endTime: { $lte: new Date(req.query.endDate) } }),
    ...(req.query.status && { status: req.query.status }),
  };
  const events = await eventsService.queryEvents(filter);
  res.send(events);
});

const getEvent = catchAsync(async (req, res) => {
  const event = await eventsService.getEventById(req.params.id);
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }
  res.send(event);
});

const updateEvent = catchAsync(async (req, res) => {
  const event = await eventsService.updateEventById(req.params.id, req.body);
  res.send(event);
});

const deleteEvent = catchAsync(async (req, res) => {
  await eventsService.deleteEventById(req.params.id);
  res.status(httpStatus.NO_CONTENT).send();
});

const inviteUser = catchAsync(async (req, res) => {
  const event = await eventsService.inviteUserToEvent(req.params.id, req.body.userId);
  res.send(event);
});

module.exports = {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,
  inviteUser,
};
