<script lang="ts">
  export let header;
  export let answered = false;

</script>
<main>
  <h1>{header}</h1>
  <slot></slot>
</main>