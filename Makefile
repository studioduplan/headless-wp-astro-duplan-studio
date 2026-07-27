dev:
	bun install && bun run dev
prod:
	bun install && bun run build
preview:
	bun install && bun run preview
g:
	bun install && bun run codegen