document.addEventListener("DOMContentLoaded", function () {
  const sectionItems = document.querySelectorAll(".section-item");
  const articlesList = document.getElementById("articles-list");
  const sectionTitle = document.createElement("h2");
  const sectionSelect = document.getElementById("section-select");

  async function loadArticles(sectionId, sectionName) {
    sectionTitle.textContent = sectionName;
    articlesList.innerHTML = "";
    articlesList.prepend(sectionTitle);

    sectionItems.forEach((item) => item.classList.remove("selected"));
    sectionSelect.value = sectionId;

    const selectedItem = document.querySelector(
      `.section-item[data-section-id="${sectionId}"]`
    );
    if (selectedItem) {
      selectedItem.classList.add("selected");
    }

    try {
      const response = await fetch(
        `https://lojadeca.zendesk.com/api/v2/help_center/sections/${sectionId}/articles.json`
      );
      const data = await response.json();
      const articles = data.articles;

      if (articles.length === 0) {
        articlesList.innerHTML += "<p>Não há artigos nesta seção.</p>";
      } else {
        articles.forEach((article) => {
          const articleItem = document.createElement("div");
          articleItem.className = "article-item";
          articleItem.textContent = article.title;
          articleItem.setAttribute("data-article-id", article.id);

          const accordionIcon = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
          );
          accordionIcon.setAttribute("viewBox", "0 0 24 24");
          accordionIcon.setAttribute("width", "24px");
          accordionIcon.setAttribute("height", "24px");
          accordionIcon.setAttribute("class", "accordion-icon");
          accordionIcon.innerHTML = `
              <g id="icon-seta">
                <rect id="Rectangle 14" x="12" y="16.9706" width="1.5" height="12" transform="rotate(-135 12 16.9706)" fill="#DBC79A"/>
                <rect id="Rectangle 15" x="3.51465" y="8.48523" width="1.5" height="12" transform="rotate(-45 3.51465 8.48523)" fill="#DBC79A"/>
              </g>
            `;

          const articleBody = document.createElement("div");
          articleBody.className = "article-body";

          articleItem.appendChild(accordionIcon);

          articleItem.addEventListener("click", async function () {
            document.querySelectorAll(".article-body").forEach((body) => {
              if (body !== articleBody) {
                body.style.display = "none";
                body.previousElementSibling.classList.remove("open");
              }
            });

            if (articleBody.innerHTML === "") {
              try {
                const articleResponse = await fetch(
                  `https://lojadeca.zendesk.com/api/v2/help_center/articles/${article.id}.json`
                );
                const articleData = await articleResponse.json();
                articleBody.innerHTML = `<div>${articleData.article.body}</div>`;
                articleBody.style.display = "block";
                articleItem.classList.add("open");
              } catch (error) {
                console.error("Erro ao carregar o artigo:", error);
                articleBody.innerHTML =
                  "<p>Erro ao carregar o conteúdo do artigo.</p>";
              }
            } else {
              articleBody.style.display =
                articleBody.style.display === "none" ? "block" : "none";
              articleItem.classList.toggle("open");
            }
          });

          articlesList.appendChild(articleItem);
          articlesList.appendChild(articleBody);
        });
      }
    } catch (error) {
      articlesList.innerHTML = "<p>Erro ao carregar artigos.</p>";
      console.error("Erro ao buscar artigos:", error);
    }
  }

  if (sectionItems.length > 0) {
    const firstSectionItem = sectionItems[0];
    const firstSectionId = firstSectionItem.getAttribute("data-section-id");
    const firstSectionName = firstSectionItem.textContent;
    loadArticles(firstSectionId, firstSectionName);
  }

  sectionItems.forEach((section) => {
    section.addEventListener("click", function () {
      const sectionId = this.getAttribute("data-section-id");
      const sectionName = this.textContent;
      loadArticles(sectionId, sectionName);
    });
  });

  sectionSelect.addEventListener("change", function () {
    const selectedOption = this.options[this.selectedIndex];
    const sectionId = selectedOption.value;
    const sectionName = selectedOption.textContent;
    loadArticles(sectionId, sectionName);
  });

  const sacButton = document.getElementById("sac-button");
  const sacInfo = document.getElementById("sac-info");

  sacButton.addEventListener("click", function () {
    sacInfo.style.display = sacInfo.style.display === "none" ? "block" : "none";
  });

  const atendimentoButton = document.querySelector(".header-callcenter-button");
  const contactOptionsSection = document.querySelector(".contact-options");

  atendimentoButton.addEventListener("click", function (e) {
    e.preventDefault();
    contactOptionsSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
    window.scrollBy(0, -110);
  });
});
