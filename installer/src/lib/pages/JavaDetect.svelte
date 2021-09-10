<script lang="ts">
    export let javaInfo;
    (async () => {
        javaInfo = await fetch('/api/java-info');
    })()
</script>

<div class="flex">
    <h1>Here's what we found: {javaInfo}</h1>
    <h1 class="m-auto">Do you have your own version of java?</h1>
</div>