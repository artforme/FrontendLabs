document.addEventListener("DOMContentLoaded", function () {
  const burger = document.querySelector(".burger");
  const menu = document.querySelector(".navigation");
  const closeBtn = document.querySelector(".navigation__close");
  const links = menu?.querySelectorAll("a") ?? [];

  const openMenu = () => {
    burger.classList.add("active");
    menu.classList.add("active");
    document.body.classList.add("no-scroll");
    burger.setAttribute("aria-expanded", "true");
    menu.setAttribute("aria-hidden", "false");
  };

  const closeMenu = () => {
    burger.classList.remove("active");
    menu.classList.remove("active");
    document.body.classList.remove("no-scroll");
    burger.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-hidden", "true");
  };

  burger?.addEventListener("click", () => {
    if (menu.classList.contains("active")) closeMenu();
    else openMenu();
  });

  closeBtn?.addEventListener("click", closeMenu);

  menu?.addEventListener("click", (e) => {
    if (e.target === menu) closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("active")) {
      closeMenu();
    }
  });

  links.forEach((a) => a.addEventListener("click", closeMenu));
});
