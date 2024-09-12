document.addEventListener("DOMContentLoaded", async function () {
  const sectionItems = document.querySelectorAll(".section-item");
  const articlesList = document.getElementById("articles-list");
  const sectionTitle = document.createElement("h2");
  const sectionSelect = document.getElementById("section-select");

  // Obter o token CSRF
  let csrfToken = "";
  try {
    const csrfResponse = await fetch(
      "https://lojadeca.zendesk.com/hc/api/internal/csrf_token.json"
    );
    const csrfData = await csrfResponse.json();
    csrfToken = csrfData.current_session.csrf_token;
  } catch (error) {
    console.error("Erro ao obter o token CSRF:", error);
  }

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
        `https://lojadeca.zendesk.com/api/v2/help_center/sections/${sectionId}/articles.json`,
        {
          headers: {
            "X-CSRF-Token": csrfToken,
          },
        }
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
                  `https://lojadeca.zendesk.com/api/v2/help_center/articles/${article.id}.json`,
                  {
                    headers: {
                      "X-CSRF-Token": csrfToken,
                    },
                  }
                );
                const articleData = await articleResponse.json();
                articleBody.innerHTML = `
                  <div>${articleData.article.body}</div>
                  <div class="articles-footer">
                    <div class="articles-footer-container">
                      <span class="articles-votes-question">Esse artigo foi útil?</span>
                      <div class="articles-votes-controls" role="group" aria-labelledby="article-votes-label">
                        <button type="button" class="articles-vote articles-vote-up" data-helper="vote" data-item="article" data-type="up" data-id="${article.id}" aria-label="O artigo foi útil" aria-pressed="false">
                          <span class"visibility-hidden">Sim</span>
                        </button>
                        <button type="button" class="articles-vote articles-vote-down" data-helper="vote" data-item="article" data-type="down" data-id="${article.id}" aria-label="O artigo não foi útil" aria-pressed="false">
                          <span>Não</span>
                        </button>
                      </div>
                    </div>
                  </div>
                `;
                articleBody.style.display = "block";
                articleItem.classList.add("open");

                const voteButtons =
                  articleBody.querySelectorAll(".articles-vote");
                voteButtons.forEach((button) => {
                  button.addEventListener("click", async function () {
                    const voteType = this.dataset.type;
                    const articleId = this.dataset.id;
                    try {
                      const response = await fetch(
                        `https://lojadeca.zendesk.com/hc/pt-br/articles/${articleId}/vote`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-Token": csrfToken,
                          },
                          body: JSON.stringify({ value: voteType }),
                        }
                      );
                      if (response.ok) {
                        const data = await response.json();
                        console.log(data);
                        this.setAttribute("aria-pressed", "true");
                        this.classList.add("voted");
                        voteButtons.forEach((btn) => (btn.disabled = true));
                      }
                    } catch (error) {
                      console.error("Erro ao votar:", error);
                    }
                  });
                });
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
