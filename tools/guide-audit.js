/*
  wicz craft design guide audit (§3.3, §6, §11).
  Paste into the browser console on any storefront page (or run with a
  browser automation tool). Returns a report object; an empty array means
  that rule passed on this page at this viewport width.

  Checks, per visible element:
  - lightInkSmallText   light inks used for text under 32px (or under 24px bold)   §3.3, §11
  - lowContrastText     small text under WCAG AA 4.5:1 against its solid background
  - extraGradients      any gradient outside the .foil sheen                      §6.1, §11
  - oddRadii            border radius other than 6px or 999px                     §6.2, §11
  - upperCase           uppercase/capitalize transforms, capitals in display type §5, §11
  - bannedCopy          "!", emoji, "artisanal", "elevate", "indulge", "deal",
                        "save", flavor numbers (nº)                         §5, §11
  - plainFraunces       Fraunces without SOFT 100 / WONK 1                         §4.1, §11
  - holidayStyling      Cormorant / EB Garamond / "winter solstice"               §2, §11
  - rotated, stamps     more than one rotated element or stamp                     §6.1, §7, §11
  - goldUnsalted        an unsalted card or pack on gold foil                      §3.2, §11
*/
(function wiczGuideAudit() {
  const LIGHT_INKS = {
    '147,174,235': 'periwinkle #93AEEB',
    '229,88,58': 'tomato #E5583A',
    '217,59,140': 'magenta #D93B8C',
    '47,143,85': 'kelly green #2F8F55',
    // tangerine on oxblood is allowed at any size (§3.3); flagged only elsewhere
    '255,138,61': 'tangerine #FF8A3D',
  };
  const OXBLOOD = '122,30,30';
  const GOLD = '246,232,164';
  const BANNED_WORDS = /\b(artisanal|elevate[sd]?|indulg(e|ent|ence)|deals?|sav(e|es|ings?))\b|nº/i;
  // ©, ® and ™ are "pictographic" in Unicode but aren't emoji
  const EMOJI = /(?![©®™])\p{Extended_Pictographic}/u;

  const visible = (el) => {
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return false;
    if (el.closest('.visually-hidden, [hidden], noscript, script, style, template')) return false;
    // clipped to nothing = visually hidden (e.g. the radios behind Dawn's pills)
    if (/rect\(0(px)?,? 0(px)?,? 0(px)?,? 0(px)?\)/.test(style.clip)) return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 1 && rect.height > 1;
  };
  const ownText = (el) =>
    [...el.childNodes]
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent)
      .join('')
      .trim();
  const rgb = (value) => {
    const match = value.match(/rgba?\(([^)]+)\)/);
    if (!match) return null;
    const [r, g, b, a = 1] = match[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return { r, g, b, a, key: `${r},${g},${b}` };
  };
  const luminance = ({ r, g, b }) => {
    const channel = (v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
  };
  /** text with alpha (Dawn dims small text this way) blended over its background */
  const blend = (fg, bg) =>
    fg.a >= 1
      ? fg
      : { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 };
  const contrast = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi + 0.05) / (lo + 0.05);
  };
  /** nearest ancestor with an opaque background color (gradients ignored) */
  const backgroundOf = (el) => {
    for (let node = el; node && node.nodeType === 1; node = node.parentElement) {
      const color = rgb(getComputedStyle(node).backgroundColor);
      if (color && color.a > 0.9) return color;
    }
    return { r: 255, g: 255, b: 255, a: 1, key: '255,255,255' };
  };
  const describe = (el) => {
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
    const text = ownText(el).slice(0, 40);
    return `${el.tagName.toLowerCase()}${cls ? `.${cls}` : ''}${text ? ` "${text}"` : ''}`;
  };

  const report = {
    page: location.pathname,
    width: innerWidth,
    lightInkSmallText: [],
    lowContrastText: [],
    extraGradients: [],
    oddRadii: [],
    upperCase: [],
    bannedCopy: [],
    plainFraunces: [],
    holidayStyling: [],
    rotated: [],
    stamps: document.querySelectorAll('.wicz-stamp').length,
    goldUnsalted: [],
  };

  for (const el of document.body.querySelectorAll('*')) {
    if (!visible(el)) continue;
    const style = getComputedStyle(el);
    const text = ownText(el);

    if (text) {
      const size = parseFloat(style.fontSize);
      const weight = Number(style.fontWeight);
      const large = size >= 32 || (size >= 24 && weight >= 700);
      const color = rgb(style.color);
      const background = backgroundOf(el);

      if (color && LIGHT_INKS[color.key] && !large) {
        const tangerineOnOxblood = color.key === '255,138,61' && background.key === OXBLOOD;
        if (!tangerineOnOxblood) report.lightInkSmallText.push(`${describe(el)} ${size}px ${LIGHT_INKS[color.key]}`);
      }
      if (color && !large) {
        const ratio = contrast(blend(color, background), background);
        if (ratio < 4.5) report.lowContrastText.push(`${describe(el)} ${ratio.toFixed(2)}:1`);
      }

      const legal = el.closest('.wicz-legal, .shopify-policy__container, .wicz-placeholder');
      if (!legal) {
        if (style.textTransform === 'uppercase' || style.textTransform === 'capitalize') {
          report.upperCase.push(`${describe(el)} text-transform: ${style.textTransform}`);
        }
        const display = style.fontFamily.includes('Fraunces');
        if (display && /[A-Z]/.test(text) && style.textTransform !== 'lowercase') {
          report.upperCase.push(`${describe(el)} capitals in display type`);
        }
      }

      if (text.includes('!') || EMOJI.test(text) || BANNED_WORDS.test(text)) {
        report.bannedCopy.push(describe(el));
      }

      if (style.fontFamily.includes('Fraunces')) {
        const axes = style.fontVariationSettings;
        if (!/"SOFT" 100/.test(axes) || !/"WONK" 1/.test(axes)) {
          report.plainFraunces.push(`${describe(el)} (${axes})`);
        }
      }
      if (/cormorant|garamond/i.test(style.fontFamily) || /winter solstice/i.test(text)) {
        report.holidayStyling.push(describe(el));
      }
    }

    if (style.backgroundImage.includes('gradient') && !el.classList.contains('foil')) {
      report.extraGradients.push(describe(el));
    }

    const radii = [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius];
    const odd = radii.filter((r) => r !== '0px' && r !== '6px' && r !== '999px');
    if (odd.length) report.oddRadii.push(`${describe(el)} ${[...new Set(odd)].join(' ')}`);

    if (style.transform && style.transform !== 'none') {
      const m = style.transform.match(/matrix\(([^)]+)\)/);
      const b = m ? Number(m[1].split(',')[1]) : 0;
      if (Math.abs(b) > 0.001) report.rotated.push(describe(el));
    }
  }

  // unsalted is always silver (§3.2)
  for (const card of document.querySelectorAll('.wicz-card, .wicz-picker__item')) {
    if (!/\bunsalted\b/.test(card.textContent)) continue;
    const pack = card.querySelector('.foil');
    if (pack && rgb(getComputedStyle(pack).backgroundColor)?.key === GOLD) report.goldUnsalted.push(describe(card));
  }

  // de-duplicate repeated components so the report stays readable
  for (const key of Object.keys(report)) {
    if (Array.isArray(report[key])) {
      const counts = report[key].reduce((map, item) => map.set(item, (map.get(item) || 0) + 1), new Map());
      report[key] = [...counts].map(([item, n]) => (n > 1 ? `${item} ×${n}` : item));
    }
  }
  return report;
})();
