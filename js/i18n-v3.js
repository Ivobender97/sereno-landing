/* Sereno — extra strings for the v3 home page (EN / IT / ES).
   Loaded after i18n.js and i18n-v2.js. The two notifications are the
   same words the app sends (locales/*.json → refill / feeding). */
(function () {
  var X = {
    en: {
      "v3.ref.t": "Sereno refill",
      "v3.ref.s": "Insulin · 2 doses remaining",
      "v3.meal.t": "Meal reminder",
      "v3.meal.s": "Time for Luna's meal",
      "v3.story.scroll": "Keep scrolling",
      "v3.fam.today": "Today",
      "v3.fam.time2": "8:00 PM",
      "v3.fam.sched": "Later",
      "v3.fam.week": "Last 7 days",
      "v3.plans": "See the plans"
    },
    it: {
      "v3.ref.t": "Scorta Sereno",
      "v3.ref.s": "Insulina · 2 dosi rimaste",
      "v3.meal.t": "Promemoria pasto",
      "v3.meal.s": "È ora del pasto di Luna",
      "v3.story.scroll": "Continua a scorrere",
      "v3.fam.today": "Oggi",
      "v3.fam.time2": "20:00",
      "v3.fam.sched": "Più tardi",
      "v3.fam.week": "Ultimi 7 giorni",
      "v3.plans": "Guarda i piani"
    },
    es: {
      "v3.ref.t": "Reposición Sereno",
      "v3.ref.s": "Insulina · quedan 2 dosis",
      "v3.meal.t": "Recordatorio de comida",
      "v3.meal.s": "Es hora de la comida de Luna",
      "v3.story.scroll": "Sigue deslizando",
      "v3.fam.today": "Hoy",
      "v3.fam.time2": "20:00",
      "v3.fam.sched": "Más tarde",
      "v3.fam.week": "Últimos 7 días",
      "v3.plans": "Ver los planes"
    }
  };
  var D = window.SERENO_I18N = window.SERENO_I18N || {};
  Object.keys(X).forEach(function (l) {
    D[l] = D[l] || {};
    Object.keys(X[l]).forEach(function (k) { D[l][k] = X[l][k]; });
  });
})();
