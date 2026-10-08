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
      "v3.plans": "See the plans",
      "v3.story.swipe": "Swipe sideways",
      "v3.s6t": "Glucose curve",
      "v3.s6d": "Every reading on one chart: the daily average and the day's range, over 90 days.",
      "v3.s7t": "Seizure timer",
      "v3.s7d": "Start it when the seizure begins, stop it when it ends: the duration is saved with the date.",
      "v3.sym.t": "Excessive thirst",
      "v3.sym.s": "Mild · 9:14 AM",
      "v3.glu.t": "Glucose · 90 days",
      "v3.glu.s": "Average 122 mg/dL"
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
      "v3.plans": "Guarda i piani",
      "v3.story.swipe": "Trascina di lato",
      "v3.s6t": "Curva glicemica",
      "v3.s6d": "Ogni misura su un grafico: la media del giorno e l'intervallo tra minimo e massimo, fino a 90 giorni.",
      "v3.s7t": "Timer crisi",
      "v3.s7d": "Lo avvii quando inizia la crisi e lo fermi quando finisce: la durata resta salvata con la data.",
      "v3.sym.t": "Sete eccessiva",
      "v3.sym.s": "Lieve · 9:14",
      "v3.glu.t": "Glicemia · 90 giorni",
      "v3.glu.s": "Media 122 mg/dL"
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
      "v3.plans": "Ver los planes",
      "v3.story.swipe": "Desliza de lado",
      "v3.s6t": "Curva de glucemia",
      "v3.s6d": "Cada medición en un gráfico: la media del día y el rango entre mínimo y máximo, hasta 90 días.",
      "v3.s7t": "Cronómetro de crisis",
      "v3.s7d": "Lo inicias cuando empieza la crisis y lo detienes cuando termina: la duración queda guardada con la fecha.",
      "v3.sym.t": "Sed excesiva",
      "v3.sym.s": "Leve · 9:14",
      "v3.glu.t": "Glucemia · 90 días",
      "v3.glu.s": "Media 122 mg/dL"
    }
  };
  var D = window.SERENO_I18N = window.SERENO_I18N || {};
  Object.keys(X).forEach(function (l) {
    D[l] = D[l] || {};
    Object.keys(X[l]).forEach(function (k) { D[l][k] = X[l][k]; });
  });
})();
