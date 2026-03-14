<template>
  <div class="counter">
    <button type="button" @click="count += 1">
      count is {{ count }}
    </button>
  </div>
</template>

<script setup lang="ts">
const count = ref(0);
</script>

<surimi lang="ts">
import { select } from 'surimi';

select('.counter button').style({
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '4px',
  color: 'white',
  cursor: 'pointer',
  fontSize: '1rem',
  transition: 'background-color 0.3s ease',
  position: 'relative',
  backgroundColor: '#6366f1',
});

select('.counter button').hover().style({
  backgroundColor: '#4f46e5',
});
</surimi>