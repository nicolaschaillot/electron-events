import CalendarAPI from './api/CalendarAPI';
import CalendarStore from './CalendarStore';
const api = new CalendarAPI();
const store = new CalendarStore();

import Configstore from 'configstore';
const conf = new Configstore('keendoo-events');

import EventEmitter from 'events';

const POLL_INTERVAL = 100000;
const EVENTS_MAX_NUMBER = 6;

export default class extends EventEmitter {

  setAuth(auth) {
    api.setAuth(auth);
  }

  async sync() {
    const { syncTokens, items } = await api.syncEvents(conf.get('syncTokens') || {});
    conf.set('syncTokens', syncTokens);
    await store.removeItems(items.remove);
    await store.setItems(items.save);
  }

  async getEvents() {
    const start = new Date();
    start.setDate(start.getDate() - 0);
    start.setHours(0);
    start.setMinutes(0);
    const end = new Date();
    end.setDate(end.getDate() + 100);

    console.log('Sync: #tick: Now pulling all from store' + " - Start date : " + start.toISOString() + " - End date : " + end.toISOString());

    const events = await store.getByDate(start.toISOString(), end.toISOString(), EVENTS_MAX_NUMBER);

    console.log('Sync: #tick: Update done, firing update:', events.length);

    this.emit('update', events);
  }

  async tick() {
    try {
      console.log('Sync: #tick: Starting');

      await this.sync();

      console.log('Sync: #tick: Synced and updated store');

      await this.getEvents();
    } catch (e) {
      console.error(e, e.stack);
    }

    this.timeout = setTimeout(this.tick.bind(this), POLL_INTERVAL);
  }

  async start() {
    if (this.timeout) this.stop();

    console.log('Sync: #start: Start');
    await this.getEvents();
    this.tick();
  }

  stop() {
    clearTimeout(this.timeout);
  }
}
