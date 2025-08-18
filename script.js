const btn = document.querySelector('.menu-btn');
const menu = document.querySelector('nav ul');
btn.addEventListener('click', () => {
  menu.classList.toggle('show');
});


const theme = document.getElementById('theme');

function toggleTheme() {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const newTheme = isLight ? 'dark' : 'light';
  const newIcon = isLight ? '🌙' : '☀️';

  document.documentElement.setAttribute('data-theme', newTheme);
  theme.textContent = newIcon;
  localStorage.setItem('theme', newTheme);
}

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

  if (savedTheme === 'light' || (!savedTheme && prefersLight)) {
    document.documentElement.setAttribute('data-theme', 'light');
    theme.textContent = '☀️';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    theme.textContent = '🌙';
  }
}

theme.addEventListener('click', toggleTheme);

initTheme();


const navItems = document.querySelectorAll('nav li');
const strength = 3;

navItems.forEach(item => {
  item.style.willChange = 'transform';
  item.style.transition = 'transform 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
});

navItems.forEach(item => {
  let lastFrameTime = 0;

  item.addEventListener('mousemove', (e) => {
    const now = performance.now();
    if (now - lastFrameTime < 16) return;
    lastFrameTime = now;

    const rect = item.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const dampen = 0.7;
    const moveX = x * strength * dampen;
    const moveY = y * strength * dampen;

    item.style.transform = `translate(${moveX}px, ${moveY}px)`;
  });

  item.addEventListener('mouseleave', () => {
    item.style.transition = 'transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)';
    item.style.transform = 'translate(0, 0)';

    setTimeout(() => {
      item.style.transition = 'transform 0.5s cubic-bezier(0.18, 0.89, 0.32, 1.28)';
    }, 700);
  });
});


window.onscroll = function () { ScrollIndicator() };

function ScrollIndicator() {
  var winScroll = window.scrollY || window.pageYOffset;
  var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  var scrolled = (winScroll / height) * 100;
  if (winScroll) {
    document.querySelector("#progress-bar").style.opacity = 1;
  } else {
    document.querySelector("#progress-bar").style.opacity = 0;
  }

  document.querySelector('#progress-bar div.scrollNumber').innerHTML = Math.round(scrolled)
  document.querySelector('#progress-bar div.progress').style.height = scrolled + '%';
}


