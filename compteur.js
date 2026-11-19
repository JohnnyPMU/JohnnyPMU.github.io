/* ============================================================
   COMPTEURS – Johnny PMU (fichier unique pour tout le site)

   Dans un jeu :  <script src="../compteur.js" data-jeu="nom-du-dossier"></script>
                  → +1 partie au premier appui du joueur.
   Sur l'accueil : <script src="compteur.js"></script>
                  → JohnnyCompteurs.lire(cle) / JohnnyCompteurs.incrementer(cle)

   Service utilisé :
   - si FIREBASE_URL est rempli → Firebase Realtime Database (fiable)
   - sinon → Abacus (gratuit, sans compte, mais parfois lent ou en panne)
   ============================================================ */
(function () {
  /* Adresse de la base Firebase, ex. "https://johnnypmu-default-rtdb.europe-west1.firebasedatabase.app"
     Laisser vide pour rester sur Abacus. */
  var FIREBASE_URL = "https://johnnypmu-ea422-default-rtdb.europe-west1.firebasedatabase.app";

  var ABACUS = "https://abacus.jasoncameron.dev";

  function enNombre(d) {
    if (typeof d === "number") return d;
    if (d && typeof d.value === "number") return d.value;
    return null;
  }
  /* une requête, avec délai max de 12 s, puis jusqu'à 2 nouvelles tentatives (3 s, 6 s) */
  function demander(url, options, essais, attente) {
    essais = essais == null ? 2 : essais; attente = attente || 3000;
    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var minuterie = ctrl ? setTimeout(function () { ctrl.abort(); }, 12000) : null;
    var opts = options || {}; if (ctrl) opts.signal = ctrl.signal;
    return fetch(url, opts)
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(enNombre)
      .catch(function () { return null; })
      .then(function (v) {
        if (minuterie) clearTimeout(minuterie);
        if (v != null || essais <= 0) return v;
        return new Promise(function (res) { setTimeout(res, attente); })
          .then(function () { return demander(url, options, essais - 1, attente * 2); });
      });
  }

  function lire(cle) {
    if (FIREBASE_URL) return demander(FIREBASE_URL + "/compteurs/" + cle + ".json").then(function (v) { return v == null ? 0 : v; });
    return demander(ABACUS + "/get/johnnypmu/" + cle);
  }
  function incrementer(cle) {
    if (FIREBASE_URL) return demander(FIREBASE_URL + "/compteurs/" + cle + ".json",
      { method: "PUT", body: JSON.stringify({ ".sv": { "increment": 1 } }), keepalive: true });
    return demander(ABACUS + "/hit/johnnypmu/" + cle, { keepalive: true });
  }

  window.JohnnyCompteurs = { lire: lire, incrementer: incrementer, service: FIREBASE_URL ? "firebase" : "abacus" };

  /* --- dans un jeu : +1 partie au premier appui --- */
  var s = document.currentScript;
  var jeu = s && s.getAttribute("data-jeu");
  if (!jeu) return;
  var fait = false;
  function compter() {
    if (fait) return;
    fait = true;
    incrementer("parties-" + jeu);
  }
  addEventListener("pointerdown", compter, true);
  addEventListener("keydown", compter, true);
})();
