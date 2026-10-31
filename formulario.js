/* Formulario por pasos y página de gracias, comunes a los 9 regalos. Los datos de cada uno están en window.REGALO. */
(function () {
  var R = window.REGALO, C = R.config;
  document.querySelectorAll(".wait").forEach(function (a) { a.href = C.waitlist; });
  document.querySelectorAll(".privacy").forEach(function (a) { a.href = C.privacy; a.target = "_blank"; });

  var modal = document.getElementById("modal"), form = document.getElementById("form");
  var steps = form.querySelectorAll(".step"), prog = document.getElementById("prog"), i = 0;

  function go(n) {
    steps[i].classList.remove("on"); i = n; steps[i].classList.add("on");
    prog.style.width = (100 * (i + 1) / steps.length) + "%";
    var f = steps[i].querySelector("input"); if (f && f.type !== "radio") setTimeout(function () { f.focus(); }, 30);
  }
  function err(msg) { steps[i].querySelector(".err").textContent = msg || ""; }
  function valid() {
    if (i === 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.value.trim())) return err("Revisa el email, parece que falta algo."), false;
    if (i === 1 && !form.name.value.trim()) return err("Escribe tu nombre."), false;
    if (i === 2) {
      if (!form.querySelector("input[name=punto]:checked")) return err("Elige una opción."), false;
      if (!form.consentimiento.checked) return err("Marca la casilla para poder enviarte " + (R.que || "la guía") + "."), false;
    }
    err(""); return true;
  }

  document.querySelectorAll(".open").forEach(function (b) { b.addEventListener("click", function () { modal.classList.add("on"); go(0); }); });
  form.querySelector(".close").addEventListener("click", function () { modal.classList.remove("on"); });
  modal.addEventListener("click", function (e) { if (e.target === modal) modal.classList.remove("on"); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") modal.classList.remove("on"); });
  form.querySelectorAll(".next").forEach(function (b) { b.addEventListener("click", function () { if (valid()) go(i + 1); }); });
  form.querySelectorAll(".back").forEach(function (b) { b.addEventListener("click", function () { err(""); go(i - 1); }); });
  form.addEventListener("keydown", function (e) { if (e.key === "Enter" && i < steps.length - 1) { e.preventDefault(); if (valid()) go(i + 1); } });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!valid()) return;
    var btn = form.querySelector("[type=submit]"); btn.disabled = true;
    var data = new URLSearchParams(new FormData(form));
    data.set("regalo", R.regalo); data.set("area", R.area);
    var p = new URLSearchParams(location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach(function (k) { if (p.get(k)) data.set(k, p.get(k)); });
    var send = C.action ? fetch(C.action, { method: "POST", mode: "no-cors", body: data }).catch(function () {}) : Promise.resolve();
    if (!C.action) console.warn("Borrador: el formulario no está conectado, este contacto no se ha guardado.");
    send.then(function () {
      var h = document.getElementById("hello");
      h.textContent = "Hecho, ";
      var b = document.createElement("b"); b.textContent = form.name.value.trim().split(" ")[0]; h.appendChild(b);
      h.appendChild(document.createTextNode(R.hecho || ". Revisa tu correo, que ya te ha llegado la guía."));
      modal.classList.remove("on"); document.body.classList.add("done"); window.scrollTo(0, 0);
      btn.disabled = false;
    });
  });

  var copy = document.querySelector(".copy"), msg = document.getElementById("copied");
  if (copy) copy.addEventListener("click", function () {
    function ok() { msg.textContent = "Copiadas. Pégalas en un chat nuevo de ChatGPT o Claude."; }
    if (navigator.clipboard) navigator.clipboard.writeText(R.prompt).then(ok, fallback); else fallback();
    function fallback() {
      var t = document.createElement("textarea"); t.value = R.prompt; document.body.appendChild(t); t.select();
      try { document.execCommand("copy"); ok(); } catch (x) { msg.textContent = "No se han podido copiar. Las tienes en el PDF."; }
      t.remove();
    }
  });

  if (location.hash === "#gracias") document.body.classList.add("done");
})();
