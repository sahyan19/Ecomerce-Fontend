document.addEventListener("DOMContentLoaded", () => {
  fetch("online_store_extended.json")
    .then((response) => response.json())
    .then((data) => {
      initializeSite(data);
    })
    .catch((error) => {
      console.error("Erreur lors du chargement des données:", error);
    });
});

let siteData = {};
let currentPage = 1;
const itemsPerPage = 10;

function initializeSite(data) {
  siteData = data;
  const siteNameElem = document.getElementById("siteName");
  const siteDescriptionElem = document.getElementById("siteDescription");
  const categoriesContainer = document.getElementById("categories");

  if (siteNameElem && siteDescriptionElem && categoriesContainer) {
    siteNameElem.innerText = data.siteInfo.siteName;
    siteDescriptionElem.innerText = data.siteInfo.description;

    data.categories.forEach((category) => {
      const li = document.createElement("li");
      li.innerText = category.name;
      li.addEventListener("click", () =>
        afficherProduitsParCategorie(category.id)
      );
      categoriesContainer.appendChild(li);
    });

    afficherTousLesProduits();
    afficherPanier();
  }
}

function afficherProduitsParCategorie(categoryId) {
  const produitsContainer = document.getElementById("liste-tous-produits");
  if (produitsContainer) {
    produitsContainer.innerHTML = "";
    const produits = siteData.products.filter(
      (product) => product.categoryId === categoryId
    );
    afficherProduits(produits, 1);
  }
}

function afficherTousLesProduits() {
  const produitsContainer = document.getElementById("liste-tous-produits");
  if (produitsContainer) {
    produitsContainer.innerHTML = "";
    afficherProduits(siteData.products, 1);
  }
}

function creerElementProduit(product) {
  const produitElement = document.createElement("div");
  produitElement.className = "produit";

  produitElement.innerHTML = `
        <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null;this.src='placeholder.jpg';">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <p>Prix: ${product.price} €</p>
        <button onclick="ajouterAuPanier(${product.id})">Ajouter au panier</button>
    `;

  return produitElement;
}

function ajouterAuPanier(productId) {
  const product = siteData.products.find((p) => p.id === productId);
  if (!product) {
    console.error("Produit non trouvé.");
    return;
  }

  const panierItem = siteData.cart.find((item) => item.productId === productId);

  if (panierItem) {
    panierItem.quantity += 1;
  } else {
    siteData.cart.push({ productId: productId, quantity: 1 });
  }

  afficherPanier();
}

function supprimerDuPanier(productId) {
  const panierIndex = siteData.cart.findIndex(
    (item) => item.productId === productId
  );

  if (panierIndex !== -1) {
    siteData.cart.splice(panierIndex, 1);
    afficherPanier();
  }
}

function afficherPanier() {
  const panierContainer = document.getElementById("liste-panier");
  if (panierContainer) {
    panierContainer.innerHTML = "";
    let total = 0;

    siteData.cart.forEach((item) => {
      const product = siteData.products.find((p) => p.id === item.productId);
      if (!product) {
        console.error("Produit non trouvé dans le panier.");
        return;
      }

      const li = document.createElement("li");
      li.innerHTML = `
                <img src="${product.image}" alt="${
        product.name
      }">
                ${product.name} (x${item.quantity}) - ${(
        item.quantity * product.price
      ).toFixed(2)} €
                <button onclick="supprimerDuPanier(${
                  product.id
                })">Supprimer</button>
            `;
      panierContainer.appendChild(li);
      total += item.quantity * product.price;
    });

    document.getElementById("total").innerText = total.toFixed(2);
  }
}

function appliquerCodePromo() {
  const codePromo = document.getElementById("code-promo").value;
  let reduction = 0;

//Pours ajouter des codes promo pour nos utilisateurs
  if (codePromo === "mitMISA") {
    reduction = 20;
  } else if (codePromo === "misaMIT") {
    reduction = 30;
  }

  const totalElement = document.getElementById("total");
  let total = parseFloat(totalElement.innerText);
  total = total - (total * reduction) / 100;
  totalElement.innerText = total.toFixed(2);
}

function afficherProduits(produits, page) {
  const produitsContainer = document.getElementById("liste-tous-produits");
  if (produitsContainer) {
    produitsContainer.innerHTML = "";
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = page * itemsPerPage;
    const produitsPage = produits.slice(startIndex, endIndex);

    produitsPage.forEach((product) => {
      const produitElement = creerElementProduit(product);
      produitsContainer.appendChild(produitElement);
    });

    afficherPagination(produits, page);
  }
}

function afficherPagination(produits, page) {
  const paginationContainer = document.getElementById("pagination");
  if (paginationContainer) {
    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(produits.length / itemsPerPage);

    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement("button");
      button.innerText = i;
      button.addEventListener("click", () => afficherProduits(produits, i));
      if (i === page) {
        button.disabled = true;
      }
      paginationContainer.appendChild(button);
    }
  }
}

function rechercherProduits() {
  const searchQuery = document.getElementById("search").value.toLowerCase();
  const produitsFiltres = siteData.products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery)
  );
  afficherProduits(produitsFiltres, 1);
}

function afficherPagePanier() {
  document.getElementById("produits-section").classList.add("hidden");
  document.getElementById("panier-section").classList.remove("hidden");
  afficherPanier();
}

function retournerAuxProduits() {
  document.getElementById("produits-section").classList.remove("hidden");
  document.getElementById("panier-section").classList.add("hidden");
}
