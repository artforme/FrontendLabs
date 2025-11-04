import"./navigation-menu-CuVN_rmb.js";const n="https://ceramic-api.onrender.com";function r(t){return`
  <div class="blogs__card">
    <img
      src="${n}${t.image}"
      alt="${t.title}"
      class="blogs__image"
      loading="lazy"
    />
    <h2 class="blogs__title">${t.title}</h2>
    <button class="blogs__button">READ</button>
    <div class="blogs__text">${t.excerpt}</div>
  </div>
  `}async function e(){const t=await fetch(`${n}/api/posts`);if(!t.ok)throw new Error(`Failed to fetch: ${t.status}`);return t.json()}async function i(){const t=document.getElementById("blogs-grid");if(t){t.innerHTML=`
                    <div class="loading">
                      Loading...
                      <img src="/src/img/loading/timer.gif" alt="icon for load mode"/>
                    </div>
                    `;try{const o=await e();t.innerHTML=o.map(r).join("")}catch(o){console.error("Error rendering blog:",o),t.innerHTML='<div class="error">Failed to load blog</div>'}}}document.addEventListener("DOMContentLoaded",()=>{i()});
