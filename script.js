console.log("🎬 MovieZone script connected!");

// 🔑 TMDb API key
const API_KEY = "8b92ebbd0a40e72a59e5db5e45d5488b";

const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");
const movieContainer = document.getElementById("movieContainer");
const homeMovies = document.querySelector(".movies");

// 🔍 SEARCH HANDLER
searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();

  if (!query) {
    movieContainer.innerHTML = "<p>Please type a movie name or genre.</p>";
    return;
  }

  movieContainer.innerHTML = "<p>Loading movies...</p>";
  homeMovies.style.display = "none"; // hide home movies during search

  try {
    // 🔹 Check if it's a genre search
    const genreResponse = await fetch(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`
    );
    const genreData = await genreResponse.json();
    const genre = genreData.genres.find(
      (g) => g.name.toLowerCase() === query.toLowerCase()
    );

    const url = genre
      ? `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genre.id}`
      : `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
          query
        )}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results.length) {
      movieContainer.innerHTML = "<p>No results found.</p>";
      return;
    }

    // 🎥 Display movie cards
    movieContainer.innerHTML = data.results
      .map(
        (movie) => `
        <div class="movie-card" onclick="showTrailer(${movie.id})">
          <img src="https://image.tmdb.org/t/p/w500${
            movie.poster_path
          }" alt="${movie.title}">
          <h3>${movie.title}</h3>
          <p>⭐ ${movie.vote_average.toFixed(1)}</p>
        </div>
      `
      )
      .join("");
  } catch (err) {
    console.error(err);
    movieContainer.innerHTML =
      "<p>Error loading movies. Please try again later.</p>";
  }
});

// 🧠 ESCAPE HTML HELPER
function escapeHtml(str) {
  return str
    ? str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
    : "";
}

// 🎬 OPEN MODAL WITH TRAILER
function openModalWithContent({ title = "", overview = "", youtubeKey = "" } = {}) {
  const modal = document.getElementById("movieModal");
  const modalBody = modal.querySelector(".modal-content");

  modalBody.innerHTML = `
    <span id="closeModal" class="close">&times;</span>
    <h2>${escapeHtml(title)}</h2>
    ${
      youtubeKey
        ? `<div class="video-wrap">
            <iframe 
              src="https://www.youtube-nocookie.com/embed/${youtubeKey}?autoplay=1&modestbranding=1&rel=0&showinfo=0&controls=1" 
              frameborder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowfullscreen>
            </iframe>
           </div>`
        : `<p style="margin-top:12px;color:var(--muted)">No trailer available.</p>`
    }
    <p>${escapeHtml(overview || "No description available.")}</p>
  `;

  modal.style.display = "flex";
  modal.classList.add("show");
}

// ❌ CLOSE MODAL
function closeModal() {
  const modal = document.getElementById("movieModal");
  modal.style.display = "none";
  modal.classList.remove("show");
  const iframe = modal.querySelector("iframe");
  if (iframe) iframe.src = ""; // stop video playback
}

// 🖱️ Close modal when clicking X or outside
document.addEventListener("click", (e) => {
  if (e.target.id === "closeModal" || e.target.id === "movieModal") {
    closeModal();
  }
});

// 📽️ SHOW TRAILER FUNCTION
async function showTrailer(movieId) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos`
    );
    const data = await response.json();

    let youtubeKey = "";
    if (data.videos && Array.isArray(data.videos.results)) {
      const trailer = data.videos.results.find(
        (v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser")
      );
      if (trailer) youtubeKey = trailer.key;
    }

    openModalWithContent({
      title: data.title,
      overview: data.overview,
      youtubeKey,
    });
  } catch (error) {
    console.error("Error loading trailer:", error);
    openModalWithContent({
      title: "Error",
      overview: "Could not load movie details.",
    });
  }
}

console.log("✅ MovieZone ready!");

// -------------------------
// RANDOM MOVIE GENERATOR
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  const randomBtn = document.getElementById("random-movie-btn");
  const movieDisplay = document.getElementById("random-movie-display");
  const genreSelect = document.getElementById("random-movie-genre"); // dropdown select for genre

  if (!randomBtn) return;

  randomBtn.addEventListener("click", async () => {
    let genreId = "";
    let genreName = "";

    if (genreSelect && genreSelect.value) {
      // get genre ID from TMDb
      const genreResponse = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`
      );
      const genreData = await genreResponse.json();
      const genreObj = genreData.genres.find(
        (g) => g.name.toLowerCase() === genreSelect.value.toLowerCase()
      );
      if (genreObj) {
        genreId = genreObj.id;
        genreName = genreObj.name;
      }
    }

    // fetch random movie
    let url = genreId
      ? `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`
      : `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (!data.results || !data.results.length) {
        movieDisplay.textContent = "No movies found for this genre.";
        return;
      }

      const randomIndex = Math.floor(Math.random() * data.results.length);
      const selectedMovie = data.results[randomIndex];
      movieDisplay.textContent = `🎬 How about watching: ${selectedMovie.title} ${genreName ? `(${genreName})` : ""}?`;
    } catch (err) {
      console.error(err);
      movieDisplay.textContent = "Error fetching a random movie. Try again!";
    }
  });
});

// ===== LOGIN / SIGNUP SCRIPT =====
const loginBtn = document.getElementById('loginBtn');
const loginModal = document.getElementById('loginModal');
const closeLogin = document.getElementById('closeLogin');

loginBtn.addEventListener('click', () => {
  loginModal.classList.remove('hidden');
});

closeLogin.addEventListener('click', () => {
  loginModal.classList.add('hidden');
});

window.addEventListener('click', (e) => {
  if (e.target === loginModal) {
    loginModal.classList.add('hidden');
  }
});
