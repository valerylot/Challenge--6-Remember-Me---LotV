// =====================================================================
// 📺 BINGE FINDER — scripts.js
// Day 14 · CHALLENGE · "Remember Me" 🧠 · STARTER
// ⏱️ about 90 minutes · solo or pairs
//
// THE MISSION 🕵️
//   Your Binge Finder remembers the theme and your ⭐ favorites.
//   Now make it remember EVEN MORE, and give users a way to make it forget.
//
// The new buttons are ALREADY in index.html and styled in styles.css.
// You only write JavaScript. Search for "✏️" to find every task.
// Run it: right-click index.html → Open with Live Server.
//
// THE 4 TASKS
//   ✏️ TASK 1 · Remember the last search          → a STRING
//   ✏️ TASK 2 · Show "⭐ 3 favorites" in the header → read the LIST
//   ✏️ TASK 3 · A 🧹 Forget me button              → removeItem
//   🏆 TASK 4 · BONUS: ⭐ Only favorites button     → filter the LIST
//
// THE RECIPE (same as this afternoon)
//   1. 📖 LOAD   2. 💾 SAVE   3. 🎨 SHOW
// =====================================================================


// ---------------------------------------------------------------------
// STEP 1 · Grab the page elements we need
// ---------------------------------------------------------------------
const searchInput = document.getElementById("search");
const statusEl = document.getElementById("status");
const listEl = document.getElementById("list");
const detailEl = document.getElementById("detail");
const themeBtn = document.getElementById("theme-btn");
const favCountEl = document.getElementById("fav-count");        // for TASK 2
const forgetBtn = document.getElementById("forget-btn");        // for TASK 3
const onlyFavsBtn = document.getElementById("only-favs-btn");   // for TASK 4

// All the shows live in this array once they load.
let allShows = [];

// ⭐ PART 2 · 📖 LOAD the saved favorites (a list of show ids)
// First visit? getItem → null → JSON.parse(null) → null → || [] → []
let favorites = JSON.parse(localStorage.getItem("binge-favorites")) || [];


// =====================================================================
// 📞 FETCHING (from Day 13, unchanged)
// =====================================================================

// ---------------------------------------------------------------------
// STEP 2 · The fetch recipe: order, check the plate, unwrap
// ---------------------------------------------------------------------
const BASE_URL = "https://api.tvmaze.com";

async function getJSON(path) {
  const res = await fetch(BASE_URL + path);

  if (!res.ok) {
    throw new Error(res.status + " on " + path);
  }

  return res.json();
}

function getShows() {
  return getJSON("/shows?page=0");
}

function getShow(id) {
  return getJSON("/shows/" + id);
}


// ---------------------------------------------------------------------
// STEP 3 · Clean up the data at the front door
// ---------------------------------------------------------------------
function toCard(raw) {
  return {
    id: raw.id,
    name: raw.name,
    genres: raw.genres ?? [],
    year: raw.premiered?.slice(0, 4) ?? "—",
    image: raw.image?.medium ?? null
  };
}

function stripTags(html) {
  return (html ?? "").replace(/<[^>]*>/g, "").trim();
}


// =====================================================================
// 🎨 DRAWING
// =====================================================================

// ---------------------------------------------------------------------
// STEP 4 · The 4 moods
// ---------------------------------------------------------------------
function setState(state, message) {
  statusEl.dataset.state = state;
  statusEl.textContent = message;
}


// ---------------------------------------------------------------------
// STEP 5 · Build ONE card (+ 🆕 a ☆ favorite button)
// ---------------------------------------------------------------------
function createCard(show) {
  const li = document.createElement("li");
  li.className = "card";

  const button = document.createElement("button");
  button.type = "button";
  button.className = "card__btn";
  button.dataset.id = show.id;

  if (show.image) {
    const img = document.createElement("img");
    img.src = show.image;
    img.alt = "";
    button.appendChild(img);
  } else {
    const noArt = document.createElement("span");
    noArt.className = "no-art";
    noArt.textContent = "🥔";
    button.appendChild(noArt);
  }

  const name = document.createElement("span");
  name.className = "card__name";
  name.textContent = show.name;
  button.appendChild(name);

  const meta = document.createElement("span");
  meta.className = "card__meta";
  meta.textContent = (show.genres.join(", ") || "Mystery genre") + " · " + show.year;
  button.appendChild(meta);

  li.appendChild(button);

  // ⭐ PART 2 · the favorite button
  // It goes NEXT TO the card button, not inside it.
  // (A button inside a button = clicking ☆ would also open the details.)
  const fav = document.createElement("button");
  fav.type = "button";
  fav.className = "fav";
  fav.dataset.id = show.id;            // remembers WHICH show → data-id="1"
  fav.textContent = starText(show.id); // "⭐ Favorite!" or "☆ Add to favorites"
  li.appendChild(fav);

  return li;
}


// ---------------------------------------------------------------------
// STEP 6 · Draw the whole list
// ---------------------------------------------------------------------
function renderList(shows) {
  listEl.textContent = "";

  for (const show of shows) {
    listEl.appendChild(createCard(show));
  }
}


// ---------------------------------------------------------------------
// STEP 7 · Draw the detail panel for ONE show
// ---------------------------------------------------------------------
function renderDetail(raw) {
  detailEl.textContent = "";

  const title = document.createElement("h3");
  title.textContent = raw.name;
  detailEl.appendChild(title);

  const info = document.createElement("p");
  info.textContent = "⭐ " + (raw.rating?.average ?? "n/a") + " · " + raw.status;
  detailEl.appendChild(info);

  const genres = document.createElement("p");
  genres.textContent = "🎬 " + ((raw.genres ?? []).join(", ") || "Mystery genre");
  detailEl.appendChild(genres);

  const summary = document.createElement("p");
  summary.className = "summary";
  summary.textContent = stripTags(raw.summary) || "No summary yet.";
  detailEl.appendChild(summary);
}


// =====================================================================
// 🧠 WIRING
// =====================================================================

// ---------------------------------------------------------------------
// STEP 8 · Load the shows and show every mood (from Day 13)
// ---------------------------------------------------------------------
async function loadShows() {
  setState("loading", "⏳ Grabbing the remote…");

  try {
    const raw = await getShows();
    allShows = raw.map(toCard);

    if (allShows.length === 0) {
      renderList([]);
      setState("empty", "🫥 The API sent zero shows.");
      return;
    }

    // ✏️ TASK 1c · 🎨 SHOW: instead of drawing ALL shows, draw the ones that
    //    match the search box:  const matches = filterShows(allShows, searchInput.value);
    //    then renderList(matches) and put matches.length in the message.
    renderList(allShows);
    setState("success", "🎉 " + allShows.length + " shows ready to binge.");
  } catch (err) {
    console.error(err);
    renderList([]);
    setState("error", "💥 Couldn't reach the TV. Check your Wi-Fi and reload.");
  }
  const matches = filterShows(allShows, searchInput.value);
  renderList(matches);
  setState("success", "🎉 " + matches.length + " shows ready to binge.");


}


// ---------------------------------------------------------------------
// STEP 9 · Click a card, see the details (one doorman in the lobby)
// ---------------------------------------------------------------------
listEl.addEventListener("click", async function (event) {
  const button = event.target.closest(".card__btn");
  if (!button) return;

  detailEl.textContent = "⏳ Loading details…";

  try {
    const raw = await getShow(button.dataset.id);
    renderDetail(raw);
  } catch (err) {
    console.error(err);
    detailEl.textContent = "💥 Couldn't load that show.";
  }
});


// ---------------------------------------------------------------------
// STEP 10 · Search without touching the network
// ---------------------------------------------------------------------
function filterShows(shows, query) {
  const q = query.trim().toLowerCase();
  if (!q) return shows;

  return shows.filter(function (show) {
    const nameMatches = show.name.toLowerCase().includes(q);
    const genreMatches = show.genres.some(function (genre) {
      return genre.toLowerCase().includes(q);
    });
    return nameMatches || genreMatches;
  });
}

searchInput.addEventListener("input", function () {
  // ✏️ TASK 1b · 💾 SAVE: save searchInput.value under the key "binge-search"

  const matches = filterShows(allShows, searchInput.value);
  renderList(matches);

  if (matches.length === 0) {
    setState("empty", '🫥 No shows match "' + searchInput.value.trim() + '".');
  } else {
    setState("success", "🎉 " + matches.length + " of " + allShows.length + " shows.");
  }

  searchInput = localStorage.setItem("binge-search", searchInput.value);
});


// =====================================================================
// 🌓 PART 1 · Remember the theme (a STRING)
// =====================================================================

// 📖 LOAD: if the locker says "light", put the light class on <body>.
if (localStorage.getItem("binge-theme") === "light") {
  document.body.classList.add("light");
}

// 💾 SAVE + 🎨 SHOW: flip the theme, then write down which one we're on.
themeBtn.addEventListener("click", function () {
  document.body.classList.toggle("light");  // on → off, off → on

  if (document.body.classList.contains("light")) {
    localStorage.setItem("binge-theme", "light");
  } else {
    localStorage.setItem("binge-theme", "dark");
  }
});



// =====================================================================
// ⭐ PART 2 · Remember favorite shows (a LIST)
// =====================================================================
// We already did 📖 LOAD at the top (the `favorites` line in STEP 1),
// and the ☆ button is drawn in createCard (STEP 5).

// What text should the star button show for this show id?
function starText(id) {
  if (favorites.includes(id)) {
    return "⭐ Favorite!";
  }
  return "☆ Add to favorites";
}

// A SECOND doorman in the same lobby. This one only cares about ☆ clicks.
// (The STEP 9 doorman looks for .card__btn, so it ignores these clicks.)
listEl.addEventListener("click", function (event) {
  const favBtn = event.target.closest(".fav");
  if (!favBtn) return;

  // ⚠️ data-id always gives back a STRING ("1"), but our ids are NUMBERS (1).
  //    [1, 2].includes("1") is FALSE! So we convert it once, right here.
  const id = Number(favBtn.dataset.id);

  // Already a favorite? Take it out. Not a favorite? Put it in.
  if (favorites.includes(id)) {
    favorites = favorites.filter(function (favId) {
      return favId !== id;
    });
  } else {
    favorites.push(id);
  }

  // 💾 SAVE: pack the list into a string 🧳 and put it in the locker.
  localStorage.setItem("binge-favorites", JSON.stringify(favorites));

  // 🎨 SHOW: update just this one button.
  favBtn.textContent = starText(id);

  // ✏️ TASK 2b · call updateFavCount() here, so the number changes on every ☆ click
  updateFavCount();
});



// =====================================================================
// ✏️ TASK 1 · Remember the last search (a STRING)
// =====================================================================
// 1a · 📖 LOAD: put the saved "binge-search" back in searchInput.value
//      (use || "" for the first visit)
// 1b · 💾 SAVE: go to the search listener in STEP 10
// 1c · 🎨 SHOW: go to loadShows in STEP 8
// ✅ CHECK: search "drama", reload → the box says drama AND only dramas show
searchInput.value = localStorage.getItem("binge-search") || "";



// =====================================================================
// ✏️ TASK 2 · Favorites counter: "⭐ 3 favorites"
// =====================================================================
// 2a · Write a function updateFavCount() that sets
//        favCountEl.textContent = "⭐ " + favorites.length + " favorites";
//      and call it once here, so the number shows on page load.
// 2b · go to the ☆ click listener in PART 2
// ✅ CHECK: star 2 shows → "⭐ 2 favorites". Reload → still 2.
function updateFavCount() {
  favCountEl.textContent = "⭐ " + favorites.length + " favorites";
};
updateFavCount();


// =====================================================================
// ✏️ TASK 3 · 🧹 Forget me
// =====================================================================
// When forgetBtn is clicked:
//   1. remove "binge-theme", "binge-favorites" and "binge-search"
//      ⚠️ Use removeItem, NOT localStorage.clear()! Why? (hint: Pizza Tracker 🍕)
//   2. location.reload();   ← reloads the page like a brand-new visit
// ✅ CHECK: star shows, search, go light → 🧹 → everything is back to new
function forgetSearch() {
  localStorage.removeItem("binge-theme");
  localStorage.removeItem("binge-favorites");
  localStorage.removeItem("binge-search");

  location.reload();
}
forgetBtn.addEventListener("click", forgetSearch);


// =====================================================================
// 🏆 TASK 4 · BONUS: ⭐ Only favorites
// =====================================================================
// When onlyFavsBtn is clicked, flip between two views:
//   ⭐ view: renderList( allShows.filter(...) ) → only shows where
//            favorites.includes(show.id), and set the button text to "📺 Show all"
//   📺 view: renderList(filterShows(allShows, searchInput.value)),
//            and set the button text back to "⭐ Only favorites"
// 💡 Hint: keep track with  let onlyFavs = false;  and flip it with  onlyFavs = !onlyFavs;




// ---------------------------------------------------------------------
// STEP 11 · Start the app!
// ---------------------------------------------------------------------
loadShows();
