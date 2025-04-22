// ==== DEBUG : Vérification du chargement du script ====
console.log("Script chargé");

// ==== Données globales ====
let allWorks = []; // Stocke tous les projets récupérés depuis l'API

// ==== API : Chargement des projets ====
function loadWorks() {
  return fetch("http://localhost:5678/api/works")
    .then(response => response.json())
    .then(works => {
      allWorks = works;
      displayWorks(allWorks);
    })
    .catch(error => {
      console.error("Erreur lors du chargement des works :", error);
    });
}

// ==== Affichage : Galerie principale ====
function displayWorks(works) {
  const gallery = document.querySelector(".gallery");
  gallery.innerHTML = '';

  works.forEach(work => {
    const figure = document.createElement("figure");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const caption = document.createElement("figcaption");
    caption.textContent = work.title;

    figure.appendChild(img);
    figure.appendChild(caption);

    gallery.appendChild(figure);
  });
}

// ==== API : Chargement des catégories ====
function loadCategories() {
  fetch("http://localhost:5678/api/categories")
    .then(response => response.json())
    .then(categories => {
      const categoriesList = document.getElementById("categories");
      categoriesList.innerHTML = '';

      // Bouton "Tous"
      const allLi = document.createElement("li");
      allLi.textContent = "Tous";
      allLi.classList.add("active");
      allLi.addEventListener("click", () => {
        displayWorks(allWorks);
        updateActiveCategory(allLi);
      });
      categoriesList.appendChild(allLi);

      // Boutons dynamiques pour chaque catégorie
      categories.forEach(categorie => {
        const li = document.createElement("li");
        li.textContent = categorie.name;
        li.dataset.categoryId = categorie.id;

        li.addEventListener("click", () => {
          const filteredWorks = allWorks.filter(work => work.categoryId === categorie.id);
          displayWorks(filteredWorks);
          updateActiveCategory(li);
        });

        categoriesList.appendChild(li);
      });
    });
}

// ==== UI : Mise à jour de la catégorie active ====
function updateActiveCategory(selectedLi) {
  const allLis = document.querySelectorAll("#categories li");
  allLis.forEach(li => li.classList.remove("active"));
  selectedLi.classList.add("active");
}

// ==== Affichage : Galerie dans la modale ====
function displayModalGallery(works) {
  const modalGallery = document.querySelector(".modal-gallery");
  modalGallery.innerHTML = '';

  works.forEach(work => {
    const figure = document.createElement("figure");

    const img = document.createElement("img");
    img.src = work.imageUrl;
    img.alt = work.title;

    const deleteBtn = document.createElement("span");
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
    deleteBtn.classList.add("delete-icon");

    figure.appendChild(img);
    figure.appendChild(deleteBtn);
    modalGallery.appendChild(figure);
  });
}

// ==== UI : Modale (ouvrir / fermer) ====
function openModal() {
  const modal = document.getElementById("modal");
  if (modal) {
    modal.classList.remove("hidden");
    displayModalGallery(allWorks);
    modalGalleryView.classList.remove("hidden");
    modalAddPhotoView.classList.add("hidden");
  }
}

function closeModal() {
  const modal = document.getElementById("modal");
  if (modal) {
    modal.classList.add("hidden");
  }
}

// ==== API : Chargement des catégories dans le formulaire ====
function loadCategoriesInForm() {
  fetch("http://localhost:5678/api/categories")
    .then(res => res.json())
    .then(categories => {
      const select = document.getElementById("category");
      select.innerHTML = '<option value="">-- Choisir une catégorie --</option>';
      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
      });
    });
}

// ==== Initialisation au chargement de la page ====
document.addEventListener("DOMContentLoaded", () => {
  loadWorks().then(loadCategories);

  // Gestion login/logout
  const token = localStorage.getItem("token");
  const loginLink = document.getElementById("login-link");
  const logoutLink = document.getElementById("logout-link");

  if (token) {
    if (loginLink) loginLink.classList.add("hidden");
    if (logoutLink) logoutLink.classList.remove("hidden");

    // Ajout bouton "Modifier" dans le header si connecté
    const headerContainer = document.querySelector(".portfolio-header");
    if (headerContainer) {
      const editBtn = document.createElement("button");
      editBtn.classList.add("edit-btn");

      const icon = document.createElement("i");
      icon.classList.add("fa-regular", "fa-pen-to-square");
      editBtn.appendChild(icon);
      editBtn.appendChild(document.createTextNode(" Modifier"));

      editBtn.addEventListener("click", openModal);
      headerContainer.appendChild(editBtn);
    }

    logoutLink?.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      window.location.reload();
    });
  }

  // Gestion fermeture modale
  const closeBtn = document.querySelector(".modal .close");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  // ==== Gestion ajout de photo dans la modale ====
  const form = document.getElementById("photo-form");
  const previewContainer = document.getElementById("image-preview");
  const submitBtn = document.querySelector(".submit-btn");

  const modalGalleryView = document.querySelector(".modal-gallery-view");
  const modalAddPhotoView = document.querySelector(".modal-add-photo");
  const addPhotoBtn = document.querySelector(".add-photo-btn");
  const backArrow = document.querySelector(".back-arrow");

  addPhotoBtn?.addEventListener("click", () => {
    modalGalleryView.classList.add("hidden");
    modalAddPhotoView.classList.remove("hidden");

    // Nettoyage du formulaire
    if (form) form.reset();
    if (previewContainer) previewContainer.innerHTML = "";
    if (submitBtn) submitBtn.disabled = true;

    loadCategoriesInForm();
  });

  backArrow?.addEventListener("click", () => {
    modalAddPhotoView.classList.add("hidden");
    modalGalleryView.classList.remove("hidden");
  });
});
