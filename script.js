const btn = document.querySelector('.menu-btn');
  const menu = document.querySelector('nav ul');
  btn.addEventListener('click', () => {
    menu.classList.toggle('show');
  });