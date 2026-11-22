/*
  Ajax add-to-cart for the wicz craft forms that aren't Dawn product forms:
  the box builder and the flight "add to cart" (form[data-wicz-cart-add]).

  With the cart drawer on, the form posts to /cart/add in the background,
  asks Shopify for the drawer and header-count sections in the same request
  (Section Rendering API), and opens the drawer with the new contents, the
  same way Dawn's product-form.js does. Without the drawer, or without
  JavaScript, the form posts normally and return_to sends the shopper to
  /cart.

  The listener sits on document, so it runs after the form's own submit
  handlers: the builder cancels the submit while slots are empty, and a
  cancelled submit is left alone here.
*/
(() => {
  if (window.wiczCartAdd) return;
  window.wiczCartAdd = true;

  const errorFor = (form) => {
    let error = form.querySelector('[data-cart-add-error]');
    if (!error) {
      error = document.createElement('p');
      error.className = 'wicz-cart-add__error';
      error.setAttribute('role', 'alert');
      error.dataset.cartAddError = '';
      const submit = form.querySelector('[type="submit"]');
      (submit?.parentElement ?? form).append(error);
    }
    return error;
  };

  document.addEventListener('submit', async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !form.matches('[data-wicz-cart-add]')) return;
    if (event.defaultPrevented) return;
    const drawer = document.querySelector('cart-drawer');
    if (!drawer || typeof drawer.renderContents !== 'function') return;

    event.preventDefault();
    const submit = form.querySelector('[type="submit"]');
    const error = errorFor(form);
    error.textContent = '';
    submit?.setAttribute('aria-busy', 'true');
    if (submit) submit.disabled = true;

    const body = new FormData(form);
    body.delete('return_to');
    body.append('sections', drawer.getSectionsToRender().map((section) => section.id).join(','));
    body.append('sections_url', window.location.pathname);

    try {
      const response = await fetch(window.routes?.cart_add_url ?? '/cart/add', {
        method: 'POST',
        headers: { Accept: 'application/javascript', 'X-Requested-With': 'XMLHttpRequest' },
        body,
      });
      const result = await response.json();
      if (!response.ok || result.status) {
        // e.g. 422 when one of the butters sold out since the page loaded
        error.textContent = String(result.description || result.message || 'that didn’t go in. try again.').toLowerCase();
        return;
      }
      drawer.classList.remove('is-empty');
      drawer.renderContents(result);
      if (window.publish && window.PUB_SUB_EVENTS) {
        window.publish(window.PUB_SUB_EVENTS.cartUpdate, { source: 'wicz-cart-add', productVariantId: result.variant_id, cartData: result });
      }
    } catch {
      // network trouble: fall back to the plain form post
      form.submit();
    } finally {
      submit?.removeAttribute('aria-busy');
      if (submit) submit.disabled = false;
    }
  });
})();
