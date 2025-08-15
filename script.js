const btn = document.querySelector('.menu-btn');
const menu = document.querySelector('nav ul');
btn.addEventListener('click', () => {
  menu.classList.toggle('show');
});

const t = document.getElementById('theme');

function toggleTheme() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const newTheme = isLight ? 'dark' : 'light';
  const newIcon = isLight ? '🌙' : '☀️';

  document.documentElement.setAttribute('data-theme', newTheme);
  t.textContent = newIcon;
  localStorage.setItem('theme', newTheme);
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
    document.documentElement.setAttribute('data-theme', 'light');
    t.textContent = '☀️';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    t.textContent = '🌙';
  }
}

t.addEventListener('click', toggleTheme);

initTheme();


const navItems = document.querySelectorAll('nav li');

navItems.forEach(item => {
  item.addEventListener('mousemove', (e) => {
    const rect = item.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    item.style.transform = `translate(${x * 2}px, ${y * 2}px)`;
  });

  item.addEventListener('mouseleave', () => {
    item.style.transform = 'translate(0, 0)';
    item.style.transition = 'transform 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
    setTimeout(() => item.style.transition = '', 500);
  });
});