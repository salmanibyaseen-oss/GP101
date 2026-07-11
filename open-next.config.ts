// open-next.config.ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";

export default defineCloudflareConfig({
  // بيستخدم Cloudflare KV بدل الفايل سيستم لتخزين الكاش (Workers مالهاش فايل سيستم للكتابة)
  incrementalCache: kvIncrementalCache,
});
