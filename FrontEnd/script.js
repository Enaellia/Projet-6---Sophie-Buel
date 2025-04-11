// Au chargement de la page, on va chercher les "works"
console.log("Script chargé");
fetch("http://localhost:5678/api/works")
  .then(response => response.json())
  .then(works => {
    const gallery = document.querySelector(".gallery");

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
  })
  .catch(error => {
    console.error("Erreur lors du chargement des works :", error);
  });