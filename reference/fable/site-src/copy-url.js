// Copy MCP URL buttons with accessible success and failure feedback, plus
// progressive enhancement: endpoint paths become absolute URLs derived from
// this page's own origin (never from any server-trusted header), and the
// build label is filled from /version. No cookies, no analytics.
(function initGallery() {
  var RESET_MS = 2500;

  function absoluteUrl(path) {
    return window.location.origin + path;
  }

  // Upgrade visible endpoint paths to absolute URLs.
  Array.prototype.forEach.call(
    document.querySelectorAll("code.endpoint-url[data-path]"),
    function upgrade(code) {
      code.textContent = absoluteUrl(code.getAttribute("data-path"));
    },
  );

  // Fill the live build label from the service's own /version route.
  fetch("/version", { credentials: "omit" })
    .then(function toJson(response) {
      return response.ok ? response.json() : null;
    })
    .then(function fill(version) {
      if (!version || typeof version.gallerySha !== "string") return;
      var label = version.gallerySha.slice(0, 7);
      Array.prototype.forEach.call(
        document.querySelectorAll("[data-build-label]"),
        function set(element) {
          element.textContent = label;
        },
      );
    })
    .catch(function ignore() {
      // The static "see /version" link remains as the no-JS/offline fallback.
    });

  function setStatus(status, message, ok) {
    status.textContent = message;
    status.classList.toggle("ok", ok);
    status.classList.toggle("err", !ok);
    window.setTimeout(function reset() {
      status.textContent = "";
      status.classList.remove("ok", "err");
    }, RESET_MS);
  }

  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "absolute";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    var copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }
    document.body.removeChild(area);
    return copied;
  }

  Array.prototype.forEach.call(
    document.querySelectorAll(".copy-button"),
    function bind(button) {
      button.addEventListener("click", function onClick() {
        var text = absoluteUrl(button.getAttribute("data-path") || "");
        var status = button.parentElement.querySelector(".copy-status");
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(
            function onOk() {
              setStatus(status, "Copied ✓", true);
            },
            function onErr() {
              if (fallbackCopy(text)) {
                setStatus(status, "Copied ✓", true);
              } else {
                setStatus(
                  status,
                  "Copy failed — select the URL text manually.",
                  false,
                );
              }
            },
          );
        } else if (fallbackCopy(text)) {
          setStatus(status, "Copied ✓", true);
        } else {
          setStatus(
            status,
            "Copy failed — select the URL text manually.",
            false,
          );
        }
      });
    },
  );
})();
