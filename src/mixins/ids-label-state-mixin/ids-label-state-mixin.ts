import { attributes, htmlAttributes } from '../../core/ids-attributes';
import { stringToBool } from '../../utils/ids-string-utils/ids-string-utils';
import { stripTags, stripHTML } from '../../utils/ids-xss-utils/ids-xss-utils';

/**
 * A mixin that will provide the container element of an IdsInputComponent with a class
 * reserved for changing the appearance of its associated label. The Label can be hidden entirely, or made blank.
 * @param {any} superclass Accepts a superclass and creates a new subclass from it
 * @returns {any} The extended object
 */
const IdsLabelStateMixin = (superclass: any) => class extends superclass {
  constructor() {
    super();

    if (!this.state) {
      this.state = {};
    }
    this.state.label = '';
    this.state.labelState = null;
  }

  connectedCallback() {
    super.connectedCallback?.();
    if (this.hasAttribute(attributes.LABEL_STATE)) {
      this.labelState = this.getAttribute(attributes.LABEL_STATE);
    }
  }

  static get attributes() {
    return [
      ...super.attributes,
      attributes.LABEL,
      attributes.LABEL_REQUIRED,
      attributes.LABEL_STATE
    ];
  }

  /**
   * Set the `label` text
   * @param {string} value of the `label` text property
   */
  set label(value: string) {
    const newValue = stripHTML(value);
    const currentValue = this.label;

    if (newValue !== currentValue) {
      if (this.state) this.state.label = newValue;
      if (newValue) {
        this.setAttribute(attributes.LABEL, `${newValue}`);
      } else {
        this.removeAttribute(attributes.LABEL);
      }
      this.setLabelText(newValue);
    }
  }

  get label(): string { return this.state?.label || ''; }

  /**
   * Used for setting the text contents of the shadowroot label
   * @param {string} [value] of label
   * @param {string} [selector] used to target a specific element in the shadowroot by CSS selector
   * @returns {void}
   */
  setLabelText(value = this.state?.label, selector = 'label'): void {
    const sanitizedValue = stripHTML(value);
    const labelEl = this.shadowRoot?.querySelector(selector);
    if (labelEl) {
      const textEl = labelEl.querySelector('ids-text');
      if (!this.labelState) {
        if (textEl) textEl.innerHTML = sanitizedValue || '';
        labelEl.classList[sanitizedValue ? 'remove' : 'add']('empty');
      } else {
        if (textEl) textEl.innerHTML = '';
        labelEl.classList.add('empty');
      }
    }
  }

  /**
   * Set `label-required` attribute
   * @param {string} value The `label-required` attribute
   */
  set labelRequired(value: string | boolean) {
    const isValid = typeof value !== 'undefined' && value !== null;
    const val = isValid ? stringToBool(value) : true;
    if (isValid) {
      this.setAttribute(attributes.LABEL_REQUIRED, val);
    } else {
      this.removeAttribute(attributes.LABEL_REQUIRED);
    }
    this.labelEl?.classList[!val ? 'add' : 'remove']('no-required-indicator');
  }

  get labelRequired(): boolean {
    const value = this.getAttribute(attributes.LABEL_REQUIRED);
    return value !== null ? stringToBool(value) : true;
  }

  /**
   * @returns {Array<string>} List of available hidden label states
   */
  labelStates = ['hidden', 'collapsed'];

  /**
   * @returns {string|null} the current state of the field label's visibility
   */
  get labelState() {
    return this.state?.labelState || null;
  }

  /**
   * @param {string|null} val the type of label visibility to apply to the field
   */
  set labelState(val) {
    let safeValue: any = null;
    if (typeof val === 'string') {
      safeValue = stripTags(val, '');
    }

    const currentValue: any = this.state.labelState;
    if (currentValue !== safeValue) {
      if (this.labelStates.includes(safeValue)) {
        this.setAttribute(attributes.LABEL_STATE, `${safeValue}`);
      } else {
        this.removeAttribute(attributes.LABEL_STATE);
        safeValue = null;
      }

      this.state.labelState = safeValue;
      this.#refreshLabelState(currentValue, safeValue);
    }
  }

  /**
   * Refreshes the component's label state, driven by
   * a CSS class on the WebComponent's `container` element
   *
   * @param {string} oldVariantName the variant name to "remove" from the style
   * @param {string} newVariantName the variant name to "add" to the style
   * @returns {void}
   */
  #refreshLabelState(oldVariantName: string, newVariantName: string): void {
    const cl = this.container.classList;

    if (oldVariantName) cl.remove(`label-state-${oldVariantName}`);
    if (newVariantName) cl.add(`label-state-${newVariantName}`);

    this.#setlabelState(newVariantName);

    // Fire optional callback
    if (typeof this.onlabelStateChange === 'function') {
      this.onlabelStateChange(newVariantName);
    }
  }

  #setlabelState(doHide: boolean | string = false) {
    if (doHide) {
      this.#hideLabel();
      this.input?.setAttribute(htmlAttributes.ARIA_LABEL, this.label);
    } else {
      this.#showLabel();
      this.input?.removeAttribute(htmlAttributes.ARIA_LABEL);
    }
  }

  #hideLabel() {
    this.setLabelText?.('');
  }

  #showLabel() {
    const existingLabel = this.shadowRoot.querySelector('label');
    if (!existingLabel && !this.labelEl) {
      if (this.fieldContainer) {
        this.fieldContainer.insertAdjacentHTML('beforebegin', `<label for="${this.id}-input" class="ids-label-text">
          <ids-text part="label" label="true" color-unset>${this.label}</ids-text>
        </label>`);
      }
    } else {
      this.setLabelText?.(this.label);
    }
  }
};

export default IdsLabelStateMixin;
