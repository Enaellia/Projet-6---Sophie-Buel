// ==== DEBUG : Vérification du chargement du script ====
console.log("Script chargé");

// ==== Données globales ====
let allWorks = [];

// ==== charger les projets ====
function loadWorks() {
  fetch("http://localhost:5678/api/works")
    .then(response => response.json())
    .then(works => {
      allWorks = works;
      displayWorks(allWorks);
    })
    .catch(error => {
      console.error("Erreur lors du chargement des works :", error);
    });
}

// ==== Afficher les projets dans la galerie principale ====
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

// ==== Charger les catégories pour les filtres ====
function loadCategories() {
  fetch("http://localhost:5678/api/categories")
    .then(response => response.json())
    .then(categories => {
      const categoriesList = document.getElementById("categories");
      categoriesList.innerHTML = '';
      const allLi = document.createElement("li");
      allLi.textContent = "Tous";
      allLi.classList.add("active");
      allLi.addEventListener("click", () => {
        displayWorks(allWorks);
        updateActiveCategory(allLi);
      });
      categoriesList.appendChild(allLi);
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

// ==== Mettre à jour la catégorie active sélectionnée ====
function updateActiveCategory(selectedLi) {
  const allLis = document.querySelectorAll("#categories li");
  allLis.forEach(li => li.classList.remove("active"));
  selectedLi.classList.add("active");
}

// ==== DOM chargé ====
document.addEventListener("DOMContentLoaded", () => {
  loadWorks();
  loadCategories();

  const modal = document.getElementById("modal");
  const form = document.getElementById("photo-form");
  const imageInput = document.getElementById("image-upload");
  const titleInput = document.getElementById("title");
  const categorySelect = document.getElementById("category");
  const submitBtn = document.querySelector(".submit-btn");
  const previewContainer = document.getElementById("image-preview");
  const uploadArea = document.querySelector(".upload-area");

  const modalGalleryView = document.querySelector(".modal-gallery-view");
  const modalAddPhotoView = document.querySelector(".modal-add-photo");
  const addPhotoBtn = document.querySelector(".add-photo-btn");
  const backArrow = document.querySelector(".back-arrow");
  const closeBtn = document.querySelector(".modal .close");

  // ==== Réinitialiser le formulaire d'ajout ====
  function resetModalForm() {
    if (form) form.reset();
    if (previewContainer) previewContainer.innerHTML = "";
    if (submitBtn) submitBtn.disabled = true;
    uploadArea?.classList.remove("has-preview");
  }

  // ==== Revenir à la vue galerie dans la modale ====
  function resetModalView() {
    modalGalleryView.classList.remove("hidden");
    modalAddPhotoView.classList.add("hidden");
  }

  // ====  Ouvrir la modale ====
  function openModal() {
    modal.classList.remove("hidden");
    displayModalGallery(allWorks);
    resetModalForm();
    resetModalView();
    loadCategoriesInForm();
  }

  // ==== Fermer la modale ====
  function closeModal() {
    modal.classList.add("hidden");
    resetModalForm();
    resetModalView();
  }

  // ==== GESTION DE SESSION (login/logout) ====
const token = localStorage.getItem("token");
const loginLink = document.getElementById("login-link");
const logoutLink = document.getElementById("logout-link");

// Vérifie si le token est bien défini et non vide
if (token && token !== "") {
  // Cacher le lien "login" / Afficher "logout"
  if (loginLink) loginLink.classList.add("hidden");
  if (logoutLink) logoutLink.classList.remove("hidden");

  // === Affichage de la bannière "Mode édition" ===
  const editBanner = document.createElement("div");
  editBanner.classList.add("edit-banner");
  editBanner.innerHTML = '<i class="fa-regular fa-pen-to-square"></i><span>Mode édition</span>';
  document.body.prepend(editBanner);
  document.body.classList.add("with-edit-banner");

  // === Ajout du bouton "Modifier" dans le header ===
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

  // === Gestion du logout ===
  logoutLink?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    window.location.reload();
  });
}

  // ==== FERMETURE DE LA MODALE ====
  closeBtn?.addEventListener("click", () => closeModal());
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal();
    }
  });

  // ==== GESTION DE "Ajouter une photo" ====
  addPhotoBtn.addEventListener("click", () => {
    modalGalleryView.classList.add("hidden");
    modalAddPhotoView.classList.remove("hidden");
    resetModalForm();
    loadCategoriesInForm();
  });

  backArrow.addEventListener("click", () => {
    modalAddPhotoView.classList.add("hidden");
    modalGalleryView.classList.remove("hidden");
  });

  // ==== GESTION DU CHOIX D'IMAGE ====
  imageInput.addEventListener("change", function () {
    previewContainer.innerHTML = "";
    const file = imageInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = document.createElement("img");
        img.src = e.target.result;
        img.alt = "Prévisualisation";
        img.style.maxWidth = "100%";
        img.style.maxHeight = "170px";
        img.style.borderRadius = "5px";
        previewContainer.appendChild(img);
        uploadArea?.classList.add("has-preview");
      };
      reader.readAsDataURL(file);
    } else {
      uploadArea?.classList.remove("has-preview");
    }
    checkFormValidity();
  });

  // ==== Vérifier que tous les champs sont valides ====
  function checkFormValidity() {
    const hasImage = imageInput.files.length > 0;
    const hasTitle = titleInput.value.trim().length > 0;
    const hasCategory = categorySelect.value !== "";
    submitBtn.disabled = !(hasImage && hasTitle && hasCategory);
  }

  titleInput.addEventListener("input", checkFormValidity);
  categorySelect.addEventListener("change", checkFormValidity);

  // ==== Soumettre un nouveau projet ====
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const imageFile = imageInput.files[0];
    const title = titleInput.value.trim();
    const category = categorySelect.value;
    if (!imageFile || !title || !category) {
      alert("Merci de remplir tous les champs !");
      return;
    }
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("title", title);
    formData.append("category", category);
    fetch("http://localhost:5678/api/works", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      body: formData
    })
      .then(response => {
        if (response.ok) {
          alert("Projet ajouté avec succès !");
          closeModal();
          loadWorks();
        } else {
          alert("Erreur lors de l'ajout du projet !");
          console.error("Erreur ajout :", response.statusText);
        }
      })
      .catch(error => {
        alert("Erreur réseau lors de l'ajout !");
        console.error("Erreur réseau :", error);
      });
  });
});

// ==== Charger les catégories dans le formulaire ====
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

// ==== Afficher les projets dans la modale ====
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
    deleteBtn.addEventListener('click', () => {
      const confirmDelete = confirm("Es-tu sûr de vouloir supprimer ce projet ?");
      if (!confirmDelete) return;
      fetch("http://localhost:5678/api/works/" + work.id, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
          "Content-Type": "application/json"
        }
      })
        .then(response => {
          if (response.ok) {
            figure.remove();
            loadWorks();
          } else {
            alert("Erreur lors de la suppression du projet !");
            console.error("Erreur DELETE :", response.statusText);
          }
        })
        .catch(error => {
          alert("Impossible de supprimer le projet (problème réseau ou serveur)");
          console.error("Erreur réseau :", error);
        });
    });
    figure.appendChild(img);
    figure.appendChild(deleteBtn);
    modalGallery.appendChild(figure);
  });
}