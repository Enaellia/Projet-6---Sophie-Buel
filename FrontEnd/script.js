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

// ==== UI : Modale (ouvrir / fermer) ====
function openModal() {
  const modal = document.getElementById("modal");
  if (modal) {
    modal.classList.remove("hidden");
    displayModalGallery(allWorks);

    // Vue galerie par défaut
    modalGalleryView.classList.remove("hidden");
    modalAddPhotoView.classList.add("hidden");

    // Réinitialiser le formulaire
    if (form) form.reset();
    if (previewContainer) previewContainer.innerHTML = "";
    if (submitBtn) submitBtn.disabled = true;
    uploadArea?.classList.remove("has-preview");

    // Recharger les catégories dans le formulaire
    loadCategoriesInForm();
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

  const token = localStorage.getItem("token");
  const loginLink = document.getElementById("login-link");
  const logoutLink = document.getElementById("logout-link");

  const modal = document.getElementById("modal");
  const form = document.getElementById("photo-form");
  const imageInput = document.getElementById("image-upload");
  const titleInput = document.getElementById("title");
  const categorySelect = document.getElementById("category");
  const submitBtn = document.querySelector(".submit-btn");
  const previewContainer = document.getElementById("image-preview");

  const modalGalleryView = document.querySelector(".modal-gallery-view");
  const modalAddPhotoView = document.querySelector(".modal-add-photo");
  const addPhotoBtn = document.querySelector(".add-photo-btn");
  const backArrow = document.querySelector(".back-arrow");
  const uploadArea = document.querySelector(".upload-area");

  if (token) {
    if (loginLink) loginLink.classList.add("hidden");
    if (logoutLink) logoutLink.classList.remove("hidden");

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

  const closeBtn = document.querySelector(".modal .close");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeModal);
  }

  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      closeModal();
    }
  });

  addPhotoBtn.addEventListener("click", () => {
    modalGalleryView.classList.add("hidden");
    modalAddPhotoView.classList.remove("hidden");
    if (form) form.reset();
    if (previewContainer) previewContainer.innerHTML = "";
    if (submitBtn) submitBtn.disabled = true;
    uploadArea?.classList.remove("has-preview");
    loadCategoriesInForm();
  });

  backArrow.addEventListener("click", () => {
    modalAddPhotoView.classList.add("hidden");
    modalGalleryView.classList.remove("hidden");
  });

  // Prévisualisation d'image avec masquage de la zone d'upload
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

  // Validation dynamique du formulaire
  function checkFormValidity() {
    const hasImage = imageInput.files.length > 0;
    const hasTitle = titleInput.value.trim().length > 0;
    const hasCategory = categorySelect.value !== "";

    submitBtn.disabled = !(hasImage && hasTitle && hasCategory);
  }

  titleInput.addEventListener("input", checkFormValidity);
  categorySelect.addEventListener("change", checkFormValidity);

  form.addEventListener("submit", function(event) {
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