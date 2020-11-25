/* eslint-disable no-param-reassign */
/**
 * @des directive
 *
 */

// v-click-outside
export const clickOutside = {
    bind(el, binding) {
        function documentHandler(e) {
            if (el.contains(e.target)) {
                return false;
            }
            if (binding.expression) {
                binding.value(e);
            }
            return true;
        }

        el.vueClickOutside = documentHandler;
        document.addEventListener('click', documentHandler);
    },
    unbind(el) {
        document.removeEventListener('click', el.vueClickOutside);
        delete el.vueClickOutside;
    },
};

export default {};
