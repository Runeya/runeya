import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/perspective.css';
import 'tippy.js/animations/perspective-extreme.css';
import 'tippy.js/animations/shift-away.css';
import 'tippy.js/animations/shift-toward.css';
import 'tippy.js/animations/scale.css';
import 'tippy.js/animations/scale-extreme.css';
import 'tippy.js/animations/scale-subtle.css';

// Directive custom pour remplacer les tooltips PrimeVue
export default {
  mounted(el, binding) {
    createTooltip(el, binding);
  },

  updated(el, binding) {
    if (el._tippy) {
      // Met à jour le contenu si nécessaire
      el._tippy.setContent(getContent(binding));
      
      // Met à jour les options si nécessaires
      const newOptions = getOptions(binding);
      el._tippy.setProps(newOptions);
    } else {
      createTooltip(el, binding);
    }
  },
  unmounted(el) {
    if (el._tippy) {
      el._tippy.destroy();
      delete el._tippy;
    }
  },
};

function createTooltip(el, binding) {
  const content = getContent(binding);
  const options = getOptions(binding);

  if (content) {
    el._tippy = tippy(el, {
      content,
      ...options,
    });
  }
  if(binding.modifiers.show) {
    el._tippy.show();
  }
}

function getContent(binding) {
  // Support pour différents formats
  if (typeof binding.value === 'string') {
    return binding.value;
  }
  
  if (typeof binding.value === 'object' && binding.value.value) {
    return binding.value.value;
  }
  
  return binding.value;
}

function getOptions(binding) {
  const defaultOptions = {
    arrow: `
    <svg id="svg"width="16" height="6">
    <path class="svg-arrow" style="fill: var(--system-backgroundColor300);" d="M0 6s1.796-.013 4.67-3.615C5.851.9 6.93.006 8 0c1.07-.006 2.148.887 3.343 2.385C14.233 6.005 16 6 16 6H0z"/>
    <path class="svg-content" style="fill: var(--system-backgroundColor50);" d="m0 7s2 0 5-4c1-1 2-2 3-2 1 0 2 1 3 2 3 4 5 4 5 4h-16z"/>
  </svg>
    `,
    theme: 'runeya',
    animation: 'scale-subtle',
    duration: [200, 100],
    delay: [0, 0],
    appendTo: () => document.body,
  };

  // Support pour les modificateurs PrimeVue (v-tooltip.top, v-tooltip.bottom, etc.)
  const placement = getPlacementFromModifiers(binding.modifiers);
  if (placement) {
    defaultOptions.placement = placement;
  }

  // Support pour les options dans l'objet binding
  if (typeof binding.value === 'object' && binding.value.options) {
    return { ...defaultOptions, ...binding.value.options };
  }

  return defaultOptions;
}

function getPlacementFromModifiers(modifiers) {
  if (modifiers.top) return 'top';
  if (modifiers.bottom) return 'bottom';
  if (modifiers.left) return 'left';
  if (modifiers.right) return 'right';
  if (modifiers.auto) return 'auto';
  
  return 'top'; // default
} 