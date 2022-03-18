import { attributes } from '../../core/ids-attributes';
import { stringToBool } from '../../utils/ids-string-utils/ids-string-utils';
import IdsListBox from '../../components/ids-list-box/ids-list-box';
import IdsListBoxOption from '../../components/ids-list-box/ids-list-box-option';
import IdsPopup from '../../components/ids-popup/ids-popup';
import IdsDataSource from '../../core/ids-data-source';

const IdsAutoCompleteMixin = (superclass) => class extends superclass {
  #listBox = new IdsListBox();

  get listBox() { return this.#listBox; }

  #popup = new IdsPopup();

  get popup() { return this.#popup; }

  get popupContent() {
    return this.popup.container.querySelector('slot[name="content"]') || undefined;
  }

  /**
   * Gets the internal IdsDataSource object
   * @returns {IdsDataSource} object
   */
  datasource = new IdsDataSource();

  constructor() {
    super();
  }

  static get attributes() {
    return [
      ...super.attributes,
      attributes.AUTOCOMPLETE
    ];
  }

  connectedCallback() {
    super.connectedCallback?.();

    if (!this.autocomplete) {
      return;
    }

    this.#attachPopup();
    this.#attachEventListeners();
  }

  set autocomplete(value) {
    const val = stringToBool(value);
    if (val) {
      this.setAttribute(attributes.AUTOCOMPLETE, val);
    } else {
      this.removeAttribute(attributes.AUTOCOMPLETE);
    }
  }

  get autocomplete() {
    return this.hasAttribute(attributes.AUTOCOMPLETE);
  }

  set data(value) {
    if (this.datasource) {
      this.datasource.data = value || [];
      this.rerender();
    }
  }

  get data() {
    return this?.datasource?.data || [];
  }

  get rootNode() {
    return this.getRootNode().body.querySelector('ids-container') || window.document.body;
  }

  /**
   * Rerenders the IdsInput component
   * @private
   */
  rerender() {
    super.rerender?.();
  }

  #attachPopup() {
    this.popup.type = 'dropdown';
    this.popup.align = 'bottom, left';
    this.popup.alignTarget = this.fieldContainer;
    this.popup.open = false;
    this.popup.visible = false;
    this.popup.y = -1;

    this.rootNode?.appendChild(this.#popup);
    this.popupContent.appendChild(this.#listBox);
  }

  #closePopup() {
    this.popup.open = false;
    this.popup.visible = false;
  }

  #openPopup() {
    this.popup.open = true;
    this.popup.visible = true;
  }

  #findMatches(term, data) {
    return data.filter((res) => {
      const regex = new RegExp(term, 'gi');
      return res.label.match(regex);
    });
  }

  #displayMatches() {
    const resultsArr = this.#findMatches(this.value, this.data);
    const results = resultsArr.map((res) => `<ids-list-box-option>${res.label}</ids-list-box-option>`).join('');
    this.#openPopup();
    this.#listBox.innerHTML = results;
  }

  #attachEventListeners() {
    this.onEvent('keyup', this, this.#displayMatches);
    this.onEvent('change', this, this.#displayMatches);
    this.onEvent('blur', this, this.#closePopup);
  }
};

export default IdsAutoCompleteMixin;
