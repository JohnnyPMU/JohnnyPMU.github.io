/* Bouton « Retour à l'accueil » – Johnny PMU
   À inclure à la fin de chaque jeu :
   <script src="../retour.js"></script>
   Puis, dans le code du jeu :
     JohnnyPMU.finDePartie();   // à l'écran de fin de partie → affiche le bouton
     JohnnyPMU.debutPartie();   // quand une nouvelle partie commence → cache le bouton */
(function () {
  var css =
    "#jpmu-retour{position:fixed;left:50%;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:9999;" +
    "transform:translate(-50%,20px);opacity:0;pointer-events:none;transition:opacity .25s,transform .25s;" +
    "display:inline-flex;align-items:center;gap:8px;white-space:nowrap;text-decoration:none;" +
    "font:400 22px/1 Bangers,Impact,'Arial Black',sans-serif;letter-spacing:.06em;color:#f3dcc0;" +
    "padding:11px 22px 10px;border:2px solid #1d0402;border-radius:8px;" +
    "background:linear-gradient(180deg,#8a2a1f,#5b1610 60%,#4a110c);" +
    "box-shadow:inset 0 1px 0 rgba(255,220,200,.35),0 0 0 1px #9b4a3a,0 6px 16px rgba(0,0,0,.7);" +
    "text-shadow:0 1px 0 #000;-webkit-tap-highlight-color:transparent;touch-action:manipulation}" +
    "#jpmu-retour.visible{opacity:1;transform:translate(-50%,0);pointer-events:auto}" +
    "#jpmu-retour:active{transform:translate(-50%,2px)}";
  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  var a = document.createElement("a");
  a.id = "jpmu-retour";
  a.href = "../";
  a.textContent = "◀ Retour à l'accueil";
  // empêche le clic sur le bouton de relancer une partie dans le jeu
  ["pointerdown", "mousedown", "touchstart", "keydown"].forEach(function (t) {
    a.addEventListener(t, function (e) { e.stopPropagation(); });
  });
  function monter() { document.body.appendChild(a); }
  if (document.body) monter(); else addEventListener("DOMContentLoaded", monter);

  window.JohnnyPMU = window.JohnnyPMU || {};
  window.JohnnyPMU.finDePartie = function () { a.classList.add("visible"); };
  window.JohnnyPMU.debutPartie = function () { a.classList.remove("visible"); };
})();
