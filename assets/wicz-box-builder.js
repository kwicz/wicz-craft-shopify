/*
  <wicz-box-builder>: the box builder on the "build a box" product page
  (sections/wicz-box-builder.liquid, design guide §7, §8.2, §9).

  State: the chosen format (a variant radio with data-big / data-small slot
  counts), the 8 oz pick when the format has one, and an ordered list of
  2 oz picks. The tray shows every slot, the count and the flat price.
  Add to cart stays disabled until every slot is filled.

  On every change the hidden properties are rewritten, so the form posts
  one line to /cart/add:
    id                   the format's variant
    properties[big]      "salted" (one-big formats only)
    properties[slot n]   the flavor in each 2 oz slot
    properties[_components]  picked variant ids, 8 oz first; the box-expand
                             Cart Transform reads this
*/
class WiczBoxBuilder extends HTMLElement {
  connectedCallback() {
    this.data = JSON.parse(this.querySelector('[data-box-data]').textContent);
    this.form = this.querySelector('[data-box-form]');
    this.formats = [...this.querySelectorAll('.wicz-format__input')];
    this.bigInputs = [...this.querySelectorAll('.wicz-big-choice__input')];
    this.bigStep = this.querySelector('[data-big-step]');
    this.fillNumber = this.querySelector('[data-fill-number]');
    this.slotsList = this.querySelector('[data-slots]');
    this.countLabel = this.querySelector('[data-count-label]');
    this.priceLabel = this.querySelector('[data-box-price]');
    this.submit = this.querySelector('[data-submit]');
    this.status = this.querySelector('[data-status]');
    this.properties = this.querySelector('[data-properties]');
    // the care line sits outside the element, after the form
    this.care = this.closest('.wicz-box')?.querySelector('[data-care]');
    this.moneyFormat = this.dataset.moneyFormat;

    /** @type {string[]} 2 oz picks, by flavor handle, in slot order */
    this.picks = [];
    this.big = null;

    this.prefill();

    this.formats.forEach((input) => input.addEventListener('change', () => this.onFormatChange()));
    this.bigInputs.forEach((input) =>
      input.addEventListener('change', () => {
        this.big = input.value;
        this.render();
        this.announce(`${this.titleOf(input.value)}, ${this.dataset.bigSize}, in the big slot.`);
      }),
    );
    this.addEventListener('click', (event) => this.onClick(event));
    this.form.addEventListener('submit', (event) => this.onSubmit(event));

    this.render();
  }

  get format() {
    const input = this.formats.find((radio) => radio.checked) ?? this.formats[0];
    return { input, big: Number(input.dataset.big), small: Number(input.dataset.small), price: Number(input.dataset.price) };
  }

  /** ?box=eight&flight=classics-culinary-flight, or ?picks=salted,caesar
      (not ?format=, which Shopify reserves and answers with a 404) */
  prefill() {
    const params = new URLSearchParams(window.location.search);
    const format = params.get('box');
    if (format) {
      const match = this.formats.find((input) => input.dataset.format === format);
      if (match) match.checked = true;
    }
    const flight = this.data.flights[params.get('flight') ?? ''];
    const picks = flight ?? (params.get('picks') ?? '').split(',').filter(Boolean);
    this.picks = picks.filter((handle) => this.data.flavors[handle]?.small?.available).slice(0, this.format.small);
    const big = params.get('big');
    if (big && this.data.flavors[big]?.big?.available) this.big = big;
  }

  onFormatChange() {
    const { small } = this.format;
    if (this.picks.length > small) {
      const dropped = this.picks.splice(small);
      this.announce(`${dropped.length} removed to fit the smaller box.`);
    }
    this.render();
  }

  onClick(event) {
    const add = event.target.closest('[data-add]');
    const remove = event.target.closest('[data-remove]');
    const clear = event.target.closest('[data-clear-slot]');
    if (add) {
      const { small } = this.format;
      if (this.picks.length >= small) {
        this.announce(`the box is full. remove one to swap.`);
        return;
      }
      this.picks.push(add.dataset.add);
      this.render();
      this.announce(`${this.titleOf(add.dataset.add)} added. ${this.countText()}.`);
    } else if (remove) {
      const index = this.picks.lastIndexOf(remove.dataset.remove);
      if (index === -1) return;
      this.picks.splice(index, 1);
      this.render();
      this.announce(`${this.titleOf(remove.dataset.remove)} removed. ${this.countText()}.`);
    } else if (clear) {
      const index = Number(clear.dataset.clearSlot);
      const [handle] = this.picks.splice(index, 1);
      this.render();
      this.announce(`${this.titleOf(handle)} removed from slot ${index + 1}. ${this.countText()}.`);
    }
  }

  onSubmit(event) {
    if (!this.isComplete()) {
      event.preventDefault();
      this.announce(`fill every slot first. ${this.countText()}.`);
    }
  }

  isComplete() {
    const { big, small } = this.format;
    return this.picks.length === small && (big === 0 || Boolean(this.big));
  }

  countText() {
    const { big, small } = this.format;
    const picked = this.picks.length + (big && this.big ? 1 : 0);
    return `${picked} of ${big + small} picked`;
  }

  titleOf(handle) {
    return this.data.flavors[handle]?.title ?? handle;
  }

  announce(message) {
    this.status.textContent = '';
    window.requestAnimationFrame(() => {
      this.status.textContent = message;
    });
  }

  money(cents) {
    if (window.Shopify?.formatMoney) return window.Shopify.formatMoney(cents, this.moneyFormat);
    return `$${(cents / 100).toFixed(2)}`;
  }

  render() {
    const { big, small, price } = this.format;

    this.bigStep.hidden = big === 0;
    this.fillNumber.textContent = big === 0 ? '2' : '3';
    if (big === 0) this.big = null;
    this.bigInputs.forEach((input) => {
      input.checked = input.value === this.big;
      input.required = big > 0;
    });

    // tray: the big slot first, then the small ones
    const slots = [];
    if (big) slots.push(this.slotMarkup(this.big, 'big', -1));
    for (let i = 0; i < small; i += 1) slots.push(this.slotMarkup(this.picks[i], 'small', i));
    this.slotsList.innerHTML = slots.join('');
    this.slotsList.classList.toggle('wicz-tray__slots--many', small > 6);

    this.countLabel.textContent = this.countText();
    this.priceLabel.textContent = this.money(price);

    // picker counts and buttons
    const full = this.picks.length >= small;
    this.querySelectorAll('[data-count]').forEach((badge) => {
      const n = this.picks.filter((handle) => handle === badge.dataset.count).length;
      badge.textContent = n ? `× ${n}` : '';
    });
    this.querySelectorAll('[data-add]').forEach((button) => {
      const available = this.data.flavors[button.dataset.add]?.small?.available;
      button.disabled = !available || full;
    });
    this.querySelectorAll('[data-remove]').forEach((button) => {
      button.disabled = !this.picks.includes(button.dataset.remove);
    });

    this.submit.disabled = !this.isComplete();
    this.writeProperties();
    this.renderCare();
  }

  /** §8.4: a box holding any 1-week flavor uses the 1-week care line. */
  renderCare() {
    if (!this.care?.dataset.careShort) return;
    const inside = [...this.picks, ...(this.format.big && this.big ? [this.big] : [])];
    const short = inside.some((handle) => this.data.flavors[handle]?.bestWithin === '1 week');
    this.care.textContent = short ? this.care.dataset.careShort : this.care.dataset.careDefault;
  }

  slotMarkup(handle, size, index) {
    const label = size === 'big' ? this.dataset.bigSize : this.dataset.smallSize;
    if (!handle) {
      const where = size === 'big' ? 'big slot' : `slot ${index + 1}`;
      return `<li class="wicz-tray__slot wicz-tray__slot--${size} wicz-tray__slot--empty"><span class="visually-hidden">${where}, ${label}, empty</span></li>`;
    }
    const flavor = this.data.flavors[handle];
    const style = `--flavor-ground: ${flavor.ground}; --flavor-ink: ${flavor.ink}; --flavor-deep: ${flavor.deep}; --flavor-fold: ${flavor.fold};`;
    const name = escapeHtml(flavor.title);
    // the overhead cube / block photo when there is one, else a mini foil card
    const photo = size === 'big' ? flavor.block : flavor.cube;
    const look = photo ? 'wicz-tray__slot--photo' : 'foil';
    const face = photo
      ? `<img class="wicz-tray__image" src="${escapeHtml(photo)}" alt="">`
      : `<span class="wicz-tray__name" aria-hidden="true">${name}</span>`;
    if (size === 'big') {
      return `<li class="wicz-tray__slot wicz-tray__slot--big ${look}" style="${style}">${face}<span class="visually-hidden">big slot, ${name}, ${label}</span></li>`;
    }
    return `<li class="wicz-tray__slot wicz-tray__slot--small ${look}" style="${style}">
      <button type="button" class="wicz-tray__clear" data-clear-slot="${index}" aria-label="remove ${name} from slot ${index + 1}">
        ${face}
      </button>
    </li>`;
  }

  writeProperties() {
    const { big } = this.format;
    const inputs = [];
    const ids = [];
    if (big && this.big) {
      inputs.push(['properties[big]', `${this.titleOf(this.big)}, ${this.dataset.bigSize}`]);
      ids.push(this.data.flavors[this.big].big.id);
    }
    this.picks.forEach((handle, i) => {
      inputs.push([`properties[slot ${i + 1}]`, this.titleOf(handle)]);
      ids.push(this.data.flavors[handle].small.id);
    });
    inputs.push(['properties[_components]', ids.join(',')]);
    this.properties.replaceChildren(
      ...inputs.map(([name, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        return input;
      }),
    );
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

if (!customElements.get('wicz-box-builder')) customElements.define('wicz-box-builder', WiczBoxBuilder);
