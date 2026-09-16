import type { Messages } from "./dictionaries";

/**
 * French, leaning Canadian — the map is North American, so the people most
 * likely to want this are in Québec, Ontario, and Acadie. It vouvoies
 * throughout, which is what a site you have just met is expected to do here.
 * Typed as `Messages`, so adding a key to `en.ts` without translating it here
 * is a compile error.
 */
export const fr: Messages = {
  // Shell
  "app.title": "Hometowns",
  "app.theme.system": "Auto",
  "app.theme.light": "Clair",
  "app.theme.dark": "Sombre",
  "app.theme.switch": "Changer de thème",
  "app.theme.aria": "Thème : {theme}. Changer de thème",
  "app.net.online": "Fonctionne hors ligne",
  "app.net.offline": "Hors ligne",
  "app.net.title": "Comment vos données restent sur votre appareil",
  "app.sourceCode": "Code source",
  "app.language.aria": "Langue",
  "app.toTop": "↑ Haut",
  "app.footer.data": "{count} indicatifs régionaux · données NANPA au {date}",
  "app.footer.privacy": "Rien ne sort de votre navigateur.",
  "app.footer.madeBy": "Fait par",
  "app.footer.coffee": "☕ Payez-moi un café",

  // Shared words
  "common.back": "Retour",
  "common.done": "Terminé",
  "common.close": "Fermer",
  "common.change": "Modifier",
  "common.dismiss": "Ignorer",

  // Search
  "search.label": "Rechercher un indicatif régional",
  "search.placeholder": "Indicatif, ville ou province…",
  "search.noMatches": "Aucun résultat",
  "search.count.one": "{count} indicatif régional",
  "search.count.other": "{count} indicatifs régionaux",
  "search.regionFallback": "Région",
  "search.hint": "Ou cherchez ci-dessus, ou cliquez sur n’importe quelle région de la carte.",

  // Map
  "map.aria": "Carte des indicatifs régionaux d’Amérique du Nord",
  "map.zoomIn": "Zoom avant",
  "map.zoomOut": "Zoom arrière",
  "map.resetView": "Réinitialiser la vue",
  "map.inset.alaska": "Alaska",
  "map.inset.pacific": "Territoires du Pacifique",
  "map.inset.hawaii": "Hawaï",
  "map.inset.caribbean": "Caraïbes et Bermudes",
  "map.tooltip.yourHome": "chez vous",
  "map.numbers.one": "{count} numéro",
  "map.numbers.other": "{count} numéros",

  // Legend
  "legend.aria": "Légende de la carte",
  "legend.compareAria": "Légende de la comparaison",
  "legend.numbers": "Numéros",
  "legend.yourHome": "Chez vous",
  "legend.theirHome": "Chez cette personne",

  // Home area code
  "home.fieldLabel": "Votre indicatif régional",
  "home.fieldHint": "Les trois premiers chiffres de votre numéro de téléphone.",
  "home.unknown":
    "On ne connaît pas encore celui-là, mais on va quand même le marquer comme le vôtre.",
  "home.summary": "Chez vous : {npa}",
  "home.prompt": "Marquez votre propre indicatif régional sur la carte",
  "home.addYours": "Ajouter le vôtre",

  // Welcome, screen one
  "welcome.tagline": "L’histoire de vos contacts",
  "welcome.body":
    "La plupart des gens gardent leur premier numéro de téléphone. L’indicatif régional qu’on obtient à l’adolescence peut nous suivre à travers chaque étape de la vie, et il raconte souvent d’où l’on vient plutôt qu’où l’on habite aujourd’hui. Alors si on projette vos contacts sur une carte, vous obtenez un portrait étonnant de l’endroit où chacun a commencé.",
  "welcome.privacy":
    "Vos contacts ne quittent jamais votre appareil. C’est une page statique, sans aucun serveur derrière. Les numéros sont réduits à un décompte par indicatif régional, dans votre navigateur.",
  "welcome.privacyLink": "Comment le vérifier vous-même",
  "welcome.getStarted": "Commencer",
  "welcome.skip": "Montrez-moi seulement la carte",

  // Welcome, screen two
  "welcome.step1": "Où avez-vous commencé ?",
  "welcome.homeLabel": "Quel est l’indicatif régional de votre numéro ?",
  "welcome.remember": "S’en souvenir sur cet appareil",
  "welcome.step2": "Ajoutez ensuite vos contacts",
  "welcome.continue": "Continuer vers la carte",
  "welcome.skipToMap": "Passer et voir la carte",

  // Import
  "import.title": "Illuminez votre carte",
  "import.titleMore": "Ajouter d’autres contacts",
  "import.lead":
    "Ajoutez les numéros de téléphone de vos contacts. Ils sont lus ici même, dans votre navigateur, et ne sont jamais téléversés.",
  "import.choose": "Choisir parmi mes contacts",
  "import.upload": "Téléverser un fichier",
  "import.uploadAria": "Téléverser une exportation vCard ou CSV",
  "import.paste": "Coller des numéros",
  "import.pasteAria": "Coller des numéros de téléphone",
  "import.pastePlaceholder":
    "Collez n’importe quoi qui contient des numéros de téléphone, par exemple\n(919) 555-0100\n+1 212 555 0199",
  "import.mapThese": "Cartographier ceux-ci",
  "import.error.noNumbers":
    "Aucun numéro de téléphone là-dedans. Essayez un autre fichier ou collez quelques numéros.",
  "import.error.file": "Impossible de lire ce fichier.",
  "import.error.contacts": "Impossible d’ouvrir vos contacts.",
  "import.help.summary": "Comment obtenir mes contacts ?",
  "import.help.iphone.label": "iPhone / iCloud :",
  "import.help.iphone.text": "Contacts → tout sélectionner → Exporter la vCard.",
  "import.help.iphone.link": "Ouvrir Contacts iCloud ↗",
  "import.help.google.label": "Google :",
  "import.help.google.text":
    "Sélectionnez les contacts → menu à trois points → Exporter en CSV Google ou en vCard.",
  "import.help.google.link": "Ouvrir Contacts Google ↗",
  "import.help.outlook.label": "Outlook :",
  "import.help.outlook.text": "Personnes → Gérer → Exporter les contacts.",
  "import.help.outlook.link": "Ouvrir Personnes dans Outlook ↗",
  "import.help.android.label": "Android :",
  "import.help.android.text":
    "Application Contacts → Organiser → Exporter vers un fichier, puis téléversez-le ici.",

  // Examples
  "examples.menu": "Voir un exemple",
  "examples.size": "{numbers} numéros · {codes} indicatifs régionaux · vient du {npa} ({place})",
  "examples.compareTitle": "Ou mettez-en deux côte à côte",
  "examples.pair": "{a} vs {b}",
  "examples.banner": "Vous consultez les données d’exemple de la carte de {name}.",
  "examples.banner.comparing":
    "Vous comparez deux cartes d’exemple : celle de {mine} et celle de {theirs}.",
  "examples.compareMine": "Ou comparez votre carte avec l’une des leurs :",
  "examples.banner.againstMine": "Vous comparez votre carte aux données d’exemple de {name}.",
  "examples.leave": "Quitter l’exemple",
  "examples.resultsTitle": "La carte de {name}",
  "examples.maya.name": "Maya",
  "examples.maya.blurb":
    "A grandi à Raleigh, vit maintenant à Brooklyn. La famille est encore éparpillée dans les Carolines.",
  "examples.devon.name": "Devon",
  "examples.devon.blurb":
    "A grandi à Chicago, vit maintenant dans la région de la baie de San Francisco ; le vieux quartier et les banlieues sont encore dans le téléphone.",
  "examples.jordan.name": "Jordan",
  "examples.jordan.blurb":
    "De Toronto, avec du monde à Montréal, à Halifax et à Vancouver, et des amis partis vers le sud.",

  // Results
  "results.title": "Votre carte",
  "results.forget": "Tout oublier",
  "results.byAreaCode": "Par indicatif régional",
  "results.remember": "Se souvenir de cette carte sur cet appareil",
  "results.stat.numbers": "numéros",
  "results.stat.areaCodes": "indicatifs régionaux",
  "results.stat.regions.one": "état ou province",
  "results.stat.regions.other": "états et provinces",
  "results.stat.countries.one": "pays",
  "results.stat.countries.other": "pays",
  "results.fact.top": "Le plus fréquent : {npa} ({region}), {count}",
  "results.fact.fromHome": "De votre propre indicatif régional ({npa}) : {count}",
  "results.fact.fromHomeShare": ", soit {percent} % de votre carte",
  "results.fact.farthest": "Le plus loin de chez vous : {npa} ({place}), à environ {miles} milles",
  "results.fact.oldest":
    "L’indicatif régional le plus ancien que vous connaissez : {npa} ({place}), en service depuis {year}",
  "results.fact.newest": "L’indicatif régional le plus récent : {npa} ({place}), ajouté en {year}",
  "results.fact.also": "Aussi : {list}",
  "results.fact.alsoItem": "{count} en {country}",
  "results.fact.alsoMore": ", et {count} de plus",
  "results.notMapped": "Hors carte : {parts} ›",
  "results.notMapped.title": "Voir quels numéros n’ont pas pu être placés",
  "results.notMapped.foreign": "{count} hors de l’Amérique du Nord",
  "results.notMapped.unrecognised": "{count} non reconnus",
  "results.notMapped.tollFree": "{count} sans frais",

  // Names under an area code
  "names.unnamed.one": "{count} numéro sans nom",
  "names.unnamed.other": "{count} numéros sans nom",
  "names.withCount": "{name} ({count})",
  "names.andTail": "{names} et {tail}",

  // Area code card
  "card.since": "depuis {year}",
  "card.overlays": "se superpose à {list}",

  // Compare / shared maps
  "compare.mine": "Vous seulement",
  "compare.theirs": "Cette personne seulement",
  "compare.both": "Vous deux",
  "compare.banner":
    "Comparaison avec une carte partagée de {numbers} numéros dans {codes} indicatifs régionaux.",
  "compare.banner.home": "Cette personne vient du {npa}.",
  "compare.stop": "Arrêter la comparaison",
  "compare.fact.both.one": "Vous connaissez tous les deux du monde dans {count} indicatif régional",
  "compare.fact.both.other":
    "Vous connaissez tous les deux du monde dans {count} indicatifs régionaux",
  "compare.fact.bothList": " : {list}",
  "compare.fact.only": "Vous seulement : {mine} · Cette personne seulement : {theirs}",
  "shared.banner":
    "Vous regardez la carte partagée de quelqu’un : {numbers} numéros dans {codes} indicatifs régionaux.",
  "shared.banner.mostly":
    "Vous regardez la carte partagée de quelqu’un : {numbers} numéros dans {codes} indicatifs régionaux, surtout le {npa} ({region}).",
  "shared.banner.home": "Cette personne vient du {npa} ({place}).",
  "shared.addYours": "Ajoutez la vôtre ci-dessous pour comparer.",
  "shared.theirAreaCodes": "Ses indicatifs régionaux",

  // Share
  "share.button": "Partager",
  "share.download": "Télécharger l’image",
  "share.title": "Partagez votre carte",
  "share.explain":
    "Un lien de partage transporte {only}. Aucun nom ni numéro de téléphone complet. Quiconque l’ouvre voit votre carte et peut la comparer avec sa propre liste de contacts.",
  "share.explain.only": "seulement les décomptes que vous avez par indicatif régional",
  "share.includeHome": "Montrer que {npa} est mon indicatif régional d’origine",
  "share.linkHeading": "Lien",
  "share.linkAria": "Lien de partage",
  "share.packed":
    "{codes} indicatifs régionaux compressés en {chars} caractères après le {hash}, que les navigateurs n’envoient jamais à aucun serveur.",
  "share.copy": "Copier le lien",
  "share.homeLeftOut": " Le repère de chez vous est laissé de côté.",
  "share.copied": "Lien copié.",
  "share.copyFailed":
    "Impossible d’accéder au presse-papiers. Sélectionnez le lien ci-dessus et copiez-le.",
  "share.downloaded": "Image téléchargée.",
  "share.imageFailed": "Impossible de créer l’image.",

  // Numbers that could not be placed
  "skipped.title": "Ce qui n’est pas sur la carte",
  "skipped.foreignHeading": "Hors de l’Amérique du Nord ({count})",
  "skipped.foreignNote": "Des numéros valides dont l’indicatif de pays n’est pas +1.",
  "skipped.unrecognisedHeading": "Non reconnus ({count})",
  "skipped.unrecognisedNote":
    "Trop courts, mal formés, ou des numéros +1 dont les trois premiers chiffres ne sont pas un indicatif régional en service.",
  "skipped.country": "{country} ({count})",
  "skipped.more": "…et {count} de plus.",
  "skipped.unknownCountry": "Pays inconnu",
  "skipped.tollFreeHeading": "Sans frais ({count})",
  "skipped.tollFreeNote":
    "Ce sont de vrais numéros en service, mais un indicatif sans frais appartient à une entreprise plutôt qu’à un endroit, alors il n’y a nulle part où le mettre sur la carte.",

  // Privacy
  "privacy.title": "Comment tout ça reste privé",
  "privacy.status.offline": "{offline} et tout fonctionne encore !",
  "privacy.status.offline.strong": "Vous êtes hors ligne",
  "privacy.contacts.heading": "Ce qui arrive à vos contacts",
  "privacy.contacts.read":
    "Les numéros de téléphone sont réduits à leur indicatif régional, puis regroupés. Les noms sont gardés à côté du décompte pour que vous voyiez qui est où.",
  "privacy.contacts.noServer":
    "Il n’y a aucun serveur derrière ce site. C’est un dossier de fichiers statiques servi par GitHub Pages, construit à partir du {link}.",
  "privacy.contacts.noServer.link": "code source public",
  "privacy.contacts.share":
    "Un lien de partage contient seulement un décompte par indicatif régional, et votre propre indicatif si vous choisissez de l’inclure, compressés dans la partie de l’URL qui suit le {hash}.",
  "privacy.contacts.remember":
    "« S’en souvenir sur cet appareil » écrit votre carte uniquement dans le stockage local de votre navigateur : les décomptes, les noms, votre propre indicatif régional et les numéros qui n’ont pas pu être placés.",
  "privacy.check.heading": "Voyez par vous-même : coupez le réseau",
  "privacy.check.lead": "Aucune page web ne peut se mettre hors ligne toute seule, mais vous, oui.",
  "privacy.check.any.label": "N’importe quel appareil :",
  "privacy.check.any.text":
    "activez le mode avion. Si vous avez déjà ouvert cette page, elle est en cache et se charge sans connexion.",
  "privacy.check.chrome.label": "Chrome ou Edge :",
  "privacy.check.chrome.text":
    "appuyez sur {f12} (ou {mac} sur un Mac), ouvrez l’onglet {network} et faites passer le menu de limitation de « Aucune limitation » à {offline}. Ça ne bloque que cet onglet.",
  "privacy.check.firefox.label": "Firefox :",
  "privacy.check.firefox.text":
    "appuyez sur {f12}, ouvrez {network} et réglez le menu de limitation sur {offline}.",
  "privacy.check.safari.label": "Safari :",
  "privacy.check.safari.text":
    "activez le menu Développement dans Réglages → Avancés, puis utilisez Développement → {responsive} ; ou utilisez simplement le mode avion.",
  "privacy.check.safari.responsive": "Activer le mode Responsive Design",
  "privacy.check.network": "Réseau",
  "privacy.check.offlineOption": "Hors ligne",
  "privacy.foot": "Vous pouvez aussi surveiller l’onglet Réseau : il va rester vide !",

  // Tooltips
  "tip.remember":
    "Gardé dans le stockage local de ce navigateur, qui ne quitte jamais votre appareil et n’est synchronisé nulle part. Utilisez « Tout oublier » pour l’effacer.",
};
