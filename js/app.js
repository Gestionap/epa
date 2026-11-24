const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby2h6AteLbr7ZlVkdNCqbkbkH-FUFde_CaZ0_kZPaNBUCas1vR21ZguIgq19HuHSgoYww/exec";
const VIDEO_PREVIEW_URL = "https://drive.google.com/file/d/121UJ56ufAcFVVYsNxqY9JDIGQLvS7e19/preview";

const gallery = document.getElementById("gallery");
const statusEl = document.getElementById("status");

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxDownload = document.getElementById("lightbox-download");
const lightboxClose = document.getElementById("lightbox-close");

const videoModal = document.getElementById("video-modal");
const videoIframe = document.getElementById("video-iframe");
const videoOpenBtn = document.getElementById("video-open");
const videoCloseBtn = document.getElementById("video-close");

// 1. Fondo animado Vanta Waves solo en PC (>= 768px)
function initVantaDesktop() {
  const isDesktop = window.matchMedia("(min-width: 768px)").matches;
  if (isDesktop && typeof VANTA !== "undefined" && typeof THREE !== "undefined") {
    VANTA.WAVES({
      el: "#vanta-bg",
      THREE: THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x181818,
      shininess: 52.00,
      waveHeight: 4.00,
      zoom: 0.65
    });
  }
}

// 2. Activar fade-in al hacer scroll con IntersectionObserver
function activarFadeInScroll() {
  const cards = gallery.querySelectorAll(".photo-card");

  if (!("IntersectionObserver" in window)) {
    cards.forEach((card) => card.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -20px 0px"
    }
  );

  cards.forEach((card) => observer.observe(card));
}

// 3. Cargar fotos desde Google Apps Script
async function cargarFotos() {
  try {
    const res = await fetch(APPS_SCRIPT_URL);
    const fotos = await res.json();

    if (!Array.isArray(fotos) || !fotos.length) {
      statusEl.textContent = "Todavía no hay fotos disponibles en la carpeta.";
      return;
    }

    statusEl.style.display = "none";

    fotos.forEach((foto) => {
      const card = document.createElement("div");
      card.className = "photo-card";
      card.innerHTML = `
        <img src="${foto.thumb}" alt="${foto.nombre}" loading="lazy" />
        <a class="download-btn" href="${foto.download}" target="_blank" rel="noopener">Descargar</a>
      `;

      card.querySelector("img").addEventListener("click", () => {
        lightboxImg.src = foto.full;
        lightboxDownload.href = foto.download;
        lightbox.classList.add("open");
        lightbox.setAttribute("aria-hidden", "false");
      });

      card.querySelector(".download-btn").addEventListener("click", (e) => {
        e.stopPropagation();
      });

      gallery.appendChild(card);
    });

    activarFadeInScroll();
  } catch (err) {
    statusEl.textContent = "No se pudieron cargar las fotos. Verificá que la carpeta y el script sean públicos.";
  }
}

// 4. Lightbox de fotos
function cerrarLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImg.src = "";
}

lightboxClose.addEventListener("click", cerrarLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) cerrarLightbox();
});

// 5. Pop-up de video
function abrirVideoModal() {
  videoIframe.src = VIDEO_PREVIEW_URL;
  videoModal.classList.add("open");
  videoModal.setAttribute("aria-hidden", "false");
}

function cerrarVideoModal() {
  videoModal.classList.remove("open");
  videoModal.setAttribute("aria-hidden", "true");
  videoIframe.src = "";
}

videoOpenBtn.addEventListener("click", abrirVideoModal);
videoCloseBtn.addEventListener("click", cerrarVideoModal);
videoModal.addEventListener("click", (e) => {
  if (e.target === videoModal) cerrarVideoModal();
});

// Cerrar modales con Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (videoModal.classList.contains("open")) cerrarVideoModal();
    if (lightbox.classList.contains("open")) cerrarLightbox();
  }
});

window.addEventListener("DOMContentLoaded", () => {
  initVantaDesktop();
  cargarFotos();
});