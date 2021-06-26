tsnd --respawn --transpile-only index.ts -- debug &
pid=$!
cd svelte
npx vite &
pid2=$!
echo Press enter to kill
read
kill $pid
kill $pid2