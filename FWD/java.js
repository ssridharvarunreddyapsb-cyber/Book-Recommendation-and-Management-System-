/* ----------------
   LOGIN & NAVIGATION
---------------- */
function openLogin() {
  const loginDiv = document.getElementById("login");
  if (loginDiv) loginDiv.style.display = "flex";
}

function login() {
  const loginDiv = document.getElementById("login");
  const landingDiv = document.getElementById("landing");
  const dashboardDiv = document.getElementById("dashboard");

  if (loginDiv) loginDiv.style.display = "none";
  if (landingDiv) landingDiv.style.display = "none";
  if (dashboardDiv) dashboardDiv.style.display = "block";

  loadBooks(); // Refresh the list upon "logging in"
}

/* ----------------
   BOOK STORAGE (LOAD/REMOVE)
---------------- */
function loadBooks() {
  const grid = document.getElementById("myBooks");
  if (!grid) return;

  const books = JSON.parse(localStorage.getItem("myBooks")) || [];
  grid.innerHTML = "";

  books.forEach((book, index) => {
    // Priority: Saved cover URL > Open Library ID > Title Search
    const cover = book.cover || 
                 (book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : 
                 `https://covers.openlibrary.org/b/title/${encodeURIComponent(book.title)}-M.jpg`);

    const card = document.createElement("div");
    card.className = "book";
    card.innerHTML = `
      <img src="${cover}" onerror="this.src='https://via.placeholder.com/150x220?text=No+Cover'">
      <div class="book-info">
        <strong>${book.title}</strong>
        <div>${book.author}</div>
        <button class="remove-btn">Remove</button>
      </div>
    `;

    card.querySelector(".remove-btn").onclick = () => removeBook(index);
    grid.appendChild(card);
  });
}

function removeBook(index) {
  const books = JSON.parse(localStorage.getItem("myBooks")) || [];
  books.splice(index, 1);
  localStorage.setItem("myBooks", JSON.stringify(books));
  loadBooks();
}

/* ----------------
   RECOMMENDATIONS (API)
---------------- */
async function recommendBooks() {
  const genreInput = document.getElementById("recGenre");
  const grid = document.getElementById("recommendGrid");

  if (!genreInput || !grid) return;
  const genre = genreInput.value;

  if (!genre) {
    alert("Please select a genre");
    return;
  }

  grid.innerHTML = "<p>Finding books for you...</p>";

  try {
    // Fetching more than 5 so we can shuffle them for variety
    const response = await fetch(`https://openlibrary.org/search.json?subject=${encodeURIComponent(genre)}&limit=15`);
    const data = await response.json();
    
    grid.innerHTML = "";
    
    // Shuffle and pick exactly 5
    const docs = data.docs || [];
    const shuffled = docs.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    if (selected.length === 0) {
      grid.innerHTML = "No recommendations found for this genre.";
      return;
    }

    selected.forEach(book => {
      const title = book.title;
      const author = book.author_name ? book.author_name[0] : "Unknown Author";
      // Use cover_i if available, it's the most reliable way to get the right image
      const cover = book.cover_i 
        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` 
        : `https://covers.openlibrary.org/b/title/${encodeURIComponent(title)}-M.jpg`;

      const card = document.createElement("div");
      card.className = "book";
      card.innerHTML = `
        <img src="${cover}" onerror="this.src='https://via.placeholder.com/150x220?text=No+Cover'">
        <strong>${title}</strong>
        <div>${author}</div>
        <button class="add-btn">Add to My Books</button>
      `;

      card.querySelector(".add-btn").onclick = () => {
        addRecommended({ title, author, cover, genre });
      };

      grid.appendChild(card);
    });
  } catch (err) {
    grid.innerHTML = "Search failed. Check your connection.";
    console.error(err);
  }
}

function addRecommended(book) {
  const books = JSON.parse(localStorage.getItem("myBooks")) || [];
  const exists = books.some(b => b.title === book.title);

  if (!exists) {
    books.push(book);
    localStorage.setItem("myBooks", JSON.stringify(books));
    loadBooks();
  } else {
    alert("This book is already in your collection!");
  }
}

// Ensure the grid loads saved books when the page opens
document.addEventListener("DOMContentLoaded", loadBooks);