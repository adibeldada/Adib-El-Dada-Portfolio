// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
	site: "https://adibeldada.com",

	// the dev toolbar sits right on top of the trail bar at the bottom of the page
	devToolbar: { enabled: false },

	integrations: [
		mdx(),
		// /stats is private, so search engines shouldn't be pointed at it
		sitemap({ filter: (page) => !new URL(page).pathname.startsWith('/stats') })
	],

	adapter: cloudflare({
		platformProxy: {
			enabled: true
		}
	})
});