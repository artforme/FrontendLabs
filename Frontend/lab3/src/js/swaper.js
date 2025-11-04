import Swiper from "swiper";

import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "/src/sass/blocks/swaper.scss";

document.addEventListener("DOMContentLoaded", () => {
  const swiper = new Swiper(".works__slider", {
    modules: [Navigation, Pagination],

    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,

    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },

    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },

    breakpoints: {
      769: {
        slidesPerView: 3,
      },
    },
  });
});
