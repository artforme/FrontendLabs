import"./navigation-menu-Bzy58E3s.js";const o="https://ceramic-api.onrender.com";function n(t){return`
    <div class="products__card"> <img src="${o}${t.image}" alt="${t.title}" class="products__image" loading="lazy">
      <div class="products__card-description">      
        <h3 class="products__title">${t.title}</h3>
        <p class="products__price">${t.price} ${t.currency}</p>
      </div>
    </div>
    `}async function a(){const t=await fetch(`${o}/api/products`);if(!t.ok)throw new Error(`Failed to fetch: ${t.status}`);return t.json()}async function i(t="tea"){const r=document.getElementById("products-grid");if(r){r.innerHTML=`
                    <div class="loading">
                      Loading...
                      <img src="/src/img/loading/timer.gif" alt="icon for load mode"/>
                    </div>
                    `;try{const c=(await a()).filter(s=>s.category===t);if(c.length===0){r.innerHTML='<div class="error">No products found in this category</div>';return}r.innerHTML=c.map(n).join("")}catch(e){console.error("Error rendering products:",e),r.innerHTML='<div class="error">Failed to load products</div>'}}}function d(){const t=document.querySelectorAll(".catalog__filter button");t.length&&t.forEach(r=>r.addEventListener("click",async()=>{t.forEach(c=>c.classList.remove("active")),r.classList.add("active");const e=r.dataset.category;await i(e)}))}document.addEventListener("DOMContentLoaded",()=>{d(),i("tea")});
