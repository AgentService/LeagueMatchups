// ClickOutsideDirective.js
export default {
  beforeMount(el, binding) {
    // Delay setting up the click outside event to avoid immediately closing the overlay
    setTimeout(() => {
      el.clickOutsideEvent = function (event) {
        // Check if click was outside the el and its children
        if (!(el === event.target || el.contains(event.target))) {
          // Call the provided method
          binding.value();
        }
      };
      document.addEventListener("click", el.clickOutsideEvent);
    }, 1111); // A delay of 0ms is often enough to wait until the current call stack is clear
  },
  unmounted(el) {
    if (el.clickOutsideEvent) {
      document.removeEventListener("click", el.clickOutsideEvent);
    }
  },
};
