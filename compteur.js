/* Compteur de parties – Johnny PMU
   À inclure à la fin de chaque jeu :
   <script src="../compteur.js" data-jeu="nom-du-dossier"></script>
   Compte +1 partie la première fois que le joueur touche l'écran
   (ou appuie sur une touche) après avoir ouvert le jeu. */
(function () {
  var s = document.currentScript;
  var jeu = s && s.getAttribute("data-jeu");
  if (!jeu) return;
  var fait = false;
  function compter() {
    if (fait) return;
    fait = true;
    try {
      fetch("https://abacus.jasoncameron.dev/hit/johnnypmu/parties-" + jeu, { keepalive: true }).catch(function () {});
    } catch (e) {}
  }
  addEventListener("pointerdown", compter, true);
  addEventListener("keydown", compter, true);
})();
