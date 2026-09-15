import type { Messages } from "./dictionaries";

/**
 * Spanish (neutral / Latin American). Typed as `Messages`, so adding a key to
 * `en.ts` without translating it here is a compile error.
 */
export const es: Messages = {
  // Shell
  "app.title": "Hometowns",
  "app.theme.system": "Auto",
  "app.theme.light": "Claro",
  "app.theme.dark": "Oscuro",
  "app.theme.switch": "Cambiar tema",
  "app.theme.aria": "Tema: {theme}. Cambiar tema",
  "app.net.online": "Funciona sin conexión",
  "app.net.offline": "Sin conexión",
  "app.net.title": "Cómo tus datos se quedan localmente en tu dispositivo",
  "app.sourceCode": "Código fuente",
  "app.language.aria": "Idioma",
  "app.toTop": "↑ Arriba",
  "app.footer.data": "{count} códigos de área · datos de NANPA al {date}",
  "app.footer.privacy": "Nada sale de tu navegador.",
  "app.footer.madeBy": "Hecho por",
  "app.footer.coffee": "☕ Invítame un café",

  // Shared words
  "common.back": "Atrás",
  "common.done": "Listo",
  "common.close": "Cerrar",
  "common.change": "Cambiar",
  "common.dismiss": "Descartar",

  // Search
  "search.label": "Buscar códigos de área",
  "search.placeholder": "Código de área, ciudad o estado…",
  "search.noMatches": "Sin resultados",
  "search.count.one": "{count} código de área",
  "search.count.other": "{count} códigos de área",
  "search.regionFallback": "Región",
  "search.hint": "O busca arriba, o haz clic en cualquier región del mapa.",

  // Map
  "map.aria": "Mapa de los códigos de área de Norteamérica",
  "map.zoomIn": "Acercar",
  "map.zoomOut": "Alejar",
  "map.resetView": "Restablecer la vista",
  "map.inset.alaska": "Alaska",
  "map.inset.pacific": "Territorios del Pacífico",
  "map.inset.hawaii": "Hawái",
  "map.inset.caribbean": "Caribe y Bermudas",
  "map.tooltip.yourHome": "tu casa",
  "map.numbers.one": "{count} número",
  "map.numbers.other": "{count} números",

  // Legend
  "legend.aria": "Leyenda del mapa",
  "legend.compareAria": "Leyenda de la comparación",
  "legend.numbers": "Números",
  "legend.yourHome": "Tu casa",
  "legend.theirHome": "Su casa",

  // Home area code
  "home.fieldLabel": "Tu código de área",
  "home.fieldHint": "Los tres primeros dígitos de tu número de teléfono.",
  "home.unknown": "Todavía no conocemos ese, pero igual lo marcaremos como tuyo.",
  "home.summary": "Casa: {npa}",
  "home.prompt": "Marca tu propio código de área en el mapa",
  "home.addYours": "Agregar el tuyo",

  // Welcome, screen one
  "welcome.tagline": "La historia de tus contactos",
  "welcome.lead": "Su código de área cuenta una historia",
  "welcome.body":
    "Casi nadie cambia su primer número de teléfono. El código de área que te toca de adolescente puede seguirte por cada etapa de la vida, y suele contar la historia de dónde eres, no de dónde vives ahora. Así que si proyectamos tus contactos en un mapa, puedes ver un retrato curioso de dónde empezó cada quien.",
  "welcome.privacy":
    "Tus contactos nunca salen de tu dispositivo. Esta es una página estática sin ningún servidor detrás. Los números se reducen a una cuenta por código de área dentro de tu navegador.",
  "welcome.privacyLink": "Cómo comprobarlo tú mismo",
  "welcome.getStarted": "Empezar",
  "welcome.skip": "Solo muéstrame el mapa",

  // Welcome, screen two
  "welcome.step1": "¿Dónde empezaste tú?",
  "welcome.homeLabel": "¿Cuál es el código de área de tu número?",
  "welcome.remember": "Recordar esto en este dispositivo",
  "welcome.step2": "Luego agrega tus contactos",
  "welcome.continue": "Continuar al mapa",
  "welcome.skipToMap": "Omitir y ver el mapa",

  // Import
  "import.title": "Ilumina tu mapa",
  "import.titleMore": "Agregar más contactos",
  "import.lead":
    "Agrega los números de teléfono de tus contactos. Se leen aquí mismo, en tu navegador, y nunca se suben a ningún lado.",
  "import.choose": "Elegir de mis contactos",
  "import.upload": "Subir un archivo",
  "import.uploadAria": "Subir una exportación en vCard o CSV",
  "import.paste": "Pegar números",
  "import.pasteAria": "Pegar números de teléfono",
  "import.pastePlaceholder":
    "Pega cualquier cosa que tenga números de teléfono, por ejemplo\n(919) 555-0100\n+1 212 555 0199",
  "import.mapThese": "Mapear estos",
  "import.error.noNumbers":
    "No encontramos números de teléfono ahí. Prueba con otro archivo o pega algunos números.",
  "import.error.file": "No se pudo leer ese archivo.",
  "import.error.contacts": "No se pudieron abrir tus contactos.",
  "import.help.summary": "¿Cómo obtengo mis contactos?",
  "import.help.iphone.label": "iPhone / iCloud:",
  "import.help.iphone.text": "Contactos → seleccionar todo → Exportar vCard.",
  "import.help.iphone.link": "Abrir Contactos de iCloud ↗",
  "import.help.google.label": "Google:",
  "import.help.google.text":
    "Selecciona los contactos → menú de tres puntos → Exportar CSV de Google o vCard.",
  "import.help.google.link": "Abrir Contactos de Google ↗",
  "import.help.outlook.label": "Outlook:",
  "import.help.outlook.text": "Personas → Administrar → Exportar contactos.",
  "import.help.outlook.link": "Abrir Personas de Outlook ↗",
  "import.help.android.label": "Android:",
  "import.help.android.text":
    "App de Contactos → Corregir y administrar → Exportar a archivo (.vcf), y luego súbelo aquí.",

  // Results
  "results.title": "Tu mapa",
  "results.forget": "Olvidar todo",
  "results.byAreaCode": "Por código de área",
  "results.remember": "Recordar este mapa en este dispositivo",
  "results.stat.numbers": "números",
  "results.stat.areaCodes": "códigos de área",
  "results.stat.regions.one": "estado o provincia",
  "results.stat.regions.other": "estados y provincias",
  "results.stat.countries.one": "país",
  "results.stat.countries.other": "países",
  "results.fact.top": "El más común: {npa} ({region}), {count}",
  "results.fact.fromHome": "De tu propio código de área ({npa}): {count}",
  "results.fact.fromHomeShare": ", el {percent}% de tu mapa",
  "results.fact.farthest": "El más lejano de tu casa: {npa} ({place}), a unas {miles} millas",
  "results.fact.oldest":
    "El código de área más antiguo que conoces: {npa} ({place}), en servicio desde {year}",
  "results.fact.newest": "El código de área más nuevo: {npa} ({place}), agregado en {year}",
  "results.fact.also": "Además: {list}",
  "results.fact.alsoItem": "{count} en {country}",
  "results.fact.alsoMore": ", y {count} más",
  "results.notMapped": "Fuera del mapa: {parts} ›",
  "results.notMapped.title": "Ver qué números no se pudieron ubicar",
  "results.notMapped.foreign": "{count} fuera de Norteamérica",
  "results.notMapped.unrecognised": "{count} sin reconocer",
  "results.shareCaption": "{numbers} números en {codes} códigos de área",

  // Names under an area code
  "names.unnamed.one": "{count} número sin nombre",
  "names.unnamed.other": "{count} números sin nombre",
  "names.withCount": "{name} ({count})",
  "names.andTail": "{names} y {tail}",

  // Area code card
  "card.since": "desde {year}",
  "card.overlays": "se superpone con {list}",

  // Compare / shared maps
  "compare.mine": "Solo tú",
  "compare.theirs": "Solo esa persona",
  "compare.both": "Los dos",
  "compare.banner":
    "Comparando con un mapa compartido de {numbers} números en {codes} códigos de área.",
  "compare.banner.home": "Esa persona es de {npa}.",
  "compare.stop": "Dejar de comparar",
  "compare.fact.both.one": "Los dos conocen gente en {count} código de área",
  "compare.fact.both.other": "Los dos conocen gente en {count} códigos de área",
  "compare.fact.bothList": ": {list}",
  "compare.fact.only": "Solo tú: {mine} · Solo esa persona: {theirs}",
  "shared.banner":
    "Estás viendo el mapa compartido de alguien: {numbers} números en {codes} códigos de área.",
  "shared.banner.mostly":
    "Estás viendo el mapa compartido de alguien: {numbers} números en {codes} códigos de área, sobre todo {npa} ({region}).",
  "shared.banner.home": "Esa persona es de {npa} ({place}).",
  "shared.addYours": "Agrega el tuyo abajo para comparar.",
  "shared.theirAreaCodes": "Sus códigos de área",

  // Share
  "share.button": "Compartir",
  "share.download": "Descargar imagen",
  "share.title": "Comparte tu mapa",
  "share.explain":
    "Un enlace para compartir lleva {only}. Sin nombres, sin números de teléfono, nada sobre quiénes son tus contactos. Quien lo abra verá tu mapa y podrá compararlo con el suyo.",
  "share.explain.only": "solo cuántos números tienes por código de área",
  "share.includeHome": "Mostrar que {npa} es mi código de área de casa",
  "share.linkHeading": "Enlace",
  "share.linkAria": "Enlace para compartir",
  "share.packed":
    "{codes} códigos de área comprimidos en {chars} caracteres después del {hash}, que los navegadores nunca envían a ningún servidor.",
  "share.copy": "Copiar enlace",
  "share.imageNote":
    "La imagen muestra el mapa completo con tus estadísticas y la leyenda, generada en tu navegador.",
  "share.homeLeftOut": " La marca de tu casa queda fuera.",
  "share.copied": "Enlace copiado.",
  "share.copyFailed":
    "No se pudo acceder al portapapeles. Selecciona el enlace de arriba y cópialo.",
  "share.downloaded": "Imagen descargada.",
  "share.imageFailed": "No se pudo crear la imagen.",

  // Numbers that could not be placed
  "skipped.title": "Números fuera del mapa",
  "skipped.intro":
    "Estos se quedan en esta pestaña como todo lo demás. Los listamos para que puedas detectar un error de tipeo o un número que valga la pena corregir en tus contactos.",
  "skipped.foreignHeading": "Fuera de Norteamérica ({count})",
  "skipped.foreignNote":
    "Números válidos cuyo código de país no es +1, así que no tienen código de área norteamericano.",
  "skipped.unrecognisedHeading": "Sin reconocer ({count})",
  "skipped.unrecognisedNote":
    "Demasiado cortos, mal formados, o números +1 cuyos primeros tres dígitos no son un código de área en servicio.",
  "skipped.country": "{country} ({count})",
  "skipped.more": "…y {count} más.",
  "skipped.unknownCountry": "País desconocido",

  // Privacy
  "privacy.title": "Cómo se mantiene privado",
  "privacy.status.online":
    "Ahora mismo estás conectado. Aun así, esta página no ha hecho ninguna petición con tus datos, ni puede hacerla: sigue leyendo.",
  "privacy.status.offline":
    "{offline} y todo sigue funcionando, porque nada de esto necesita la red.",
  "privacy.status.offline.strong": "Estás sin conexión",
  "privacy.contacts.heading": "Qué pasa con tus contactos",
  "privacy.contacts.read":
    "El archivo o el texto que importas lo lee JavaScript que se ejecuta en esta pestaña. Los números de teléfono se reducen a su código de área y se cuentan. Los nombres se guardan junto a la cuenta para que veas quién está dónde.",
  "privacy.contacts.noServer":
    "No hay ningún servidor detrás de este sitio. Es una carpeta de archivos estáticos servidos por GitHub Pages y construidos a partir del {link}.",
  "privacy.contacts.noServer.link": "código fuente público",
  "privacy.contacts.csp":
    "La página incluye una Content-Security-Policy que le indica a tu navegador que rechace cualquier conexión con otro origen. Ni siquiera un error de programación podría subir tus datos.",
  "privacy.contacts.share":
    "Un enlace para compartir contiene solo una cuenta por código de área, y tu propio código de área si decides incluirlo, comprimidos en la parte de la URL después del {hash}, que los navegadores nunca envían a los servidores.",
  "privacy.contacts.remember":
    "«Recordar en este dispositivo» guarda tus cuentas por código de área y tu propio código de área únicamente en el almacenamiento local de tu navegador.",
  "privacy.check.heading": "Compruébalo tú mismo: corta la red",
  "privacy.check.lead":
    "Ninguna página web puede desconectarse sola, pero tú sí puedes. Haz una de estas cosas y luego importa tus contactos. Todo sigue funcionando.",
  "privacy.check.any.label": "Cualquier dispositivo:",
  "privacy.check.any.text":
    "activa el modo avión. Si ya habías abierto esta página antes, está en caché y carga sin conexión.",
  "privacy.check.chrome.label": "Chrome o Edge:",
  "privacy.check.chrome.text":
    "presiona {f12} (o {mac} en una Mac), abre la pestaña {network} y cambia el menú de limitación de «Sin limitación» a {offline}. Eso bloquea solo esta pestaña.",
  "privacy.check.firefox.label": "Firefox:",
  "privacy.check.firefox.text":
    "presiona {f12}, abre {network} y pon el menú de limitación en {offline}.",
  "privacy.check.safari.label": "Safari:",
  "privacy.check.safari.text":
    "activa el menú Desarrollo en Configuración → Avanzado y luego usa Desarrollo → {responsive}; o simplemente usa el modo avión.",
  "privacy.check.safari.responsive": "Activar el modo de diseño adaptable",
  "privacy.check.network": "Red",
  "privacy.check.offlineOption": "Sin conexión",
  "privacy.foot": "También puedes mirar la pestaña Red mientras importas: se queda vacía.",

  // Tooltips
  "tip.remember":
    "Se guarda en el almacenamiento local de este navegador, que nunca sale de tu dispositivo ni se sincroniza en ningún lado. Usa «Olvidar todo» para borrarlo.",
};
