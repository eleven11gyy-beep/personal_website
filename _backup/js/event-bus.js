// ============================================
// 星图 · Star Atlas — Event Bus (Publish/Subscribe)
// ============================================

class EventBus {
  constructor() {
    this._listeners = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event
   * @param {Function} fn
   * @returns {Function} unsubscribe function
   */
  on(event, fn) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(fn);

    return () => this.off(event, fn);
  }

  /**
   * Subscribe once
   */
  once(event, fn) {
    const wrapper = (...args) => {
      this.off(event, wrapper);
      fn(...args);
    };
    return this.on(event, wrapper);
  }

  /**
   * Unsubscribe
   */
  off(event, fn) {
    const fns = this._listeners.get(event);
    if (fns) {
      fns.delete(fn);
      if (fns.size === 0) this._listeners.delete(event);
    }
  }

  /**
   * Emit event with data
   */
  emit(event, data) {
    const fns = this._listeners.get(event);
    if (fns) {
      fns.forEach(fn => {
        try { fn(data); } catch (e) { console.error(`[EventBus] Error in "${event}":`, e); }
      });
    }
  }

  /**
   * Remove all listeners
   */
  clear() {
    this._listeners.clear();
  }
}

// Singleton instance
const bus = new EventBus();

// --- Event Constants ---
export const Events = {
  STAR_HOVER: 'star:hover',
  STAR_CLICK: 'star:click',
  CARD_OPEN: 'card:open',
  CARD_CLOSE: 'card:close',
  FOCUS_CONSTELLATION: 'focus:constellation',
  FOCUS_OVERVIEW: 'focus:overview',
  CAMERA_TRANSITION_START: 'camera:transition:start',
  CAMERA_TRANSITION_END: 'camera:transition:end',
  LOAD_PROGRESS: 'load:progress',
  LOAD_COMPLETE: 'load:complete',
  EASTER_EGG: 'easter:egg',
  ATMOSPHERE_TOGGLE: 'atmosphere:toggle',
  LIGHT_BURST: 'light:burst',
};

export default bus;
