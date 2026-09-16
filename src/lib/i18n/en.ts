/**
 * Every user-facing string in the app, in English. This is the source of
 * truth: other locales are typed against it, so a missing or stale key is a
 * compile error rather than a blank label at runtime.
 *
 * Conventions:
 *  - Keys are flat and dotted, grouped by the screen they appear on.
 *  - `{name}` placeholders are filled by `t`/`tx`. Order is up to the locale.
 *  - A pair of `foo.one` / `foo.other` keys is a plural, selected by `tn`.
 *  - Nothing here is a proper noun from the data (city, state, country); those
 *    come from NANPA and Intl.DisplayNames.
 */
export const en = {
  // Shell
  "app.title": "Hometowns",
  "app.theme.system": "Auto",
  "app.theme.light": "Light",
  "app.theme.dark": "Dark",
  "app.theme.switch": "Switch theme",
  "app.theme.aria": "Theme: {theme}. Switch theme",
  "app.net.online": "Works offline",
  "app.net.offline": "Offline",
  "app.net.title": "How your data stays locally on your device",
  "app.sourceCode": "Source code",
  "app.language.aria": "Language",
  "app.toTop": "↑ Top",
  "app.footer.data": "{count} area codes · NANPA data as of {date}",
  "app.footer.privacy": "Nothing leaves your browser.",
  "app.footer.madeBy": "Made by",
  "app.footer.coffee": "☕ Buy me a coffee",

  // Shared words
  "common.back": "Back",
  "common.done": "Done",
  "common.close": "Close",
  "common.change": "Change",
  "common.dismiss": "Dismiss",

  // Search
  "search.label": "Search area codes",
  "search.placeholder": "Area code, city, or state…",
  "search.noMatches": "No matches",
  "search.count.one": "{count} area code",
  "search.count.other": "{count} area codes",
  "search.regionFallback": "Region",
  "search.hint": "Or search above, or click any region on the map.",

  // Map
  "map.aria": "Map of North American area codes",
  "map.zoomIn": "Zoom in",
  "map.zoomOut": "Zoom out",
  "map.resetView": "Reset view",
  "map.inset.alaska": "Alaska",
  "map.inset.pacific": "Pacific territories",
  "map.inset.hawaii": "Hawaii",
  "map.inset.caribbean": "Caribbean & Bermuda",
  "map.tooltip.yourHome": "your home",
  "map.numbers.one": "{count} number",
  "map.numbers.other": "{count} numbers",

  // Legend
  "legend.aria": "Map legend",
  "legend.compareAria": "Compare legend",
  "legend.numbers": "Numbers",
  "legend.yourHome": "Your home",
  "legend.theirHome": "Their home",

  // Home area code
  "home.fieldLabel": "Your area code",
  "home.fieldHint": "The first three digits of your phone number.",
  "home.unknown": "We don’t know that one yet, but we’ll still mark it as yours.",
  "home.summary": "Home: {npa}",
  "home.prompt": "Mark your own area code on the map",
  "home.addYours": "Add yours",

  // Welcome, screen one
  "welcome.tagline": "The story of your contacts",
  "welcome.lead": "Their area code tells a story",
  "welcome.body":
    "Most people keep their first phone number. The area code you get as a teenager can follow you through every life transition, usually telling the story of where you are from, not where you live now. So if we can project your contacts on a map you can get an interesting picture of where folks may have started out.",
  "welcome.privacy":
    "Your contacts never leave your device. This is a static page with no server behind it. Numbers are reduced to a count per area code in your browser.",
  "welcome.privacyLink": "How to check that yourself",
  "welcome.getStarted": "Get started",
  "welcome.skip": "Just show me the map",

  // Welcome, screen two
  "welcome.step1": "Where did you get started?",
  "welcome.homeLabel": "What’s your phone number's area code?",
  "welcome.remember": "Remember this on this device",
  "welcome.step2": "Then add your contacts",
  "welcome.continue": "Continue to the map",
  "welcome.skipToMap": "Skip and view the map",

  // Import
  "import.title": "Light up your map",
  "import.titleMore": "Add more contacts",
  "import.lead":
    "Add the phone numbers in your contacts. They are read right here in your browser and never uploaded.",
  "import.choose": "Choose from contacts",
  "import.upload": "Upload a file",
  "import.uploadAria": "Upload a vCard or CSV export",
  "import.paste": "Paste numbers",
  "import.pasteAria": "Paste phone numbers",
  "import.pastePlaceholder":
    "Paste anything with phone numbers in it, e.g.\n(919) 555-0100\n+1 212 555 0199",
  "import.mapThese": "Map these",
  "import.error.noNumbers":
    "No phone numbers found in that. Try a different file or paste some numbers.",
  "import.error.file": "Could not read that file.",
  "import.error.contacts": "Could not open your contacts.",
  "import.help.summary": "How do I get my contacts?",
  "import.help.iphone.label": "iPhone / iCloud:",
  "import.help.iphone.text": "Contacts → select all → Export vCard.",
  "import.help.iphone.link": "Open iCloud Contacts ↗",
  "import.help.google.label": "Google:",
  "import.help.google.text": "Select contacts → three-dot menu -> Export Google CSV or vCard.",
  "import.help.google.link": "Open Google Contacts ↗",
  "import.help.outlook.label": "Outlook:",
  "import.help.outlook.text": "People → Manage → Export contacts.",
  "import.help.outlook.link": "Open Outlook People ↗",
  "import.help.android.label": "Android:",
  "import.help.android.text": "Contacts app → Organize → Export to file, then upload it here.",

  // Results
  "results.title": "Your map",
  "results.forget": "Forget everything",
  "results.byAreaCode": "By area code",
  "results.remember": "Remember this map on this device",
  "results.stat.numbers": "numbers",
  "results.stat.areaCodes": "area codes",
  "results.stat.regions.one": "state or province",
  "results.stat.regions.other": "states & provinces",
  "results.stat.countries.one": "country",
  "results.stat.countries.other": "countries",
  "results.fact.top": "Most common: {npa} ({region}), {count}",
  "results.fact.fromHome": "From your home area code ({npa}): {count}",
  "results.fact.fromHomeShare": ", {percent}% of your map",
  "results.fact.farthest": "Farthest from home: {npa} ({place}), about {miles} miles away",
  "results.fact.oldest": "Oldest area code you know: {npa} ({place}), in service since {year}",
  "results.fact.newest": "Newest area code: {npa} ({place}), added in {year}",
  "results.fact.also": "Also: {list}",
  "results.fact.alsoItem": "{count} in {country}",
  "results.fact.alsoMore": ", and {count} more",
  "results.notMapped": "Not on the map: {parts} ›",
  "results.notMapped.title": "See which numbers could not be placed",
  "results.notMapped.foreign": "{count} outside North America",
  "results.notMapped.unrecognised": "{count} unrecognised",
  "results.notMapped.tollFree": "{count} toll-free",
  "results.shareCaption": "{numbers} numbers across {codes} area codes",

  // Names under an area code
  "names.unnamed.one": "{count} unnamed number",
  "names.unnamed.other": "{count} unnamed numbers",
  "names.withCount": "{name} ({count})",
  "names.andTail": "{names}, and {tail}",

  // Area code card
  "card.since": "since {year}",
  "card.overlays": "overlays {list}",

  // Compare / shared maps
  "compare.mine": "Only you",
  "compare.theirs": "Only them",
  "compare.both": "Both of you",
  "compare.banner": "Comparing with a shared map of {numbers} numbers in {codes} area codes.",
  "compare.banner.home": "They’re from {npa}.",
  "compare.stop": "Stop comparing",
  "compare.fact.both.one": "You both know people in {count} area code",
  "compare.fact.both.other": "You both know people in {count} area codes",
  "compare.fact.bothList": ": {list}",
  "compare.fact.only": "Only you: {mine} · Only them: {theirs}",
  "shared.banner": "You’re viewing someone’s shared map: {numbers} numbers in {codes} area codes.",
  "shared.banner.mostly":
    "You’re viewing someone’s shared map: {numbers} numbers in {codes} area codes, mostly {npa} ({region}).",
  "shared.banner.home": "They’re from {npa} ({place}).",
  "shared.addYours": "Add yours below to compare.",
  "shared.theirAreaCodes": "Their area codes",

  // Share
  "share.button": "Share",
  "share.download": "Download image",
  "share.title": "Share your map",
  "share.explain":
    "A share link carries {only}. No names or full phone numbers. Anyone who opens it sees your map and can compare it with their own contact list.",
  "share.explain.only": "only the counts you have per area code",
  "share.includeHome": "Show that {npa} is my home area code",
  "share.linkHeading": "Link",
  "share.linkAria": "Share link",
  "share.packed":
    "{codes} area codes packed into {chars} characters after the {hash}, which browsers never send to any server.",
  "share.copy": "Copy link",
  "share.imageNote":
    "The image shows the whole map with your stats and legend on it, rendered in your browser.",
  "share.homeLeftOut": " Your home marker is left out.",
  "share.copied": "Link copied.",
  "share.copyFailed": "Could not access the clipboard. Select the link above and copy it.",
  "share.downloaded": "Image downloaded.",
  "share.imageFailed": "Could not create the image.",

  // Numbers that could not be placed
  "skipped.title": "What's not on the map",
  "skipped.intro":
    "They are listed so you can spot a typo or a number worth fixing in your contacts.",
  "skipped.foreignHeading": "Outside North America ({count})",
  "skipped.foreignNote": "Valid numbers whose country code is not +1.",
  "skipped.unrecognisedHeading": "Unrecognised ({count})",
  "skipped.unrecognisedNote":
    "Too short, malformed, or a +1 number whose first three digits are not an area code in service.",
  "skipped.country": "{country} ({count})",
  "skipped.more": "…and {count} more.",
  "skipped.unknownCountry": "Unknown country",
  "skipped.tollFreeHeading": "Toll-free ({count})",
  "skipped.tollFreeNote":
    "Real numbers in service, but toll-free codes belong to a company rather than a place, so there is nowhere to put them on the map.",

  // Privacy
  "privacy.title": "How this stays private",
  "privacy.status.online": "You are online right now.",
  "privacy.status.offline": "{offline} and everything still works!",
  "privacy.status.offline.strong": "You are offline",
  "privacy.contacts.heading": "What happens to your contacts",
  "privacy.contacts.read":
    "Phone numbers are reduced to their area code and aggregated. Names are kept alongside the count so you can see who is where.",
  "privacy.contacts.noServer":
    "There is no server behind this site. It is a folder of static files served by GitHub Pages, built from {link}.",
  "privacy.contacts.noServer.link": "public source code",
  "privacy.contacts.share":
    "A share link contains only a count per area code, and your own area code if you choose to include it, packed into the part of the URL after the {hash}.",
  "privacy.contacts.remember":
    "“Remember on this device” writes your map to your browser’s local storage only: the counts, the names, your own area code, and the numbers that could not be mapped.",
  "privacy.check.heading": "See for yourself: cut the network",
  "privacy.check.lead": "No web page can switch itself offline, but you can.",
  "privacy.check.any.label": "Any device:",
  "privacy.check.any.text":
    "turn on airplane mode. If you have opened this page before, it is cached and loads without a connection.",
  "privacy.check.chrome.label": "Chrome or Edge:",
  "privacy.check.chrome.text":
    "press {f12} (or {mac} on a Mac), open the {network} tab, and change the throttling dropdown from “No throttling” to {offline}. That blocks only this tab.",
  "privacy.check.firefox.label": "Firefox:",
  "privacy.check.firefox.text":
    "press {f12}, open {network}, and set the throttling dropdown to {offline}.",
  "privacy.check.safari.label": "Safari:",
  "privacy.check.safari.text":
    "enable the Develop menu in Settings → Advanced, then use Develop → {responsive}; or just use airplane mode.",
  "privacy.check.safari.responsive": "Enter Responsive Design Mode",
  "privacy.check.network": "Network",
  "privacy.check.offlineOption": "Offline",
  "privacy.foot": "You can also watch the Network tab; it will stay empty!",

  // Tooltips
  "tip.remember":
    "Saved in this browser’s local storage, which never leaves your device and is not synced anywhere. Use “Forget everything” to erase it.",
} as const;
