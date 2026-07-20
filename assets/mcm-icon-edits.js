  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.slider-23dsewscs').forEach(function (sliderContainer, index) {
      const swiperInstance = new Swiper(sliderContainer, {
        slidesPerView: 3.2,
        spaceBetween: 20,
        loop: false,
        grabCursor: true,
        navigation: {
          nextEl: sliderContainer.querySelector('.next-btn-w6v5t4'),
          prevEl: sliderContainer.querySelector('.prev-btn-x9y8z7'),
        },
        breakpoints: {
          0: {
            slidesPerView: 1.1,
            centeredSlides: true,
            spaceBetween: 10,
          },
          768: {
            slidesPerView: 2.1,
            centeredSlides: true,
            spaceBetween: 10,
          },
          1024: {
            slidesPerView: 3.2,
            centeredSlides: false,
          },
        }
      });

      const prevArrow = sliderContainer.querySelector('.prev-btn-x9y8z7');
      const nextArrow = sliderContainer.querySelector('.next-btn-w6v5t4');

      if (prevArrow && nextArrow) {
        sliderContainer.addEventListener('mousemove', (e) => {
          const distToPrev = Math.abs(e.clientX - prevArrow.getBoundingClientRect().left);
          const distToNext = Math.abs(e.clientX - nextArrow.getBoundingClientRect().left);

          if (distToPrev < distToNext) {
            prevArrow.classList.add('active');
            nextArrow.classList.remove('active');
          } else {
            nextArrow.classList.add('active');
            prevArrow.classList.remove('active');
          }
        });

        sliderContainer.addEventListener('mouseleave', () => {
          prevArrow.classList.remove('active');
          nextArrow.classList.remove('active');
        });
      }
    });
  });
document.querySelectorAll('.top_to').forEach(link => {
  link.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});
