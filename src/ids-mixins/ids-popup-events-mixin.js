import IdsEventsMixin from './ids-events-mixin';

// Attributes that will be applied to Popups with the Interactions Mixin.
const POPUP_INTERACTION_ATTRIBUTES = [];

/**
 * This mixin can be used with the IdsPopup component to provide event handling in some scenarios:
 * - When clicking outside the Popup occurs, an event handler at the document level hides the Popup.
 * @mixin IdsPopupInteractionsMixin
 * @param {any} superclass Accepts a superclass and creates a new subclass from it
 * @returns {any} The extended object
 */
const IdsPopupInteractionsMixin = (superclass) => class extends IdsEventsMixin(superclass) {
  constructor() {
    super();
  }

  /**
   * @property {boolean} hasOpenEvents true if "open" events are currently applied to this component
   */
  hasOpenEvents = false;

  /**
   * @returns {Array<string>} IdsInput component observable properties
   */
  static get attributes() {
    return [...super.attributes, ...POPUP_INTERACTION_ATTRIBUTES];
  }

  /**
   * Attaches some events when the Popupmenu is opened.
   * Call this method from inside your extended component whenever "open" events should be applied.
   * @private
   * @returns {void}
   */
  addOpenEvents() {
    // These event listeners are added on a repaint to provide time.
    // for the Popup's triggering event to end
    window.requestAnimationFrame(() => {
      // Attach a click handler to the window for detecting clicks outside the popup.
      // If these aren't captured by a popup, the menu will close.
      this.onEvent('click.toplevel', window, () => {
        if (typeof this.onOutsideClick === 'function') {
          this.onOutsideClick();
        }
      });
      this.hasOpenEvents = true;
    });
  }

  /**
   * Detaches some events when the Popupmenu is closed.
   * Call this method from inside your extended component whenever "open" events should be removed.
   * @private
   * @returns {void}
   */
  removeOpenEvents() {
    if (!this.hasOpenEvents) {
      return;
    }
    this.offEvent('click.toplevel', window);
    this.hasOpenEvents = false;
  }
};

export default IdsPopupInteractionsMixin;
