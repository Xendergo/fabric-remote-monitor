<script lang="ts">
    import { onMount } from 'svelte'
    let javaInfo;
    
    onMount(async () => {
        javaInfo = await (await fetch('/api/java-info')).text()
        console.log(javaInfo)
    })
</script>

<div class="flex">
	<h1>Here's what we found: {javaInfo}</h1>
	<h1 class="m-auto">Do you have your own version of java?</h1>
</div>
