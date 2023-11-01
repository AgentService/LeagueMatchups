<template>
  <div class="custom-container">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'CustomContainer'
}
</script>

<style scoped>
.custom-container {
  background: linear-gradient(to right, var(--blue-6), var(--blue-4));
  border-radius: 20px;
  padding: 20px;
  margin: 20px 0;
  color: var(--gold-1);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.custom-container:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
}