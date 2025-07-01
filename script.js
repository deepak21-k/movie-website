const API_BASE = 'https://jsonfakery.com/movies/paginated';

const mainContainer = document.getElementById('main-container');
const modal = document.getElementById('modal');
const modalPoster = document.getElementById('modal-poster');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const modalCast = document.getElementById('modal-cast');
const closeBtn = document.querySelector('.close-btn');
const spinner = document.getElementById('spinner');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');

let currentPage = 1;
let lastPage = 1;
let allMovies = [];
let filteredMovies = [];
let currentSearch = '';

async function fetchMovies(page = 1) {
  showSpinner();
  try {
    const response = await fetch(`${API_BASE}?page=${page}`);
    if (!response.ok) throw new Error(`Failed to fetch movies (HTTP ${response.status})`);
    const data = await response.json();

    if (!data || !Array.isArray(data.data)) {
      throw new Error('API response format error: no "data" array');
    }
    allMovies = data.data;
    lastPage = data.meta && data.meta.last_page ? data.meta.last_page : 1;
    currentPage = data.meta && data.meta.current_page ? data.meta.current_page : 1;
    filterAndRender();
    updatePagination();
  } catch (err) {
    mainContainer.innerHTML = `<div class="error">Could not load movies. Please try again later.<br><small>${err.message}</small></div>`;
    pageInfo.textContent = '';
    prevBtn.disabled = true;
    nextBtn.disabled = true;
  } finally {
    hideSpinner();
  }
}

function filterAndRender() {
  const searchTerm = currentSearch.trim().toLowerCase();
  if (searchTerm) {
    filteredMovies = allMovies.filter(movie =>
      movie.original_title && movie.original_title.toLowerCase().includes(searchTerm)
    );
  } else {
    filteredMovies = allMovies.slice();
  }
  renderMovies(filteredMovies);
}

function renderMovies(movies) {
  mainContainer.innerHTML = '';
  if (!movies.length) {
    mainContainer.innerHTML = '<div class="error">No movies found.</div>';
    return;
  }
  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.style.backgroundImage = movie.poster_path ? `url('${movie.poster_path}')` : 'none';

    const overlay = document.createElement('div');
    overlay.className = 'movie-overlay';

    const title = document.createElement('div');
    title.className = 'movie-title';
    title.textContent = movie.original_title || 'Untitled';

    overlay.appendChild(title);
    card.appendChild(overlay);

    card.addEventListener('click', () => showModal(movie));
    mainContainer.appendChild(card);
  });
}

function showModal(movie) {
  modalPoster.src = movie.poster_path || '';
  modalPoster.alt = movie.original_title || 'Movie Poster';
  modalTitle.textContent = movie.original_title || 'Untitled';
  modalDescription.textContent = movie.overview || 'No description available.';
  modalCast.innerHTML = '';

  if (Array.isArray(movie.casts) && movie.casts.length) {
    movie.casts.slice(0, 10).forEach(member => { // Only 10 cast members
      const castDiv = document.createElement('div');
      castDiv.className = 'cast-member';

      const img = document.createElement('img');
      img.className = 'cast-img';
      img.src = member.profile_path || '';
      img.alt = member.name || 'Cast member';

      const name = document.createElement('div');
      name.className = 'cast-name';
      name.textContent = member.name || 'Unknown';

      castDiv.appendChild(img);
      castDiv.appendChild(name);
      modalCast.appendChild(castDiv);
    });
  } else {
    modalCast.innerHTML = '<div style="color:#aaa;">No cast information.</div>';
  }

  modal.classList.remove('hidden');
}

function hideModal() {
  modal.classList.add('hidden');
}

function showSpinner() {
  spinner.classList.remove('hidden');
}
function hideSpinner() {
  spinner.classList.add('hidden');
}

closeBtn.addEventListener('click', hideModal);
window.addEventListener('click', (e) => {
  if (e.target === modal) hideModal();
});
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') hideModal();
});

function updatePagination() {
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= lastPage;
  pageInfo.textContent = `Page ${currentPage} of ${lastPage}`;
}

prevBtn.addEventListener('click', () => {
  if (currentPage > 1) fetchMovies(currentPage - 1);
});
nextBtn.addEventListener('click', () => {
  if (currentPage < lastPage) fetchMovies(currentPage + 1);
});

searchForm.addEventListener('submit', e => {
  e.preventDefault();
  currentSearch = searchInput.value;
  filterAndRender();
});

searchInput.addEventListener('input', () => {
  currentSearch = searchInput.value;
  filterAndRender();
});

fetchMovies();
