// ===== Ждём загрузки страницы =====
document.addEventListener('DOMContentLoaded', function () {

  // ===== 1. Бургер-меню =====
  const burger = document.getElementById('burger');
  const nav = document.getElementById('nav');

  if (burger && nav) {
    burger.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      burger.classList.toggle('is-active');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        burger.classList.remove('is-active');
      });
    });
  }

  // ===== 2. «В заявку» — добавление товара в список =====
  const addButtons = document.querySelectorAll('.card-product .btn-primary');

  addButtons.forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();

      const card = btn.closest('.card-product');
      if (!card) return;

      const title = card.querySelector('.card-product__title')?.textContent.trim() || '';
      const price = card.querySelector('.card-product__price')?.textContent.trim() || '';

      let list = [];
      try {
        list = JSON.parse(localStorage.getItem('requestList') || '[]');
      } catch (err) {
        list = [];
      }

      const exists = list.some(function (item) {
        return item.title === title;
      });

      if (exists) {
        btn.textContent = 'Уже в заявке';
        btn.disabled = true;
        setTimeout(function () {
          btn.textContent = 'В заявку';
          btn.disabled = false;
        }, 1500);
        return;
      }

      list.push({ title: title, price: price });
      localStorage.setItem('requestList', JSON.stringify(list));

      btn.textContent = 'Добавлено ✓';
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = 'В заявку';
        btn.disabled = false;
      }, 1500);
    });
  });

  // ===== 3. Плавная прокрутка по якорным ссылкам =====
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = link.getAttribute('href');
      if (href === '#' || href === '') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===== 4. Кнопка «Наверх» =====
  const toTop = document.createElement('button');
  toTop.className = 'to-top';
  toTop.setAttribute('aria-label', 'Наверх');
  toTop.innerHTML = '↑';
  document.body.appendChild(toTop);

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', function () {
    if (window.scrollY > 400) {
      toTop.classList.add('is-visible');
    } else {
      toTop.classList.remove('is-visible');
    }
  });

  // ===== 5. Список товаров на странице заявки =====
  const requestListContainer = document.getElementById('requestList');

  if (requestListContainer) {

    function renderRequestList() {
      let list = [];
      try {
        list = JSON.parse(localStorage.getItem('requestList') || '[]');
      } catch (err) {
        list = [];
      }

      if (list.length === 0) {
        requestListContainer.innerHTML = `
          <div class="request-list__empty">
            Вы ещё не добавили товары. Перейдите в <a href="catalog.html">каталог</a> и нажмите «В заявку» на нужных позициях.
          </div>
        `;
        return;
      }

      let html = '<div class="request-list__items">';
      list.forEach(function (item, index) {
        html += `
          <div class="request-list__item">
            <div class="request-list__item-info">
              <div class="request-list__item-title">${item.title}</div>
              <div class="request-list__item-price">${item.price}</div>
            </div>
            <button class="request-list__item-remove" data-index="${index}" aria-label="Удалить">✕</button>
          </div>
        `;
      });
      html += '</div>';
      requestListContainer.innerHTML = html;

      requestListContainer.querySelectorAll('.request-list__item-remove').forEach(function (btn) {
        btn.addEventListener('click', function () {
          const index = parseInt(btn.getAttribute('data-index'), 10);
          let list = JSON.parse(localStorage.getItem('requestList') || '[]');
          list.splice(index, 1);
          localStorage.setItem('requestList', JSON.stringify(list));
          renderRequestList();
        });
      });
    }

    renderRequestList();

    const requestForm = document.getElementById('requestForm');
    if (requestForm) {
      requestForm.addEventListener('submit', function (e) {
        e.preventDefault();
        localStorage.removeItem('requestList');
        alert('Заявка отправлена! Мы свяжемся с вами в течение 15 минут.');
        renderRequestList();
        requestForm.reset();
      });
    }

  }

  // ===== 6. Уведомление о cookies (автоматически на всех страницах) =====
  const cookieAccepted = localStorage.getItem('cookieAccepted');

  if (!cookieAccepted) {
    const cookieNotice = document.createElement('div');
    cookieNotice.className = 'cookie-notice';
    cookieNotice.id = 'cookieNotice';
    cookieNotice.innerHTML = `
      <div class="cookie-notice__inner">
        <p class="cookie-notice__text">
          Мы используем файлы cookie для корректной работы сайта и анализа посещаемости.
          Продолжая использовать сайт, вы соглашаетесь с
          <a href="cookies.html">обработкой cookies</a>.
        </p>
        <button class="btn btn-primary cookie-notice__btn" id="cookieAccept">Принять</button>
      </div>
    `;
    document.body.appendChild(cookieNotice);

    setTimeout(function () {
      cookieNotice.classList.add('is-visible');
    }, 500);

    const acceptBtn = document.getElementById('cookieAccept');
    acceptBtn.addEventListener('click', function () {
      localStorage.setItem('cookieAccepted', 'true');
      cookieNotice.classList.remove('is-visible');
      setTimeout(function () {
        cookieNotice.remove();
      }, 300);
    });
  }
    // ===== 7. Фильтры в каталоге =====
  const productsGrid = document.getElementById('productsGrid');
  const applyFilters = document.getElementById('applyFilters');
  const resetFilters = document.getElementById('resetFilters');

  if (productsGrid && applyFilters && resetFilters) {
    const allProducts = productsGrid.querySelectorAll('.card-product');
    const filterInputs = document.querySelectorAll('.filter-input');

    function filterProducts() {
      // Собираем выбранные значения по каждому типу фильтра
      const selected = {
        category: [],
        age: [],
        material: [],
        purpose: []
      };

      filterInputs.forEach(function (input) {
        if (input.checked) {
          selected[input.dataset.filter].push(input.value);
        }
      });

      let visibleCount = 0;

      allProducts.forEach(function (card) {
        let matches = true;

        // Категория
        if (selected.category.length > 0) {
          if (!selected.category.includes(card.dataset.category)) {
            matches = false;
          }
        }

        // Материал
        if (matches && selected.material.length > 0) {
          if (!selected.material.includes(card.dataset.material)) {
            matches = false;
          }
        }

        // Возраст (пересечение)
        if (matches && selected.age.length > 0) {
          const cardAges = card.dataset.age.split(' ');
          const hasMatch = selected.age.some(function (a) {
            return cardAges.includes(a);
          });
          if (!hasMatch) matches = false;
        }

        // Назначение (пересечение)
        if (matches && selected.purpose.length > 0) {
          const cardPurposes = card.dataset.purpose.split(' ');
          const hasMatch = selected.purpose.some(function (p) {
            return cardPurposes.includes(p);
          });
          if (!hasMatch) matches = false;
        }

        if (matches) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      // Обновляем счётчик
      const countEl = document.querySelector('.catalog-toolbar__count strong');
      if (countEl) {
        countEl.textContent = visibleCount;
      }

      // Если ничего не найдено
      let emptyMsg = document.getElementById('emptyFiltersMsg');
      if (visibleCount === 0) {
        if (!emptyMsg) {
          emptyMsg = document.createElement('div');
          emptyMsg.id = 'emptyFiltersMsg';
          emptyMsg.className = 'request-list__empty';
          emptyMsg.style.marginTop = '20px';
          emptyMsg.textContent = 'По выбранным фильтрам ничего не найдено. Попробуйте изменить параметры.';
          productsGrid.parentNode.appendChild(emptyMsg);
        }
        emptyMsg.style.display = '';
      } else if (emptyMsg) {
        emptyMsg.style.display = 'none';
      }
    }

    applyFilters.addEventListener('click', function (e) {
      e.preventDefault();
      filterProducts();
    });

    resetFilters.addEventListener('click', function (e) {
      e.preventDefault();
      filterInputs.forEach(function (input) {
        input.checked = false;
      });
      filterProducts();
    });
  }


});