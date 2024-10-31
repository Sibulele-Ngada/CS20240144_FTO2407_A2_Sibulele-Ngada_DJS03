import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

let matches;
let booksDisplayed;

function displayBooks(books) {
  const fragment = document.createDocumentFragment();

  for (const { author, id, image, title } of books.slice(
    booksDisplayed,
    booksDisplayed + BOOKS_PER_PAGE
  )) {
    const element = document.createElement("button");
    element.classList = "preview";
    element.setAttribute("data-preview", id);

    element.innerHTML = `
              <img
                  class="preview__image"
                  src="${image}"
              />
              
              <div class="preview__info">
                  <h3 class="preview__title">${title}</h3>
                  <div class="preview__author">${authors[author]}</div>
              </div>
          `;

    fragment.appendChild(element);
  }

  document.querySelector("[data-list-items]").appendChild(fragment);
  booksDisplayed += BOOKS_PER_PAGE;
}

function updateUI(books) {
  displayBooks(books);
  document.querySelector("[data-list-button]").disabled = false;
  document.querySelector("[data-list-button]").innerText =
    `Show more (${books.length - booksDisplayed})`;

  if (books.length - booksDisplayed <= 0) {
    document.querySelector("[data-list-button]").innerText = `Show more (0)`;
    document.querySelector("[data-list-button]").disabled = true;
  }
}

function showResults(result) {
  document.querySelector("[data-list-items]").innerHTML = "";
  booksDisplayed = 0;
  updateUI(result);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function generateFilter(filter) {
  const filterName = filter === authors ? "Authors" : "Genres";

  const fragment = document.createDocumentFragment();
  const firstElement = document.createElement("option");
  firstElement.value = "any";
  firstElement.innerText = `All ${filterName}`;
  fragment.appendChild(firstElement);
  console.log;

  for (const [id, name] of Object.entries(filter)) {
    const element = document.createElement("option");
    element.value = id;
    element.innerText = name;
    fragment.appendChild(element);
  }

  document
    .querySelector(`[data-search-${filterName.toLowerCase()}]`)
    .appendChild(fragment);
}

function loadSearch() {
  generateFilter(genres);
  generateFilter(authors);
}

function toggleTheme(theme) {
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches &&
    theme === "night"
  ) {
    document.querySelector("[data-settings-theme]").value = "night";
    document.documentElement.style.setProperty("--color-dark", "255, 255, 255");
    document.documentElement.style.setProperty("--color-light", "10, 10, 20");
  } else {
    document.querySelector("[data-settings-theme]").value = "day";
    document.documentElement.style.setProperty("--color-dark", "10, 10, 20");
    document.documentElement.style.setProperty(
      "--color-light",
      "255, 255, 255"
    );
  }
}

function selectedBook(active, pathArray) {
  for (const node of pathArray) {
    if (active) break;

    if (node?.dataset?.preview) {
      let result = null;

      for (const singleBook of books) {
        if (result) break;
        if (singleBook.id === node?.dataset?.preview) result = singleBook;
      }

      active = result;
    }
  }

  if (active) {
    document.querySelector("[data-list-active]").open = true;
    document.querySelector("[data-list-blur]").src = active.image;
    document.querySelector("[data-list-image]").src = active.image;
    document.querySelector("[data-list-title]").innerText = active.title;
    document.querySelector("[data-list-subtitle]").innerText =
      `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
    document.querySelector("[data-list-description]").innerText =
      active.description;
  }
}

function search(filters) {
  const result = [];

  for (const book of books) {
    let genreMatch = filters.genre === "any";

    for (const singleGenre of book.genres) {
      if (genreMatch) break;
      if (singleGenre === filters.genre) {
        genreMatch = true;
      }
    }

    if (
      (filters.title.trim() === "" ||
        book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
      (filters.author === "any" || book.author === filters.author) &&
      genreMatch
    ) {
      result.push(book);
    }
  }

  matches = result;

  if (result.length < 1) {
    document
      .querySelector("[data-list-message]")
      .classList.add("list__message_show");
  } else {
    document
      .querySelector("[data-list-message]")
      .classList.remove("list__message_show");
  }

  showResults(result);
}

document.querySelector("[data-search-cancel]").addEventListener("click", () => {
  document.querySelector("[data-search-overlay]").open = false;
});

document
  .querySelector("[data-settings-cancel]")
  .addEventListener("click", () => {
    document.querySelector("[data-settings-overlay]").open = false;
  });

document.querySelector("[data-header-search]").addEventListener("click", () => {
  document.querySelector("[data-search-overlay]").open = true;
  document.querySelector("[data-search-title]").focus();
});

document
  .querySelector("[data-header-settings]")
  .addEventListener("click", () => {
    document.querySelector("[data-settings-overlay]").open = true;
  });

document.querySelector("[data-list-close]").addEventListener("click", () => {
  document.querySelector("[data-list-active]").open = false;
});

document
  .querySelector("[data-settings-form]")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    document.querySelector("[data-settings-overlay]").open = false;
    toggleTheme(theme);
  });

document
  .querySelector("[data-search-form]")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    document.querySelector("[data-search-overlay]").open = false;
    search(filters);
  });

document
  .querySelector("[data-list-button]")
  .addEventListener("click", () => updateUI(matches));

document
  .querySelector("[data-list-items]")
  .addEventListener("click", (event) => {
    const pathArray = Array.from(event.path || event.composedPath());
    let active = null;

    selectedBook(active, pathArray);
  });

function init() {
  matches = books;
  booksDisplayed = 0;
  loadSearch();
  updateUI(matches);
}

init();
