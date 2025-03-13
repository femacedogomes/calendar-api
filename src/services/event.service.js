const httpStatus = require('http-status');
const { Event } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create an event
 * @param {Object} eventBody
 * @returns {Promise<Event>}
 */
const createEvent = async (eventBody) => {
  const { createdBy, startTime, endTime } = eventBody;

  const conflictingEvent = await Event.findOne({
    createdBy,
    $or: [
      {
        startTime: { $lt: new Date(endTime) },
        endTime: { $gt: startTime },
      },
      {
        startTime: { $gte: new Date(startTime), $lt: new Date(endTime) },
      },
    ],
  });

  if (conflictingEvent) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Conflito de horário com o evento "${conflictingEvent.title}" de ${conflictingEvent.startTime} até ${conflictingEvent.endTime}.`
    );
  }
  return Event.create(eventBody);
};

/**
 * Query for event
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryEvent = async (filter, options) => {
  const event = await Event.find(filter).populate('attendees', 'name email');
  return event;
};

/**
 * Get event by id
 * @param {ObjectId} id
 * @returns {Promise<Event>}
 */
const getEventById = async (id) => {
  return Event.findById(id).populate('createdBy', 'name email').populate('attendees', 'name email');
};

/**
 * Update event by id
 * @param {ObjectId} eventId
 * @param {Object} updateBody
 * @returns {Promise<Event>}
 */
const updateEventById = async (eventId, updateBody) => {
  const event = await getEventById(eventId);
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }

  Object.assign(event, updateBody);
  await event.save();
  return event;
};

/**
 * Delete event by id
 * @param {ObjectId} eventId
 * @returns {Promise<Event>}
 */
const deleteEventById = async (eventId) => {
  const event = await getEventById(eventId);
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }
  await event.remove();
  return event;
};

/**
 * Invite user to event
 * @param {ObjectId} eventId
 * @param {ObjectId} userId
 * @returns {Promise<Event>}
 */
const inviteUserToEvent = async (eventId, userId) => {
  const event = await getEventById(eventId);
  if (!event) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Event not found');
  }

  if (event.attendees.includes(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User already invited');
  }

  const conflictingEvent = await Event.findOne({
    attendees: userId,
    $or: [
      {
        startTime: { $lt: event.endTime },
        endTime: { $gt: event.startTime },
      },
      {
        startTime: { $gte: event.startTime, $lt: event.endTime },
      },
    ],
  });

  if (conflictingEvent) {
    throw new ApiError(
      httpStatus.CONFLICT,
      `Usuário já está participando de um evento no mesmo horário: "${conflictingEvent.title}"`
    );
  }

  event.attendees.push(userId);
  await event.save();
  return event;
};

module.exports = {
  createEvent,
  queryEvent,
  getEventById,
  updateEventById,
  deleteEventById,
  inviteUserToEvent,
};
