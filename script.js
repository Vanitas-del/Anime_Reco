const ANILIST_API = "https://graphql.anilist.co";
const watched = JSON.parse(localStorage.getItem("watchedAnimeIds") || "[]");

async function fetchAnime() {
  for (let i = 0; i < 10; i++) {
    const page = Math.floor(Math.random() * 5) + 1;
    const query = `
      query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: 50) {
          media(type: ANIME, sort: POPULARITY_DESC) {
            id
            title { romaji }
            description(asHtml: false)
            coverImage { large }
          }
        }
      }`;
    const variables = { page: page, perPage: 50 };

    try {
      const res = await fetch(ANILIST_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
      });
      const json = await res.json();
      const options = json.data.Page.media.filter(anime => !watched.includes(anime.id));
      if (options.length > 0) {
        return options[Math.floor(Math.random() * options.length)];
      }
    } catch (error) {
      console.error("API Error:", error);
    }
  }
  return null;
}

async function getRandomAnime() {
  document.getElementById("loading").style.display = "block";
  document.getElementById("anime-card").classList.add("hidden");

  const anime = await fetchAnime();

  if (anime) {
    document.getElementById("anime-image").src = anime.coverImage.large;
    document.getElementById("anime-title").textContent = anime.title.romaji;
    document.getElementById("anime-description").textContent = anime.description || "No description available.";
    document.getElementById("anime-card").dataset.id = anime.id;
    document.getElementById("anime-card").classList.remove("hidden");
  } else {
    alert("No more new anime to show!");
  }

  document.getElementById("loading").style.display = "none";
}

function markWatched() {
  const id = parseInt(document.getElementById("anime-card").dataset.id);
  if (!watched.includes(id)) {
    watched.push(id);
    localStorage.setItem("watchedAnimeIds", JSON.stringify(watched));
  }
  getRandomAnime();
}

window.onload = getRandomAnime;
