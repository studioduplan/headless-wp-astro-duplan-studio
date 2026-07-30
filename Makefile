dev:
	bun install && bun run dev
prebuild:
	bun install && bun run prebuild
prod:
	bun install && bun run prebuild && bun run build
preview:
	bun install && bun run preview
g:
	bun install && bun run codegen