const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const resultsContainer = document.getElementById("results");
const message = document.getElementById("message");
// click on search button
searchBtn.addEventListener("click", handleSearch);
// press enter to search
searchInput.addEventListener("keyup", function (event) {
  if (event.key === "Enter") {
    handleSearch();
  }
});
let allMeals = []; // will store the full list of meals from the last search
function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    message.textContent = "Please type a dish name to search.";
    resultsContainer.innerHTML = "";
    return;
  }
  message.textContent = "Searching recipes...";
  resultsContainer.innerHTML = "";
  fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" +
      encodeURIComponent(query),
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (!data.meals) {
        message.textContent = "No recipes found. try another dish.";
        resultsContainer.innerHTML = "";

        document.getElementById("categoryBar").innerHTML = "";
        return;
      }
      allMeals = data.meals; //save all meals from this search
      message.textContent = "Found " + data.meals.length + "recipe(s).";
      buildCategoryBar(allMeals); // NEW
      displayResults(allMeals); // show all by default
      displayResults(data.meals);
    })
    .catch(function () {
      message.textContent = "Somthing went wrong. Please try again.";
      resultsContainer.innerHTML = "";
    });
}
function fetchDetails(id) {
  message.textContent = "Loading recipe details...";
  fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      if (!data.meals || !data.meals[0]) {
        message.textContent = "Unable to load details.";
        return;
      }
      showModal(data.meals[0]);
      message.textContent = "";
    })
    .catch(function () {
      message.textContent = "Somthing went wrong with fetching details.";
    });
}
function displayResults(meals) {
  resultsContainer.innerHTML = "";
  meals.forEach(function (meal) {
    const col = document.createElement("div");
    col.className = "col-12 col-sm-6 col-md-4 col-lg-3 d-flex";
    col.innerHTML = `
        <div class="card recipe-card h-100 w-100">
        <img src="${meal.strMealThumb}" class="card-img-top" alt="${meal.strMeal}">
        <div class="card-body d-flex flex-column">
        <h6 class=" card-title mb-2 fw-semihold">${meal.strMeal}</h6>
        <p class="card-text text-muted mb-2">
        ${meal.strArea || "World cuisine"} ${meal.strCategory || "Dish"}
        </p>
        <button class="btn btn-outline-primary btn-sm mt-auto view-btn" data-id="${meal.idMeal}">
        View details</button>
        </div>
    </div>
        `;
    resultsContainer.appendChild(col);
  });
}
function buildCategoryBar(meals) {
  const categoryBar = document.getElementById("categoryBar");
  categoryBar.innerHTML = "";
  // collect unique categories
  const categorySet = new Set();
  meals.forEach(function (meal) {
    if (meal.strCategory) {
      categorySet.add(meal.strCategory);
    }
  });
  // convert set to array and sort it
  const categories = Array.from(categorySet).sort();
  // always include an "All" button first
  let buttonsHtml = `<button class="btn btn-sm btn-secondary me-2 mb-2 category-btn" data-category="ALL">
    All
    </button>`;
  // create a button for each category
  categories.forEach(function (cat) {
    buttonsHtml += `
    <button class="btn btn-sm btn-outline-secondary me-2 mb-2 category-btn"
    data-category="${cat}">
    ${cat}
    </button>
    `;
  });
  categoryBar.innerHTML = buttonsHtml;
}
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("category-btn")) {
    const selectedCategory = event.target.getAttribute("data-category");

    const allButtons = document.querySelectorAll(".category-btn");
    allButtons.forEach(function (btn) {
      btn.classList.remove("btn-secondary");
      btn.classList.add("btn-outline-secondary");
    });

    event.target.classList.remove("btn-outline-secondary");
    event.target.classList.add("btn-secondary");

    if (selectedCategory === "All") {
      displayResults(allMeals);
      message.textContent = "Showing all " + allMeals.length + " recipe(s).";
    } else {
      const filtered = allMeals.filter(function (meal) {
        return meal.strCategory === selectedCategory;
      });
      displayResults(filtered);
      message.textContent =
        "Showing " +
        filtered.length +
        " recipe(s) in category: " +
        selectedCategory +
        ".";
    }
  }

  if (event.target.classList.contains("view-btn")) {
    const id = event.target.getAttribute("data-id");
    fetchDetails(id);
  }
});
document.addEventListener("click", function (event) {
  if (event.target.classList.contains("view-btn")) {
    const id = event.target.getAttribute("data-id");
    fetchDetails(id);
  }
});
