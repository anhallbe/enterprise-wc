import { customElement, scss } from '../../core/ids-decorators';
import { attributes } from '../../core/ids-attributes';
import { stringToBool } from '../../utils/ids-string-utils/ids-string-utils';
import IdsEventsMixin from '../../mixins/ids-events-mixin/ids-events-mixin';
import IdsElement from '../../core/ids-element';
import '../ids-checkbox/ids-checkbox';
import '../ids-swappable/ids-swappable';
import '../ids-swappable/ids-swappable-item';
import styles from './ids-list-view-item.scss';
import type IdsListView from './ids-list-view';
import type IdsCheckbox from '../ids-checkbox/ids-checkbox';

const Base = IdsEventsMixin(
  IdsElement
);

/**
 * IDS List View Item Component
 * @type {IdsListViewItem}
 * @inherits IdsElement
 */
@customElement('ids-list-view-item')
@scss(styles)
export default class IdsListViewItem extends Base {
  #rootNode?: IdsListView;

  /**
   * Reference to the ids-list-view parent element
   * @returns {IdsListView} the ids-list-view parent
   */
  get listView() {
    if (!this.#rootNode) this.#rootNode = (this.getRootNode() as any)?.host ?? this.closest('ids-list-view');
    return this.#rootNode as IdsListView;
  }

  get data() {
    return this.listView?.data ?? [];
  }

  get rowData() {
    return this.data[this.rowIndex] ?? {
      disabled: this.disabled,
      itemActivated: this.itemActivated,
      itemSelected: this.itemSelected,
    };
  }

  #parentListView: HTMLElement | null = null;

  /**
   * Get the parent IdsListView that contains this list-view-item
   * @returns {HTMLElement | null} this list-item's parent slot
   */
  get parentListView(): HTMLElement | null {
    return this.#parentListView;
  }

  /**
   * Get the top-most wrapper element that contains this list-view-item
   * @returns {HTMLElement | null} this list-item's parent slot
   */
  get parentListItemWrapper(): HTMLElement | null {
    return this.parentListView?.shadowRoot?.querySelector(`[index="${this.rowIndex}"]`) ?? null;
  }

  /**
   * Get slot that was autogenerated in IdsListView to contain this list-view-item
   * @returns {HTMLSlotElement | null} this list-item's parent slot
   */
  get parentSlot(): HTMLSlotElement | null {
    return this.parentListView?.shadowRoot?.querySelector<HTMLSlotElement>(`slot[name="${this.slot}"]`) ?? null;
  }

  /**
   * Invoked each time the custom element is appended into a document-connected element.
   */
  connectedCallback() {
    super.connectedCallback();
    this.#parentListView = this.parentElement;

    this.#attachEventListeners();
    this.#setAttributes();
  }

  /**
   * Invoked each time the custom element is removed from a document-connected element.
   */
  disconnectedCallback() {
    if (this.parentListView?.isConnected) {
      super.disconnectedCallback();
      this.removeAttribute?.('slot');
      (this.parentListView as any)?.disconnectedCallback?.();
    }
  }

  #attachEventListeners() {
    this.offEvent('click.listview-item', this);
    this.onEvent('click.listview-item', this, () => this.#clicked());

    // this.offEvent('click.listview-item', this.checkbox);
    // this.onEvent('click.listview-item', this.checkbox, () => this.toggleSelect(!this.selected));
  }

  get checkbox(): IdsCheckbox | undefined {
    return [
      ...this.querySelectorAll<IdsCheckbox>('ids-checkbox'),
      ...(this.shadowRoot?.querySelectorAll<IdsCheckbox>('ids-checkbox') ?? [])
    ][0] ?? undefined;
  }

  toggleCheckbox(doSelect?: boolean) {
    if (doSelect === undefined) doSelect = this.selected !== true;
    const checkbox = this.checkbox;
    // if (!checkbox) return;
    if (checkbox) checkbox.checked = doSelect;

    // const listView = this.listView;
    // const selectable = listView?.selectable ?? '';

    // if (selectable !== 'mixed') this.toggleSelect(doSelect);
    // if (selectable === 'single' || selectable === 'multiple') this.toggleSelect(doSelect);
  }

  toggleSelect(doSelect?: boolean) {
    if (doSelect === undefined) doSelect = this.selected !== true;

    const listView = this.listView;
    const selectable = listView?.selectable ?? '';

    if (!selectable) {
      return listView?.itemsSelected.forEach((item) => { item.selected = false; });
    }
    if (selectable === 'single') {
      listView?.itemsSelected.forEach((item) => {
        if (item !== this) item.selected = false;
      });
    }
    // if (selectable === 'mixed') {
    //   // toggle checkbox if it is clicked directly
    // }
    // if (selectable === 'multiple') {
    //   // do not alter any other list-items
    // }

    this.selected = doSelect;

    if (doSelect) {
      this.triggerEvent('itemSelect', listView, {
        detail: this.rowData
      });
    }
  }

  /**
   * Inner template contents
   * @returns {string} The template
   */
  template(): string {
    return `
      <div class="list-item-area">
        ${this.templateCheckbox()}
        <div class="list-item-content">
          <slot></slot>
        </div>
      </div>
    `;
  }

  /**
   * Helper method to render the list-view-item template
   * @returns {string} html
   */
  templateCheckbox(): string {
    const listView = this.listView;
    if (!listView) return '';

    const rowData = this.rowData;
    const rowIndex = this.rowIndex;

    if (listView.selectable === 'multiple' || listView.selectable === 'mixed') {
      const checked = rowData.itemSelected ? ' checked' : '';
      const disabled = rowData.disabled ? ' disabled' : '';
      let checkbox = `
        <ids-checkbox
          class="list-item-checkbox"
          label="cb-item-${rowIndex}"
          label-state="hidden"
          ${checked}
          ${disabled}>
        </ids-checkbox>
      `;

      if (listView.selectable === 'multiple' && listView.hideCheckboxes) checkbox = '';

      return checkbox;
    }

    return '';
  }

  /**
   * Return the attributes we handle as getters/setters
   * @returns {Array} The attributes in an array
   */
  static get attributes() {
    return [
      ...super.attributes,
      attributes.ACTIVE,
      attributes.DISABLED,
      attributes.SELECTED,
      attributes.ROW_INDEX,
    ];
  }

  /**
   * Set the row index. This index can be used to lazy-load data from IdsListView.data.
   * @param {number} value the index
   */
  set rowIndex(value: number) {
    if (value !== null && value >= 0) {
      this.setAttribute(attributes.ROW_INDEX, String(value));
    } else {
      this.removeAttribute(attributes.ROW_INDEX);
    }
  }

  /**
   * Get the row index. This index can be used to lazy-load data from IdsListView.data.
   * @returns {number} this list-view-item's index in parent IdsListView
   */
  get rowIndex(): number { return Number(this.getAttribute(attributes.ROW_INDEX) ?? -1); }

  /**
   * Wrapper function that adds interface to match dataset interface.
   * @returns {boolean} true/false
   */
  get itemActivated(): boolean { return this.active; }

  /**
   * Get the list-item active state.
   * @returns {boolean} true/false
   */
  get active(): boolean { return this.hasAttribute(attributes.ACTIVE); }

  /**
   * Set the list-item active state.
   * @param {boolean} value true/false
   */
  set active(value: boolean) {
    if (stringToBool(value)) {
      this.setAttribute(attributes.ACTIVE, 'true');
      this.setAttribute('activated', 'true');
    } else {
      this.removeAttribute(attributes.ACTIVE);
      this.removeAttribute('activated');
    }

    this.#tabbed();
  }

  /**
   * Get the list-item disabled state.
   * @returns {boolean} true/false
   */
  get disabled(): boolean { return this.hasAttribute(attributes.DISABLED); }

  /**
   * Set the list-item disabled state.
   * @param {boolean} value true/false
   */
  set disabled(value: boolean) {
    if (stringToBool(value)) {
      this.setAttribute(attributes.DISABLED, '');
    } else {
      this.removeAttribute(attributes.DISABLED);
    }
  }

  /**
   * Wrapper function that adds interface to match dataset interface.
   * @returns {boolean} true/false
   */
  get itemSelected(): boolean { return this.selected; }

  /**
   * Get the list-item selected state.
   * @returns {boolean} true/false
   */
  get selected(): boolean { return this.hasAttribute(attributes.SELECTED); }

  /**
   * Set the list-item selected state.
   * @param {boolean} value true/false
   */
  set selected(value: boolean) {
    if (stringToBool(value)) {
      this.setAttribute(attributes.SELECTED, '');
      this.setAttribute('aria-selected', '');
      if (this.listView?.selectable === 'mixed') this.setAttribute('hide-selected-color', '');
    } else {
      this.removeAttribute(attributes.SELECTED);
      this.removeAttribute('aria-selected');
      this.removeAttribute('hide-selected-color');
    }
  }

  #clicked() {
    const listView = this.listView;
    listView?.itemsActive?.forEach((item) => { item.active = false; });
    this.active = true;

    this.toggleSelect(!this.selected);
  }

  #tabbed() {
    this.listView?.itemsTabbable?.forEach((item) => {
      item.tabIndex = -1;
      item.setAttribute('tabindex', '-1');
    });

    if (this.active) {
      this.tabIndex = 0;
      this.setAttribute('tabindex', '0');
    }
  }

  #setAttributes() {
    const listView = this.listView;
    const rowData = this.rowData;
    const rowIndex = this.rowIndex;
    // const tabindex = typeof rowIndex !== 'undefined' && !rowIndex ? '0' : '-1';

    if (listView.sortable) {
      this.classList.add('sortable');
    } else {
      this.classList.remove('sortable');
    }

    this.active = !!rowData.itemActivated;
    this.disabled = !!rowData.disabled;
    this.selected = !!rowData.itemSelected;

    this.tabIndex = -1;
    this.setAttribute('tabindex', '-1');

    const size = listView?.data?.length || listView?.itemsFiltered?.length;
    this.setAttribute('role', 'option');
    this.setAttribute('aria-setsize', String(size));
    this.setAttribute('aria-posinset', String(rowIndex + 1));
    this.setAttribute('index', String(rowIndex));
  }
}
