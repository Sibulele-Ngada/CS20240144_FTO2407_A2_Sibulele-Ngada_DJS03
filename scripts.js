//@ts-check

import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

/**
 * @typedef {object} Book - An object representing a book to be displayed to the user
 * @prop {string} id - A unique value used to identify a book
 * @prop {Array} genres - An array of values representing the genres a book can be categorized by
 * @prop {Number} popularity - A number representing the popularity of a book out of 100
 * @prop {string} title - The title of a book
 * @prop {string} image - A link to an image of the cover of a book
 * @prop {string} description - A brief description of a book's contents
 * @prop {Number} pages - The number of pages in the book
 * @prop {string} published - The date the book was published
 * @prop {string} author - A unique value representing the author of a book
 */

/**
 * @typedef {object} Search
 * @prop {string} title
 * @prop {string} genre
 * @prop {string} author
 */

/**
 * Array of the current selection of books
 * @type {Array<Book>}
 */
let matches;

/**
 * Maximum number of books displayed on screen
 * @type {Number}
 */
let booksDisplayed;

/**
 * Collection of HTML elements
 * @type {Object.<PropertyDescriptor, HTMLElement>}
 */
const html = {
  fragment: document.createDocumentFragment(),
  theme: document.querySelector("[data-settings-theme]"),
  showMoreButton: document.querySelector("[data-list-button]"),
  bookList: document.querySelector("[data-list-items]"),
  activeBook: document.querySelector("[data-list-active]"),
  blur: document.querySelector("[data-list-blur]"),
  cover: document.querySelector("[data-list-image]"),
  title: document.querySelector("[data-list-title]"),
  subtitle: document.querySelector("[data-list-subtitle]"),
  description: document.querySelector("[data-list-description]"),
  closeBtn: document.querySelector("[data-list-close]"),
  message: document.querySelector("[data-list-message]"),
  searchBtn: document.querySelector("[data-header-search]"),
  searchCancelBtn: document.querySelector("[data-search-cancel]"),
  searchOverlay: document.querySelector("[data-search-overlay]"),
  searchTitle: document.querySelector("[data-search-title]"),
  searchForm: document.querySelector("[data-search-form]"),
  settingsBtn: document.querySelector("[data-header-settings]"),
  settingsCancelBtn: document.querySelector("[data-settings-cancel]"),
  settingsOverlay: document.querySelector("[data-settings-overlay]"),
  settingsForm: document.querySelector("[data-settings-form]"),
};

/**
 * Displays preview of books for user to select
 * @param {Array<Book>} books
 */
function displayBooks(books) {
  try {
    for (const { author, id, image, title } of books.slice(
      booksDisplayed,
      booksDisplayed + BOOKS_PER_PAGE
    )) {
      const element = document.createElement("button");
      element.className = "preview";
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

      html.fragment.appendChild(element);
    }

    html.bookList.appendChild(html.fragment);
    booksDisplayed += BOOKS_PER_PAGE;
  } catch (err) {
    console.error(`There's been an issue with displaying books - ${err}`);
  }
}

/**
 * Updates the UI to show relevant books and show more button
 * @param {Array<Book>} books
 */
function updateUI(books) {
  try {
    displayBooks(books);
    html.showMoreButton.disabled = false;
    html.showMoreButton.innerText = `Show more (${books.length - booksDisplayed})`;

    if (books.length - booksDisplayed <= 0) {
      html.showMoreButton.innerText = `Show more (0)`;
      html.showMoreButton.disabled = true;
    }
  } catch (err) {
    console.error(`There's been an issue with updating the UI - ${err}`);
  }
}

/**
 * Generates a list from which a user can select an item to filter the books being displayed
 * @param {object} filter
 * @param {string} name
 */
function generateFilter(filter, name) {
  try {
    const firstElement = document.createElement("option");
    firstElement.value = "any";
    firstElement.innerText = `All ${name}`;
    html.fragment.appendChild(firstElement);

    for (const [id, name] of Object.entries(filter)) {
      const element = document.createElement("option");
      element.value = id;
      element.innerText = name;
      html.fragment.appendChild(element);
    }

    // @ts-ignore
    document
      .querySelector(`[data-search-${name.toLowerCase()}]`)
      .appendChild(html.fragment);
  } catch (err) {
    console.error(
      `There's been an issue with generating a search filter - ${err}`
    );
  }
}

/**
 * Loads the search function display in header
 */
function loadSearch() {
  generateFilter(genres, "Genres");
  generateFilter(authors, "Authors");
}

/**
 * Toggles the theme of the site between day and night based on user selected settings
 * @param {FormDataEntryValue | string} theme
 */
function toggleTheme(theme) {
  try {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches &&
      theme === "night"
    ) {
      html.theme.value = "night";
      document.documentElement.style.setProperty(
        "--color-dark",
        "255, 255, 255"
      );
      document.documentElement.style.setProperty("--color-light", "10, 10, 20");
    } else {
      html.theme.value = "day";
      document.documentElement.style.setProperty("--color-dark", "10, 10, 20");
      document.documentElement.style.setProperty(
        "--color-light",
        "255, 255, 255"
      );
    }
  } catch (err) {
    console.error(`There's been an issue with toggling the theme - ${err}`);
  }
}

/**
 * Selects and displays a specfic book from the preview
 * @param {Array} pathArray
 */
function selectedBook(pathArray) {
  try {
    /**
     * @type {Book | null}
     */
    let active = null;

    // Selects and assigns active book from pathway of the event listener
    for (const node of pathArray) {
      if (active) break;

      if (node?.dataset?.preview) {
        for (const singleBook of books) {
          if (active) break;
          if (singleBook.id === node?.dataset?.preview) active = singleBook;
        }
      }
    }

    if (active) {
      html.activeBook.open = true;
      html.blur.src = active.image;
      html.cover.src = active.image;
      html.title.innerText = active.title;
      html.subtitle.innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
      html.description.innerText = active.description;
    }
  } catch (err) {
    console.error(`There's been an issue with selecting a book - ${err}`);
  }
}

/**
 * Displays the results from a search
 * @param {Array<Book>} result
 */
function showResults(result) {
  try {
    html.bookList.innerHTML = "";
    booksDisplayed = 0;
    matches = result;

    if (result.length < 1) {
      html.message.classList.add("list__message_show");
    } else {
      html.message.classList.remove("list__message_show");
    }

    updateUI(result);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error(
      `There's been an issue with displaying search results - ${err}`
    );
  }
}

/**
 * Performs the search based on user selected filters
 * @param {object} filters
 */
function search(filters) {
  try {
    /**
     * @type {Array<Book>}
     */
    const result = books.filter((match) => {
      const authorMatch =
        filters.author === "any" || filters.author === match.author;
      const titleMatch =
        filters.title.trim() === "" ||
        match.title.toLowerCase().includes(filters.title.toLowerCase());
      const genreMatch =
        filters.genre === "any" || match.genres.includes(filters.genre);

      if (titleMatch && authorMatch && genreMatch) return match;
    });

    showResults(result);
  } catch (err) {
    console.error(`There's been an issue with searching for results - ${err}`);
  }
}

// Event listeners
try {
  html.searchCancelBtn.addEventListener("click", () => {
    html.searchOverlay.open = false;
  });

  html.settingsCancelBtn.addEventListener("click", () => {
    html.settingsOverlay.open = false;
  });

  html.searchBtn.addEventListener("click", () => {
    html.searchOverlay.open = true;
    html.searchTitle.focus();
  });

  html.settingsBtn.addEventListener("click", () => {
    html.settingsOverlay.open = true;
  });

  html.closeBtn.addEventListener("click", () => {
    html.activeBook.open = false;
  });

  html.settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    html.settingsOverlay.open = false;
    toggleTheme(theme);
  });

  html.searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    html.searchOverlay.open = false;
    search(filters);
  });

  html.showMoreButton.addEventListener("click", () => updateUI(matches));

  html.bookList.addEventListener("click", (event) => {
    const pathArray = Array.from(event.composedPath());
    selectedBook(pathArray);
  });
} catch (err) {
  console.error(`There's been an issue with an event listener - ${err}`);
}

function init() {
  matches = books;
  booksDisplayed = 0;
  toggleTheme(html.theme.value);
  loadSearch();
  updateUI(matches);
}

init();
