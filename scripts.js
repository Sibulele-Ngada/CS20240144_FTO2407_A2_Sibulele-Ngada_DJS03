//@ts-check

/**
 * The Book Connect site allows the user see, search for and select any book within the collection for viewing. It porvides the user with the publishing date, author, description and a picture of the cover on demand.
 */

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

import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

let matches;
let booksDisplayed;

const html = {
  theme: document.querySelector("[data-settings-theme]"),
};

/**
 * This function displays the books to the user for the to select
 * @param {Book} books
 */
function displayBooks(books) {
  try {
    const fragment = document.createDocumentFragment();

    // @ts-ignore
    for (const { author, id, image, title } of books.slice(
      booksDisplayed,
      booksDisplayed + BOOKS_PER_PAGE
    )) {
      const element = document.createElement("button");
      // @ts-ignore
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

    // @ts-ignore
    document.querySelector("[data-list-items]").appendChild(fragment);
    booksDisplayed += BOOKS_PER_PAGE;
  } catch (err) {
    console.error(`There's been an issue with displaying books - ${err}`);
  }
}

/**
 * This function updates the UI to show relevant books and show more button
 * @param {Array<Book>} books
 */
function updateUI(books) {
  try {
    // @ts-ignore
    displayBooks(books);
    // @ts-ignore
    document.querySelector("[data-list-button]").disabled = false;
    // @ts-ignore
    document.querySelector("[data-list-button]").innerText =
      `Show more (${books.length - booksDisplayed})`;

    if (books.length - booksDisplayed <= 0) {
      // @ts-ignore
      document.querySelector("[data-list-button]").innerText = `Show more (0)`;
      // @ts-ignore
      document.querySelector("[data-list-button]").disabled = true;
    }
  } catch (err) {
    console.error(`There's been an issue with updating the UI - ${err}`);
  }
}

/**
 * This function generates a list from which a user can selct an item to filter the books being displayed
 * @param {object} filter
 */
function generateFilter(filter) {
  try {
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

    // @ts-ignore
    document
      .querySelector(`[data-search-${filterName.toLowerCase()}]`)
      .appendChild(fragment);
  } catch (err) {
    console.error(
      `There's been an issue with generating a search filter - ${err}`
    );
  }
}

/**
 * This function loads the search function display
 */
function loadSearch() {
  generateFilter(genres);
  generateFilter(authors);
}

/**
 * This function toggles the theme of the site between day and night based on user selected settings
 * @param {string | FormDataEntryValue} theme
 */
function toggleTheme(theme) {
  try {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches &&
      theme === "night"
    ) {
      // @ts-ignore
      html.theme.value = "night";
      document.documentElement.style.setProperty(
        "--color-dark",
        "255, 255, 255"
      );
      document.documentElement.style.setProperty("--color-light", "10, 10, 20");
    } else {
      // @ts-ignore
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
 * This function selects and displays a specfic book from the preview
 * @param {Book} active
 * @param {Array} pathArray
 */
function selectedBook(active, pathArray) {
  try {
    for (const node of pathArray) {
      if (active) break;

      if (node?.dataset?.preview) {
        let result = null;

        for (const singleBook of books) {
          if (result) break;
          if (singleBook.id === node?.dataset?.preview) result = singleBook;
        }

        // @ts-ignore
        active = result;
      }
    }

    if (active) {
      // @ts-ignore
      document.querySelector("[data-list-active]").open = true;
      // @ts-ignore
      document.querySelector("[data-list-blur]").src = active.image;
      // @ts-ignore
      document.querySelector("[data-list-image]").src = active.image;
      // @ts-ignore
      document.querySelector("[data-list-title]").innerText = active.title;
      // @ts-ignore
      document.querySelector("[data-list-subtitle]").innerText =
        `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
      // @ts-ignore
      document.querySelector("[data-list-description]").innerText =
        active.description;
    }
  } catch (err) {
    console.error(`There's been an issue with selecting a book - ${err}`);
  }
}

/**
 * This function displays the results from a search
 * @param {Array<Book>} result
 */
function showResults(result) {
  try {
    // @ts-ignore
    document.querySelector("[data-list-items]").innerHTML = "";
    booksDisplayed = 0;
    matches = result;

    // @ts-ignore
    if (result.length < 1) {
      // @ts-ignore
      document
        .querySelector("[data-list-message]")
        .classList.add("list__message_show");
    } else {
      // @ts-ignore
      document
        .querySelector("[data-list-message]")
        .classList.remove("list__message_show");
    }

    // @ts-ignore
    updateUI(result);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    console.error(
      `There's been an issue with displaying search results - ${err}`
    );
  }
}

/**
 * This function performs the search based on user selected filters
 * @param {object} filters
 */
function search(filters) {
  try {
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

    // @ts-ignore
    showResults(result);
  } catch (err) {
    console.error(`There's been an issue with searching for results - ${err}`);
  }
}

try {
  /**
   * Close search overlay
   */
  // @ts-ignore
  document
    .querySelector("[data-search-cancel]")
    .addEventListener("click", () => {
      // @ts-ignore
      document.querySelector("[data-search-overlay]").open = false;
    });

  /**
   * Close settings overlay
   */
  // @ts-ignore
  document
    .querySelector("[data-settings-cancel]")
    .addEventListener("click", () => {
      // @ts-ignore
      document.querySelector("[data-settings-overlay]").open = false;
    });

  /**
   * Open search overlay
   */
  // @ts-ignore
  document
    .querySelector("[data-header-search]")
    .addEventListener("click", () => {
      // @ts-ignore
      document.querySelector("[data-search-overlay]").open = true;
      // @ts-ignore
      document.querySelector("[data-search-title]").focus();
    });

  /**
   * Open settings overlay
   */
  // @ts-ignore
  document
    .querySelector("[data-header-settings]")
    .addEventListener("click", () => {
      // @ts-ignore
      document.querySelector("[data-settings-overlay]").open = true;
    });

  /**
   * Close selected book overlay
   */
  // @ts-ignore
  document.querySelector("[data-list-close]").addEventListener("click", () => {
    // @ts-ignore
    document.querySelector("[data-list-active]").open = false;
  });

  /**
   * Handles settings form data and calls settings related functons like togggle theme
   */
  // @ts-ignore
  document
    .querySelector("[data-settings-form]")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      // @ts-ignore
      const formData = new FormData(event.target);
      const { theme } = Object.fromEntries(formData);
      // @ts-ignore
      document.querySelector("[data-settings-overlay]").open = false;
      toggleTheme(theme);
    });

  /**
   * Handles search form data and passes the filters to search() function
   */
  // @ts-ignore
  document
    .querySelector("[data-search-form]")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      // @ts-ignore
      const formData = new FormData(event.target);
      const filters = Object.fromEntries(formData);
      // @ts-ignore
      document.querySelector("[data-search-overlay]").open = false;
      search(filters);
    });

  /**
   * Extends page to show more books
   */
  // @ts-ignore
  document
    .querySelector("[data-list-button]")
    .addEventListener("click", () => updateUI(matches));

  /**
   * Opens overlay with details of selected book
   */
  // @ts-ignore
  document
    .querySelector("[data-list-items]")
    .addEventListener("click", (event) => {
      // @ts-ignore
      const pathArray = Array.from(event.path || event.composedPath());
      let active = null;

      // @ts-ignore
      selectedBook(active, pathArray);
    });
} catch (err) {
  console.error(`There's been an issue with an event listener - ${err}`);
}

/**
 * Initialises page when first loaded
 */
function init() {
  matches = books;
  booksDisplayed = 0;
  // @ts-ignore
  toggleTheme(html.theme.value);
  loadSearch();
  updateUI(matches);
}

init();
