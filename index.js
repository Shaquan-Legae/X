const STORAGE_KEY = "x_clone_posts";
const MAX_CHARS = 280;
const AUTHOR = {
  username: "Shaquan Legae",
  handle: "@ShaquanLegae",
};

let posts = [];
const seedPosts = [
  {
    id: 1001,
    username: "NO CONTEXT HUMANS",
    handle: "@HumansNoContext",
    content: "This is exactly the kind of timeline chaos we signed up for.",
    timestamp: "Mar 24",
    likes: 19000,
    comments: 51,
    reposts: 1000,
    views: 324000,
    liked: false,
  },
  {
    id: 1002,
    username: "JK",
    handle: "@97Jungkukk",
    content: "Parody account",
    timestamp: "16h",
    likes: 324000,
    comments: 12,
    reposts: 408,
    views: 11200,
    liked: false,
  },
];

const feedContainer = document.getElementById("feed-container");
const tweetInput = document.getElementById("tweet-input");
const postBtn = document.getElementById("post-btn");
const charCount = document.getElementById("char-count");

const modal = document.getElementById("tweet-modal");
const openModalBtn = document.getElementById("open-modal-btn");
const closeModalBtn = document.getElementById("modal-close-btn");
const modalInput = document.getElementById("modal-tweet-input");
const modalPostBtn = document.getElementById("modal-post-btn");
const modalCharCount = document.getElementById("modal-char-count");

const navLinks = document.querySelectorAll(".nav-link");
const homeView = document.getElementById("home-view");
const exploreView = document.getElementById("explore-view");

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    posts = raw ? JSON.parse(raw) : [...seedPosts];
    if (!Array.isArray(posts)) posts = [];
    if (posts.length === 0) posts = [...seedPosts];
  } catch (error) {
    posts = [...seedPosts];
  }
}

function updateComposerState(input, button, counter) {
  const value = input.value.trim();
  counter.textContent = `${input.value.length}/${MAX_CHARS}`;
  button.disabled = value.length === 0 || input.value.length > MAX_CHARS;
}

function createPostObject(content) {
  return {
    id: Date.now(),
    username: AUTHOR.username,
    handle: AUTHOR.handle,
    content: content.trim(),
    timestamp: new Date().toLocaleString(),
    likes: 0,
    comments: 0,
    reposts: 0,
    views: 0,
    liked: false,
  };
}

function addPost(content) {
  if (!content || !content.trim()) return;
  if (content.length > MAX_CHARS) return;

  const newPost = createPostObject(content);
  posts.unshift(newPost);
  saveToStorage();
  renderPosts();
}

function deletePost(id) {
  posts = posts.filter((post) => post.id !== id);
  saveToStorage();
  renderPosts();
}

function toggleLike(id) {
  posts = posts.map((post) => {
    if (post.id !== id) return post;
    const liked = !post.liked;
    const likes = liked ? post.likes + 1 : Math.max(0, post.likes - 1);
    return { ...post, liked, likes };
  });
  saveToStorage();
  renderPosts();
}

function buildTweetCard(post) {
  const card = document.createElement("article");
  card.className = "tweet-card";

  const avatar = document.createElement("img");
  avatar.src = "resources/profile-pic.svg";
  avatar.alt = "Profile picture";
  avatar.width = 42;
  avatar.height = 42;
  avatar.className = "composer-avatar";

  const contentWrap = document.createElement("div");
  contentWrap.className = "tweet-content";

  const top = document.createElement("div");
  top.className = "tweet-top";
  top.innerHTML = `<div class="tweet-author"><strong>${post.username}</strong><span class="tweet-verify">●</span><span class="handle">${post.handle}</span><span class="timestamp">· ${post.timestamp}</span></div><button class="tweet-menu-btn" type="button" aria-label="More actions"><img src="resources/prof-more.svg" alt="" width="14" height="14"></button>`;

  const text = document.createElement("p");
  text.className = "tweet-text";
  text.textContent = post.content;

  const actions = document.createElement("div");
  actions.className = "tweet-actions";

  const likeBtn = document.createElement("button");
  likeBtn.type = "button";
  likeBtn.dataset.action = "like";
  likeBtn.dataset.id = String(post.id);
  likeBtn.className = post.liked ? "liked" : "";
  likeBtn.innerHTML = `<img src="resources/like.svg" alt="" width="16" height="16"><span>${formatCount(post.likes)}</span>`;

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "delete-btn";
  deleteBtn.dataset.action = "delete";
  deleteBtn.dataset.id = String(post.id);
  deleteBtn.textContent = "Delete";

  const commentBtn = document.createElement("button");
  commentBtn.type = "button";
  commentBtn.setAttribute("aria-label", "Comments");
  commentBtn.innerHTML = `<img src="resources/post-chat.svg" alt="" width="16" height="16"><span>${formatCount(post.comments || 0)}</span>`;

  const repostBtn = document.createElement("button");
  repostBtn.type = "button";
  repostBtn.setAttribute("aria-label", "Reposts");
  repostBtn.innerHTML = `<img src="resources/repost.svg" alt="" width="16" height="16"><span>${formatCount(post.reposts || 0)}</span>`;

  const viewsBtn = document.createElement("button");
  viewsBtn.type = "button";
  viewsBtn.setAttribute("aria-label", "Views");
  viewsBtn.innerHTML = `<img src="resources/stats.svg" alt="" width="16" height="16"><span>${formatCount(post.views || 0)}</span>`;

  actions.append(commentBtn, repostBtn, likeBtn, viewsBtn, deleteBtn);
  contentWrap.append(top, text, actions);
  card.append(avatar, contentWrap);
  return card;
}

function formatCount(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 100) / 10}K`;
  return String(value);
}

function renderPosts() {
  feedContainer.innerHTML = "";

  if (posts.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "";
    feedContainer.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  posts.forEach((post) => fragment.appendChild(buildTweetCard(post)));
  feedContainer.appendChild(fragment);
}

function closeModal() {
  modal.classList.remove("open");
}

function openModal() {
  modal.classList.add("open");
  modalInput.focus();
}

function switchView(view) {
  const isHome = view === "home";
  homeView.classList.toggle("active-view", isHome);
  exploreView.classList.toggle("active-view", !isHome);
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.view === view);
  });
}

postBtn.addEventListener("click", () => {
  addPost(tweetInput.value);
  tweetInput.value = "";
  updateComposerState(tweetInput, postBtn, charCount);
});

tweetInput.addEventListener("input", () => {
  updateComposerState(tweetInput, postBtn, charCount);
});

modalPostBtn.addEventListener("click", () => {
  addPost(modalInput.value);
  modalInput.value = "";
  updateComposerState(modalInput, modalPostBtn, modalCharCount);
  closeModal();
});

modalInput.addEventListener("input", () => {
  updateComposerState(modalInput, modalPostBtn, modalCharCount);
});

openModalBtn.addEventListener("click", openModal);
closeModalBtn.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    switchView(link.dataset.view);
  });
});

document.querySelectorAll(".home-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".home-tab").forEach((btn) => btn.classList.remove("active-tab"));
    tab.classList.add("active-tab");
  });
});

feedContainer.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "delete") deletePost(id);
  if (action === "like") toggleLike(id);
});

const hamburgerBtn = document.getElementById('hamburger-btn');
const leftAside = document.querySelector('aside');

hamburgerBtn.addEventListener('click', () => {
    leftAside.classList.toggle('active');
});

// Close aside if clicking outside
document.addEventListener('click', (e) => {
    if (!leftAside.contains(e.target) && !hamburgerBtn.contains(e.target)) {
        leftAside.classList.remove('active');
    }
});

loadFromStorage();
renderPosts();
updateComposerState(tweetInput, postBtn, charCount);
updateComposerState(modalInput, modalPostBtn, modalCharCount);

