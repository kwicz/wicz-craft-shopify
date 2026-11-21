/*
  <wicz-carton-builder>: the carton bundle builder (sections/wicz-carton.liquid).

  Slots mode: one radio group per slot. The form already works as a plain
  /cart/add post; this script adds live dots, the running total, status
  messages, and a fresh carton id for every add.

  Capacity mode: +/− steppers per flavor and size. A 2″ cube takes 2 slots,
  a 1.2″ cube takes 1 (weights come from the carton's metafield). The script
  enforces the capacity and posts the picks with /cart/add.js.

  Either way, every line in one carton shares `_carton_id`, and carries
  `_carton_parent` (the carton variant id). The Cart Transform function
  merges each group into one carton line.
*/
class WiczCartonBuilder extends HTMLElement {
  connectedCallback() {
    this.mode = this.dataset.mode;
    this.capacity = Number(this.dataset.capacity || 0);
    this.moneyFormat = this.dataset.moneyFormat || '${{amount}}';
    this.form = this.querySelector('[data-carton-form]');
    this.status = this.querySelector('[data-status]');
    this.total = this.querySelector('[data-total]');
    this.submit = this.querySelector('[data-submit]');
    this.dots = this.closest('.wicz-carton__info')?.querySelector('[data-carton-dots]');

    if (!this.form) return;

    // We validate ourselves so messages can be specific and announced.
    this.form.noValidate = true;
    this.form.addEventListener('change', () => this.update());
    this.form.addEventListener('input', () => this.update());
    this.form.addEventListener('submit', (event) => this.onSubmit(event));

    if (this.mode === 'capacity') {
      this.form.addEventListener('click', (event) => {
        const button = event.target.closest('[data-step]');
        if (button) this.step(button);
      });
    }

    this.update();
  }

  /* ---------- reading state ---------- */

  /** Picks as a flat list, one entry per cube: { variantId, handle, title, size, price, ground, ink, weight } */
  picks() {
    if (this.mode === 'slots') {
      return [...this.form.querySelectorAll('[data-slot]')].map((slot) => {
        const input = slot.querySelector('input[type="radio"]:checked');
        return input
          ? {
              variantId: input.value,
              handle: input.dataset.handle,
              title: input.dataset.title,
              size: slot.dataset.size,
              price: Number(input.dataset.price),
              ground: input.dataset.ground,
              ink: input.dataset.ink,
              weight: 1,
            }
          : { empty: true, size: slot.dataset.size };
      });
    }

    const picks = [];
    for (const input of this.stepperInputs()) {
      const quantity = this.quantityOf(input);
      for (let n = 0; n < quantity; n += 1) {
        picks.push({
          variantId: input.dataset.variantId,
          handle: input.dataset.handle,
          title: input.dataset.title,
          size: input.dataset.size,
          price: Number(input.dataset.price),
          ground: input.dataset.ground,
          ink: input.dataset.ink,
          weight: Number(input.dataset.weight),
        });
      }
    }
    return picks;
  }

  stepperInputs() {
    return [...this.form.querySelectorAll('input[data-variant-id]')];
  }

  quantityOf(input) {
    const value = Math.floor(Number(input.value));
    return Number.isFinite(value) && value > 0 ? value : 0;
  }

  used() {
    return this.picks().reduce((sum, pick) => sum + (pick.empty ? 0 : pick.weight), 0);
  }

  /* ---------- capacity steppers ---------- */

  step(button) {
    const input = this.querySelector(`#${CSS.escape(button.getAttribute('aria-controls'))}`);
    if (!input || input.disabled) return;
    const delta = Number(button.dataset.step);
    const weight = Number(input.dataset.weight);
    const next = this.quantityOf(input) + delta;

    if (next < 0) return;
    if (delta > 0 && this.used() + weight > this.capacity) {
      this.say(`that won't fit. a ${input.dataset.size} takes ${weight} ${weight === 1 ? 'slot' : 'slots'}.`);
      return;
    }
    input.value = String(next);
    this.update();
  }

  /* ---------- rendering ---------- */

  update() {
    const picks = this.picks();

    if (this.mode === 'capacity') this.clampCapacity();
    this.renderDots(picks);
    this.renderTotal(picks);
    if (this.mode === 'capacity') this.renderMeter();
    this.renderSubmitState(picks);
  }

  /** Typed quantities can overshoot; trim the last-edited field back to what fits. */
  clampCapacity() {
    let over = this.used() - this.capacity;
    if (over <= 0) return;
    const inputs = this.stepperInputs().reverse();
    for (const input of inputs) {
      const weight = Number(input.dataset.weight);
      while (over > 0 && this.quantityOf(input) > 0) {
        input.value = String(this.quantityOf(input) - 1);
        over -= weight;
      }
    }
    this.say(`that's more than the box holds. trimmed to ${this.capacity} slots.`);
  }

  renderDots(picks) {
    if (!this.dots) return;
    const items = [];

    if (this.mode === 'slots') {
      for (const pick of picks) items.push(pick);
    } else {
      for (const pick of picks) items.push(pick);
      // remaining capacity shows as empty 1-slot dots
      for (let n = this.used(); n < this.capacity; n += 1) items.push({ empty: true });
    }

    this.dots.replaceChildren(
      ...items.map((pick) => {
        const li = document.createElement('li');
        const big = pick.size && pick.size.startsWith('2');
        li.className = `wicz-dots__dot${pick.empty ? ' wicz-dots__dot--empty' : ''}${big ? ' wicz-dots__dot--big' : ''}`;
        const label = document.createElement('span');
        label.className = 'visually-hidden';
        if (pick.empty) {
          label.textContent = pick.size ? `empty ${pick.size} slot` : 'empty slot';
        } else {
          li.style.setProperty('--dot-ground', pick.ground);
          li.style.setProperty('--dot-ink', pick.ink);
          li.title = `${pick.title}, ${pick.size}`;
          label.textContent = `${pick.title}, ${pick.size}`;
        }
        li.append(label);
        return li;
      }),
    );
  }

  renderTotal(picks) {
    if (!this.total) return;
    const cents = picks.reduce((sum, pick) => sum + (pick.empty ? 0 : pick.price), 0);
    // Prices are placeholders until real ones exist (design guide §8).
    if (cents === 0) {
      this.total.innerHTML = '<span class="wicz-placeholder">[PRICE]</span>';
    } else {
      this.total.textContent = this.formatMoney(cents);
    }
  }

  renderMeter() {
    const used = this.used();
    this.querySelectorAll('.wicz-meter__cell').forEach((cell, index) => {
      cell.classList.toggle('is-filled', index < used);
    });
    const label = this.querySelector('[data-meter-label]');
    if (label) label.textContent = `${used} of ${this.capacity} slots filled`;

    // + buttons that would overflow are disabled
    this.querySelectorAll('[data-step="1"]').forEach((button) => {
      const input = this.querySelector(`#${CSS.escape(button.getAttribute('aria-controls'))}`);
      button.disabled = !input || input.disabled || used + Number(input.dataset.weight) > this.capacity;
    });
    this.querySelectorAll('[data-step="-1"]').forEach((button) => {
      const input = this.querySelector(`#${CSS.escape(button.getAttribute('aria-controls'))}`);
      button.disabled = !input || this.quantityOf(input) === 0;
    });
  }

  renderSubmitState(picks) {
    const problem = this.problem(picks);
    this.submit.setAttribute('aria-disabled', problem ? 'true' : 'false');
    this.submit.dataset.problem = problem || '';
  }

  /** Returns a plain-language reason the carton can't be added yet, or null. */
  problem(picks) {
    if (this.mode === 'slots') {
      const empty = picks.findIndex((pick) => pick.empty);
      return empty === -1 ? null : `pick a flavor for slot ${empty + 1}.`;
    }
    const used = this.used();
    if (used === 0) return 'add at least one cube.';
    if (used < this.capacity) {
      const left = this.capacity - used;
      return `${left} ${left === 1 ? 'slot' : 'slots'} still empty.`;
    }
    return null;
  }

  say(message) {
    if (!this.status) return;
    // clear first so repeated messages are announced again
    this.status.textContent = '';
    window.requestAnimationFrame(() => {
      this.status.textContent = message;
    });
  }

  formatMoney(cents) {
    const amount = (cents / 100).toFixed(2);
    return this.moneyFormat.replace(/\{\{\s*amount[a-z_]*\s*\}\}/, amount);
  }

  /* ---------- adding to cart ---------- */

  async onSubmit(event) {
    event.preventDefault();
    const picks = this.picks();
    const problem = this.problem(picks);
    if (problem) {
      this.say(problem);
      const firstEmpty = this.form.querySelector('[data-slot] input[type="radio"]:not(:disabled)');
      if (this.mode === 'slots') {
        const emptySlot = [...this.form.querySelectorAll('[data-slot]')].find(
          (slot) => !slot.querySelector('input:checked'),
        );
        emptySlot?.querySelector('input:not(:disabled)')?.focus();
      } else if (firstEmpty) {
        firstEmpty.focus();
      }
      return;
    }

    const cartonId = this.newCartonId();
    const parent =
      this.form.querySelector('[name$="[_carton_parent]"]')?.value ||
      this.form.querySelector('[data-carton-parent]')?.value;

    // one line per variant; repeated picks of the same flavor and size become quantity
    const byVariant = new Map();
    for (const pick of picks) {
      byVariant.set(pick.variantId, (byVariant.get(pick.variantId) || 0) + 1);
    }
    const items = [...byVariant].map(([id, quantity]) => ({
      id: Number(id),
      quantity,
      properties: { _carton_id: cartonId, _carton_parent: String(parent) },
    }));

    this.submit.setAttribute('aria-busy', 'true');
    this.say('adding your carton.');

    try {
      const response = await fetch(`${window.Shopify?.routes?.root || '/'}cart/add.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ items }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.description || body.message || 'something went wrong.');
      window.location.href = `${window.Shopify?.routes?.root || '/'}cart`;
    } catch (error) {
      this.submit.removeAttribute('aria-busy');
      this.say(`couldn't add the carton. ${String(error.message).toLowerCase()}`);
    }
  }

  newCartonId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

if (!customElements.get('wicz-carton-builder')) {
  customElements.define('wicz-carton-builder', WiczCartonBuilder);
}
