const status = document.getElementById("copy-status");

function publicOrigin() {
  return window.location.origin;
}

async function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.left = "-9999px";
  document.body.appendChild(field);
  field.select();
  const ok = document.execCommand("copy");
  field.remove();
  if (!ok) throw new Error("copy failed");
}

function setStatus(message, isError) {
  if (!status) return;
  status.textContent = message;
  status.dataset.state = isError ? "error" : "success";
}

for (const button of document.querySelectorAll("[data-copy]")) {
  button.addEventListener("click", async () => {
    const path = button.getAttribute("data-copy");
    if (!path) return;
    const url = `${publicOrigin()}${path}`;
    try {
      await copyText(url);
      setStatus(`Copied ${url}`, false);
    } catch {
      setStatus(
        "Could not copy the MCP URL. Select the endpoint text instead.",
        true,
      );
    }
  });
}

for (const code of document.querySelectorAll(".endpoint")) {
  const path = code.getAttribute("data-path");
  if (path) code.textContent = `${publicOrigin()}${path}`;
}

fetch("/version", { cache: "no-store" })
  .then((response) => (response.ok ? response.json() : null))
  .then((version) => {
    if (!version || !version.gallerySha) return;
    for (const node of document.querySelectorAll("[data-build]")) {
      node.textContent = String(version.gallerySha).slice(0, 12);
    }
  })
  .catch(() => undefined);

fetch("/apps.json", { cache: "no-store" })
  .then((response) => (response.ok ? response.json() : null))
  .then((manifest) => {
    if (!manifest || !Array.isArray(manifest.apps)) return;
    const enabled = new Set(manifest.apps.map((app) => app.slug));
    for (const card of document.querySelectorAll(".card[data-slug]")) {
      const slug = card.getAttribute("data-slug");
      if (slug && !enabled.has(slug)) {
        card.hidden = true;
      }
    }
  })
  .catch(() => {
    setStatus(
      "Live catalog status is unavailable; showing the build-time catalog.",
      true,
    );
  });
