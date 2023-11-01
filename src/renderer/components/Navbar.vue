<template>
  <nav class="navbar">
    <ul class="navbar-list">
      <li class="navbar-item">DAARPTANIES</li>
      <li class="navbar-item">NOW</li>
      <li class="navbar-item">LEDAUBE</li>
      <!-- The magical paths (texts) continue here -->
    </ul>
  </nav>
</template>

<style scoped>
.navbar {
  background-color: #04121f;
  padding: 1rem;
  height:5rem;
}

.navbar-list {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  list-style-type: none; /* The ancient runes (bulletpoints) are dispelled */
  padding: 0; /* The padding is harmonized to enhance alignment */
}

.navbar-item {
  color: #00ffa2;
  font-weight: bold;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.3s ease;
}

.navbar-item:hover {
  color: #ff005c;
}
</style>
