<template>
  <b-navbar type="dark" variant="dark" class="bg-gray-800">
    <b-container fluid>
      <b-navbar-brand href="#">
        <img src="../../../public/img/champions/Aatrox.png" alt="Your Logo" height="30" class="d-inline-block align-top" />
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-item href="#">Dashboard</b-nav-item>
          <b-nav-item href="#">Matchups</b-nav-item>
          <b-nav-item href="#">Settings</b-nav-item>
          <!-- Add more navigation items here -->
        </b-navbar-nav>
      </b-collapse>
    </b-container>
  </b-navbar>
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
