import EventEmitter from 'events';

class EventPublisher extends EventEmitter {}
export const eventPublisher = new EventPublisher();
