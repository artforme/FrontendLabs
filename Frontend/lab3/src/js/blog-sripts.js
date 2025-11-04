import "/src/sass/style-blog.scss";

const API_BASE = "https://ceramic-api.onrender.com";

function blogToHTML(blog) {
  return `
  <div class="blogs__card">
    <img
      src="${API_BASE}${blog.image}"
      alt="${blog.title}"
      class="blogs__image"
      loading="lazy"
    />
    <h2 class="blogs__title">${blog.title}</h2>
    <button class="blogs__button">READ</button>
    <div class="blogs__text">${blog.excerpt}</div>
  </div>
  `;
}

async function fetchBlogs() {
  const res = await fetch(`${API_BASE}/api/posts`);

  if (!res.ok) {
    throw new Error(`Failed to fetch: ${res.status}`);
  }

  return res.json();
}

async function renderBlogs() {
  const grid = document.getElementById("blogs-grid");
  if (!grid) return;

  grid.innerHTML = `
                    <div class="loading">
                      Loading...
                      <img src="/src/img/loading/timer.gif" alt="icon for load mode"/>
                    </div>
                    `;

  try {
    const blog = await fetchBlogs();

    grid.innerHTML = blog.map(blogToHTML).join("");
  } catch (error) {
    console.error("Error rendering blog:", error);
    grid.innerHTML = `<div class="error">Failed to load blog</div>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderBlogs();
});
