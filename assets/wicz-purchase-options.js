// One-time vs subscribe picker (snippets/wicz-purchase-options.liquid).
// product-info.js replaces this element's inner HTML when the size changes;
// re-check the option the shopper picked if the new size offers it, and
// keep the URL's ?selling_plan= in step so a shared link opens on that plan.
if (!customElements.get('wicz-purchase-options')) {
  customElements.define(
    'wicz-purchase-options',
    class WiczPurchaseOptions extends HTMLElement {
      connectedCallback() {
        this.choice = this.checked()?.dataset.key || null;
        this.addEventListener('change', this.onChange);
        this.observer = new MutationObserver(() => this.restore());
        this.observer.observe(this, { childList: true });
      }

      disconnectedCallback() {
        this.removeEventListener('change', this.onChange);
        this.observer?.disconnect();
      }

      checked() {
        return this.querySelector('input[name="selling_plan"]:checked');
      }

      onChange = (event) => {
        if (event.target.name !== 'selling_plan') return;
        this.choice = event.target.dataset.key;
        this.syncUrl(event.target.value);
      };

      restore() {
        if (!this.choice) return;
        const match = this.querySelector(`input[name="selling_plan"][data-key="${CSS.escape(this.choice)}"]`);
        if (match) match.checked = true;
        this.syncUrl(this.checked()?.value || '');
      }

      syncUrl(planId) {
        const url = new URL(window.location.href);
        if (planId) url.searchParams.set('selling_plan', planId);
        else url.searchParams.delete('selling_plan');
        window.history.replaceState(window.history.state, '', url);
      }
    }
  );
}
