<template>
  <div>
    <h1>Hello World</h1>
  </div>
</template>

<surimi lang="ts">
import { select } from 'surimi';

select('h1').style({
  color: 'blue',
});
</surimi>
