/**
 * Maps TMDB provider IDs to their homepage URLs.
 * Most streaming services use a single global domain with automatic
 * region detection, so no per-country mapping is needed.
 */
const PROVIDER_HOMEPAGES: Record<number, string> = {
  // Major global platforms
  8: "https://www.netflix.com",
  175: "https://www.netflix.com",           // Netflix Kids
  337: "https://www.disneyplus.com",
  9: "https://www.primevideo.com",
  119: "https://www.primevideo.com",         // Amazon Prime Video (alternate)
  384: "https://www.max.com",                // HBO Max (Max)
  1899: "https://www.max.com",              // Max
  350: "https://tv.apple.com",              // Apple TV+
  531: "https://www.paramountplus.com",
  15: "https://www.hulu.com",
  386: "https://www.peacocktv.com",         // Peacock
  387: "https://www.peacocktv.com",         // Peacock Premium
  283: "https://www.crunchyroll.com",
  43: "https://www.starz.com",
  37: "https://www.sho.com",               // Showtime
  230: "https://www.discoveryplus.com",     // Discovery+
  619: "https://www.starplus.com",          // Star+
  39: "https://www.nowtv.com",             // NOW (UK)

  // Additional popular providers
  2: "https://tv.apple.com",               // Apple TV
  3: "https://play.google.com/store/movies", // Google Play Movies
  10: "https://www.amazon.com",             // Amazon Video
  11: "https://www.mubi.com",
  35: "https://www.rakuten.tv",             // Rakuten TV
  68: "https://www.microsoft.com/en-us/store/movies-and-tv", // Microsoft Store
  149: "https://www.britbox.com",
  151: "https://www.britbox.com",           // BritBox (alternate)
  188: "https://www.youtube.com",           // YouTube Premium
  192: "https://www.youtube.com",           // YouTube
  257: "https://www.fubo.tv",              // fuboTV
  300: "https://pluto.tv",                 // Pluto TV
  444: "https://tubitv.com",               // Tubi
  445: "https://www.bfi.org.uk/bfi-player", // BFI Player
  453: "https://www.docsville.com",         // DOCsville
  521: "https://www.shudder.com",
  526: "https://www.amc-plus.com",          // AMC+
  546: "https://www.wow.sky.de",            // WOW (Germany)
  559: "https://www.skyshowtime.com",       // SkyShowtime
  569: "https://www.itvx.com",             // ITVX
  1770: "https://www.canal-plus.com",       // Canal+
  1773: "https://www.canal-plus.com",       // Canal+
  1796: "https://www.netflix.com",          // Netflix basic with Ads
  1853: "https://www.tvnz.co.nz",          // TVNZ
};

/**
 * Returns the homepage URL for a streaming provider.
 * Returns undefined if the provider is not in the mapping.
 */
export function getProviderHomepage(providerId: number): string | undefined {
  return PROVIDER_HOMEPAGES[providerId];
}
