// darkmode.js

// Check if a theme is already set in localStorage
const isDarkMode = localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

document.documentElement.classList.toggle('dark', isDarkMode);

// Toggle dark mode manually
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  console.log(`Dark mode is now ${document.documentElement.classList.contains('dark') ? 'enabled' : 'disabled'}`);
}

export default toggleDarkMode;
