/* ============================================================
   TOP 10 – Johnny PMU (fichier commun à tous les jeux)
   Nécessite compteur.js chargé AVANT (il donne l'adresse Firebase).

   Dans un jeu :
     <script src="../compteur.js" data-jeu="mon-jeu"></script>
     <script src="../classement.js"></script>
     … à la fin d'une partie :
     JohnnyClassement.finDePartie("mon-jeu", score);        // style BD du jeu
   Sur l'accueil :
     JohnnyClassement.ouvrir("mon-jeu", { theme: "site", titre: "Le Ricard Parfait" });

   Données Firebase : /scores/<jeu>/<id> = { pseudo, score, t }
   ============================================================ */
(function () {
  var DB = (window.JohnnyCompteurs && window.JohnnyCompteurs.firebase) ||
    "https://johnnypmu-ea422-default-rtdb.europe-west1.firebasedatabase.app";
  var CLE_PSEUDO = "jpmu.pseudo";
  /* mots refusés dans les pseudos (insultes racistes, haineuses…) */
  var INTERDITS = ["nazi", "hitler", "negr", "negro", "nègre", "bougnoul", "youpin", "pédé", "pede", "tapette", "enculé", "encule", "salope", "pute", "connasse", "fdp", "ntm", "kkk", "sieg"];

  /* ---------- styles ---------- */
  var css =
    ".jc-fond{position:fixed;inset:0;z-index:10001;display:grid;place-items:center;padding:16px;background:rgba(10,5,2,.72);" +
    "-webkit-tap-highlight-color:transparent;animation:jcApparait .2s ease}" +
    "@keyframes jcApparait{from{opacity:0}to{opacity:1}}" +
    ".jc-boite{position:relative;width:min(100%,400px);max-height:calc(100vh - 32px);overflow:auto;text-align:center;padding:18px 16px 16px;animation:jcPop .25s cubic-bezier(.2,1.4,.5,1)}" +
    "@keyframes jcPop{from{transform:scale(.85)}to{transform:scale(1)}}" +
    ".jc-boite h2{margin:0 0 4px;line-height:1}" +
    ".jc-sous{margin:0 0 12px}" +
    ".jc-liste{list-style:none;margin:10px 0 14px;padding:0;text-align:left}" +
    ".jc-liste li{display:flex;align-items:center;gap:10px;padding:6px 10px;margin-bottom:4px;border-radius:6px}" +
    ".jc-rang{flex:0 0 2.2em;text-align:center}" +
    ".jc-nom{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    ".jc-pts{flex:0 0 auto}" +
    ".jc-vide{padding:14px;opacity:.8}" +
    ".jc-form{display:flex;gap:8px;margin:6px 0 4px}" +
    ".jc-form input{flex:1;min-width:0;font-size:18px;padding:10px 12px;border-radius:8px;outline:none}" +
    ".jc-btn{cursor:pointer;border-radius:8px;padding:10px 14px;white-space:nowrap}" +
    ".jc-btn:active{transform:translateY(2px)}" +
    ".jc-err{min-height:1.2em;margin:4px 0 0;font-size:14px}" +
    ".jc-fermer{width:100%;margin-top:4px}" +
    /* thème « jeu » : BD, comme le Ricard Parfait */
    ".jc-jeu .jc-boite{font-family:Bangers,Impact,sans-serif;letter-spacing:.03em;color:#1b0f0c;background:#fff8e6;border:5px solid #1b0f0c;border-radius:20px;box-shadow:0 8px 0 #1b0f0c}" +
    ".jc-jeu h2{font-size:44px;color:#ff4b2b;text-shadow:3px 3px 0 #1e4fd8;-webkit-text-stroke:1.5px #1b0f0c}" +
    ".jc-jeu .jc-sous{font-size:20px}" +
    ".jc-jeu .jc-liste li{font-size:22px;background:rgba(27,15,12,.06)}" +
    ".jc-jeu .jc-liste li.jc-moi{background:#ffd23f;box-shadow:inset 0 0 0 3px #1b0f0c}" +
    ".jc-jeu .jc-rang{color:#d62828}" +
    ".jc-jeu .jc-form input{font-family:Bangers,Impact,sans-serif;letter-spacing:.04em;border:3px solid #1b0f0c;background:#fff;color:#1b0f0c}" +
    ".jc-jeu .jc-btn{font-family:Bangers,Impact,sans-serif;font-size:22px;letter-spacing:.04em;color:#fff;border:3px solid #1b0f0c;box-shadow:0 4px 0 #1b0f0c;background:#35d65a}" +
    ".jc-jeu .jc-fermer{background:#ff4b2b}" +
    ".jc-jeu .jc-err{color:#d62828}" +
    /* thème « site » : acier, cuivre, or */
    ".jc-site .jc-boite{font-family:Oswald,'Arial Narrow',sans-serif;color:#efe1c8;border:3px solid transparent;border-radius:8px;" +
    "background:linear-gradient(180deg,#2e2e2e,#1b1b1b) padding-box,linear-gradient(160deg,#e0a066,#9c4a1c 30%,#5a260d 55%,#b8662c 80%,#6e3415) border-box;" +
    "box-shadow:inset 0 0 0 1px #2a1208,0 0 30px rgba(196,90,30,.25),0 12px 30px rgba(0,0,0,.7)}" +
    ".jc-site h2{font-family:Anton,Oswald,sans-serif;font-weight:400;font-size:40px;letter-spacing:.02em;text-transform:uppercase;" +
    "background:linear-gradient(180deg,#fff4c4,#f3cf6b 30%,#b8862b 52%,#f6d77e 68%,#9a6a1c);-webkit-background-clip:text;background-clip:text;color:transparent}" +
    ".jc-site .jc-sous{font-size:15px;text-transform:uppercase;letter-spacing:.08em;color:#c9bda9}" +
    ".jc-site .jc-liste li{font-size:17px;font-weight:500;background:rgba(255,255,255,.04);border:1px solid #000}" +
    ".jc-site .jc-liste li.jc-moi{background:rgba(242,177,52,.18);border-color:#d9a441}" +
    ".jc-site .jc-rang{font-weight:700;color:#d9a441}" +
    ".jc-site .jc-pts{font-weight:700}" +
    ".jc-site .jc-form input{font-family:Oswald,sans-serif;border:1px solid #000;background:#111;color:#efe1c8}" +
    ".jc-site .jc-btn{font-family:Oswald,sans-serif;font-weight:600;font-size:16px;text-transform:uppercase;letter-spacing:.06em;color:#f3dcc0;border:1px solid #1d0402;" +
    "background:linear-gradient(180deg,#8a2a1f,#4f130d);box-shadow:inset 0 1px 0 rgba(255,220,200,.3)}" +
    ".jc-site .jc-err{color:#ff8a7a}";
  var st = document.createElement("style");
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  /* ---------- données ---------- */
  function top10(jeu) {
    return fetch(DB + "/scores/" + jeu + ".json?orderBy=%22score%22&limitToLast=10")
      .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (d) {
        var l = [];
        for (var id in (d || {})) l.push({ id: id, pseudo: d[id].pseudo, score: d[id].score, t: d[id].t || 0 });
        l.sort(function (a, b) { return b.score - a.score || a.t - b.t; });
        return l.slice(0, 10);
      });
  }
  function enregistrer(jeu, pseudo, score) {
    return fetch(DB + "/scores/" + jeu + ".json", {
      method: "POST",
      body: JSON.stringify({ pseudo: pseudo, score: score, t: { ".sv": "timestamp" } })
    }).then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
      .then(function (d) { return d.name; });
  }
  function nettoyer(p) {
    return String(p || "").replace(/[\u0000-\u001f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 16);
  }
  function interdit(p) {
    var x = p.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
    return INTERDITS.some(function (m) {
      var y = m.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
      return y && x.indexOf(y) !== -1;
    });
  }
  function fmt(n) { return Number(n).toLocaleString("fr-FR"); }

  /* ---------- fenêtre ---------- */
  var fond = null;
  function fermer() { if (fond) { fond.remove(); fond = null; } }
  function creer(theme) {
    fermer();
    fond = document.createElement("div");
    fond.className = "jc-fond jc-" + theme;
    fond.setAttribute("role", "dialog");
    fond.setAttribute("aria-modal", "true");
    // rien ne doit traverser vers le jeu (sinon une partie se relance)
    ["pointerdown", "pointerup", "mousedown", "mouseup", "touchstart", "touchend", "keydown", "keyup", "click"].forEach(function (t) {
      fond.addEventListener(t, function (e) { e.stopPropagation(); });
    });
    fond.addEventListener("click", function (e) { if (e.target === fond) fermer(); });
    var boite = document.createElement("div");
    boite.className = "jc-boite";
    fond.appendChild(boite);
    document.body.appendChild(fond);
    return boite;
  }
  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }
  function dessinerListe(boite, liste, moiId) {
    var ol = el("ol", "jc-liste");
    if (!liste.length) ol.appendChild(el("li", "jc-vide", "Personne pour l'instant… Sois le premier !"));
    liste.forEach(function (s, i) {
      var li = el("li", s.id === moiId ? "jc-moi" : "");
      li.appendChild(el("span", "jc-rang", (i + 1) + "."));
      li.appendChild(el("span", "jc-nom", s.pseudo));
      li.appendChild(el("span", "jc-pts", fmt(s.score)));
      ol.appendChild(li);
    });
    boite.appendChild(ol);
  }
  function boutonFermer(boite, texte) {
    var b = el("button", "jc-btn jc-fermer", texte || "Fermer");
    b.type = "button";
    b.addEventListener("click", fermer);
    boite.appendChild(b);
    return b;
  }
  function erreur(boite) {
    boite.appendChild(el("p", "jc-sous", "Classement indisponible pour le moment. Réessaie plus tard !"));
    boutonFermer(boite);
  }

  /* Accueil : affiche simplement le top 10 */
  function ouvrir(jeu, opts) {
    opts = opts || {};
    var boite = creer(opts.theme || "site");
    boite.appendChild(el("h2", "", "Top 10"));
    boite.appendChild(el("p", "jc-sous", opts.titre || ""));
    var att = el("p", "jc-sous", "Chargement…");
    boite.appendChild(att);
    top10(jeu).then(function (l) { att.remove(); dessinerListe(boite, l); boutonFermer(boite); })
      .catch(function () { att.remove(); erreur(boite); });
  }

  /* Fin de partie : propose d'entrer son pseudo si le score entre dans le top 10 */
  function finDePartie(jeu, score, opts) {
    opts = opts || {};
    score = Math.max(0, Math.floor(Number(score) || 0));
    var boite = creer(opts.theme || "jeu");
    var titre = el("h2", "", "Top 10");
    boite.appendChild(titre);
    var att = el("p", "jc-sous", "Chargement…");
    boite.appendChild(att);
    top10(jeu).then(function (l) {
      att.remove();
      var qualifie = score > 0 && (l.length < 10 || score > l[l.length - 1].score);
      if (!qualifie) {
        var seuil = l.length >= 10 ? l[l.length - 1].score + 1 : 1;
        boite.appendChild(el("p", "jc-sous", "Ton score : " + fmt(score) + " — il faut " + fmt(seuil) + " pour entrer dans le top !"));
        dessinerListe(boite, l);
        boutonFermer(boite);
        return;
      }
      titre.textContent = "T'es dans le top 10 !";
      boite.appendChild(el("p", "jc-sous", "Ton score : " + fmt(score) + ". Mets ton pseudo :"));
      var form = el("form", "jc-form");
      var inp = el("input");
      inp.type = "text"; inp.maxLength = 16; inp.placeholder = "Ton pseudo"; inp.autocomplete = "nickname";
      inp.setAttribute("aria-label", "Ton pseudo");
      try { inp.value = localStorage.getItem(CLE_PSEUDO) || ""; } catch (e) {}
      var ok = el("button", "jc-btn", "Valider");
      ok.type = "submit";
      form.appendChild(inp); form.appendChild(ok);
      boite.appendChild(form);
      var err = el("p", "jc-err", "");
      boite.appendChild(err);
      dessinerListe(boite, l);
      var passer = boutonFermer(boite, "Non merci");
      setTimeout(function () { try { inp.focus(); } catch (e) {} }, 50);
      var envoye = false;
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (envoye) return;
        var p = nettoyer(inp.value);
        if (!p) { err.textContent = "Mets au moins une lettre !"; return; }
        if (interdit(p)) { err.textContent = "Ce pseudo n'est pas accepté, choisis-en un autre."; return; }
        envoye = true; ok.disabled = true; err.textContent = "";
        try { localStorage.setItem(CLE_PSEUDO, p); } catch (x) {}
        enregistrer(jeu, p, score).then(function (id) { return top10(jeu).then(function (l2) { return [id, l2]; }); })
          .then(function (r) {
            while (boite.firstChild) boite.removeChild(boite.firstChild);
            boite.appendChild(el("h2", "", "Top 10"));
            boite.appendChild(el("p", "jc-sous", "Bien joué " + p + " !"));
            dessinerListe(boite, r[1], r[0]);
            boutonFermer(boite);
          })
          .catch(function () { envoye = false; ok.disabled = false; err.textContent = "Oups, ça n'a pas marché. Réessaie !"; });
      });
      passer.textContent = "Non merci";
    }).catch(function () { att.remove(); erreur(boite); });
  }

  window.JohnnyClassement = { finDePartie: finDePartie, ouvrir: ouvrir, top10: top10, fermer: fermer };
})();
