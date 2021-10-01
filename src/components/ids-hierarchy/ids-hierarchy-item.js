import {
  attributes,
  customElement,
  IdsElement,
  mix,
  scss
} from '../../core';

// Import Utils
import { IdsStringUtils } from '../../utils';

// Import Mixins
import {
  IdsEventsMixin,
  IdsThemeMixin
} from '../../mixins';

// Import Styles
import styles from './ids-hierarchy-item.scss';
import IdsHierarchy from './ids-hierarchy';

/**
 * IDS Hierarchy Component
 * @type {IdsHierarchyItem}
 * @inherits IdsElement
 */
@customElement('ids-hierarchy-item')
@scss(styles)
class IdsHierarchyItem extends mix(IdsElement).with(IdsEventsMixin, IdsThemeMixin) {
  // Types: root, expandable, nested - DONE
  // States: selected, expanded, collapsed
  // Legend Ex: FT, PT, Contractor, Open Position
  // Themeable

  constructor() {
    super();
    this.expander = this.shadowRoot?.querySelector('[part="icon-btn"]');
  }

  connectedCallback() {
    this.#hasNestedItems();
    this.#attachEventHandlers();
    super.connectedCallback();
  }

  /**
   * Return the attributes we handle as getters/setters
   * @returns {Array} The attributes in an array
   */
  static get attributes() {
    return [
      attributes.EXPANDED,
      'has-nested-items'
    ];
  }

  template() {
    return `
      <div class="ids-hierarchy-item">
        <div class="leaf">
          <span class="avatar">
            <slot name="avatar"></slot>
          </span>
          <div class="details">
            <slot name="heading"></slot>
            <slot name="subheading"></slot>
            <slot name="micro"></slot>
          </div>
          <ids-button part="icon-btn" id="test-icon-only-button-default">
            <span class="audible">Default Button</span>
            <ids-icon slot="icon" icon="caret-down"></ids-icon>
          </ids-button>
        </div>
        <div class="sub-level"><slot part="nested-items"></slot></div>
      </div>
    `;
  }

  set expanded(value) {
    const isValueTruthy = IdsStringUtils.stringToBool(value);
    if (isValueTruthy) {
      this.setAttribute(attributes.EXPANDED, true);
    } else {
      this.removeAttribute?.(attributes.EXPANDED);
    }
  }

  get expanded() {
    return this.getAttribute(attributes.EXPANDED);
  }

  #expandCollapse(expanded) {
    if (expanded) {
      this.setAttribute(attributes.EXPANDED, false);
    } else {
      this.setAttribute(attributes.EXPANDED, true);
    }
  }

  #hasNestedItems() {
    const nestedItems = this.container?.querySelector('[part="nested-items"]');
    const hasNestedItems = !!nestedItems?.assignedElements().length;
    if (hasNestedItems) {
      this.container.classList.add('has-nested-items');
    }
  }

  /**
   * Sets up event listeners
   * @private
   * @returns {void}
   */
   #attachEventHandlers() {
    this.onEvent('click', this.expander, () => {
      this.#expandCollapse(this.expanded);
    });

    this.onEvent('touchstart', this.expander, (e) => {
      if (e.touches && e.touches.length > 0) {
        this.#expandCollapse(this.expanded);
      }
    }, {
      passive: true
    });
  }
}

export default IdsHierarchyItem;
