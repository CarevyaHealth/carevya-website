// Set your business WhatsApp number here (country code + number, digits only), e.g. "919876543210".
var WHATSAPP_NUMBER = "918105352762";

(function(){
  var y = document.getElementById("yr"); if (y) y.textContent = new Date().getFullYear();

  var btn = document.getElementById("menuBtn"), nav = document.getElementById("nav");
  if (btn && nav) {
    btn.addEventListener("click", function(){
      var open = nav.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Close" : "Menu";
    });
    nav.addEventListener("click", function(e){
      if (e.target.tagName === "A" && nav.classList.contains("open")) {
        nav.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); btn.textContent = "Menu";
      }
    });
  }

  if (WHATSAPP_NUMBER) {
    var line = document.getElementById("waLine"), shown = document.getElementById("waShown");
    if (line && shown) {
      line.hidden = false;
      shown.textContent = "+" + WHATSAPP_NUMBER.replace(/^(\d{2})(\d{5})(\d+)$/, "$1 $2 $3");
    }
  }

  // Buttons that pre-select the enquiry type
  document.querySelectorAll("a[data-type]").forEach(function(a){
    a.addEventListener("click", function(){
      var s = document.getElementById("f-type"); if (s) s.value = a.getAttribute("data-type");
    });
  });

  var form = document.getElementById("enquiry");
  if (!form) return;

  // Dates: no past days, readable format in the message
  var pad = function(n){ return (n < 10 ? "0" : "") + n; };
  var now = new Date(), today = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
  form.querySelectorAll('input[type="date"]').forEach(function(d){ d.min = today; });
  var readable = function(v){
    var p = v.split("-"); if (p.length !== 3) return v;
    var d = new Date(+p[0], +p[1] - 1, +p[2]);
    return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };
  var intro = form.getAttribute("data-intro") || "Hello Carevya Health,";

  form.addEventListener("submit", function(e){
    e.preventDefault();
    var err = document.getElementById("err"), missing = false;
    form.querySelectorAll("[data-required]").forEach(function(el){ if (!el.value.trim()) missing = true; });
    if (missing) { err.hidden = false; return; }
    err.hidden = true;

    var lines = [intro, ""], note = "";
    form.querySelectorAll("[data-label]").forEach(function(el){
      var val = el.value.trim(); if (!val) return;
      if (el.type === "date") val = readable(val);
      if (el.tagName === "TEXTAREA") note = val; else lines.push(el.getAttribute("data-label") + ": " + val);
    });
    if (note) { lines.push(""); lines.push(note); }
    var text = lines.join("\n");

    document.getElementById("msgOut").textContent = text;
    var wa = document.getElementById("waBtn");
    if (WHATSAPP_NUMBER) { wa.href = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text); wa.hidden = false; }
    document.getElementById("result").hidden = false;
  });

  document.getElementById("copyBtn").addEventListener("click", function(){
    var out = document.getElementById("msgOut"), text = out.textContent, note = document.getElementById("copyNote");
    var fallback = function(){
      var r = document.createRange(); r.selectNodeContents(out);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      note.textContent = "Message selected. Copy it and send it to contact@carevya.in or on WhatsApp.";
    };
    try {
      navigator.clipboard.writeText(text).then(function(){
        note.textContent = "Copied. Send it to contact@carevya.in or paste it into WhatsApp.";
      }, fallback);
    } catch (e) { fallback(); }
  });
})();

// Light / dark mode switch
(function(){
  var root = document.documentElement, btn = document.getElementById("themeBtn"), icon = document.getElementById("themeIcon");
  if (!btn) return;
  var MOON = "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z";
  var SUN = "M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z";
  var isDark = function(){
    var t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  };
  var paint = function(){
    var dark = isDark(), label = dark ? "Switch to light mode" : "Switch to dark mode";
    icon.setAttribute("d", dark ? SUN : MOON);
    btn.setAttribute("aria-label", label); btn.setAttribute("title", label);
  };
  btn.addEventListener("click", function(){
    var next = isDark() ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("carevya-theme", next); } catch (e) {}
    paint();
  });
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.addEventListener) mq.addEventListener("change", paint);
  }
  if (window.MutationObserver) new MutationObserver(paint).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  paint();
})();
