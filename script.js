const SHEET_URL = 'https://script.google.com/macros/s/AKfycbygDqNYcqHDYeMkSbkZmO1HGEigNviLjEFni3jhMNG0i_27KQ78AHa6CkOX14rrtHKJMQ/exec';

let opened = false;

/* ── Name screen ── */
async function submitName() {
  const input = document.getElementById('nameInput');
  const name  = input.value.trim();

  if (!name) {
    flashError(input);
    return;
  }

  const nextBtn = document.getElementById('nextBtn');
  nextBtn.textContent = 'Checking...';
  nextBtn.disabled = true;

  try {
    const res   = await fetch(SHEET_URL);
    const names = await res.json();

    const match = names.find(n => n.toLowerCase() === name.toLowerCase());

    if (!match) {
      showNotOnList();
      nextBtn.textContent = 'Next →';
      nextBtn.disabled = false;
      return;
    }

    // Name found — write personalised invite and show envelope
    document.getElementById('inviteText').innerHTML =
      `Hello <strong>${match}</strong>,<br>you're invited to a birthday party!<br>Will you be able to attend?`;

    document.getElementById('nameScreen').classList.add('hide');

    const envScreen = document.getElementById('envelopeScreen');
    envScreen.classList.remove('hidden');
    setTimeout(() => envScreen.classList.add('visible'), 50);

  } catch (err) {
    // Network / fetch error
    showError('Couldn\'t reach the guest list. Check your connection and try again.');
    nextBtn.textContent = 'Next →';
    nextBtn.disabled = false;
  }
}

function flashError(input) {
  input.style.borderColor = '#c0392b';
  input.focus();
  setTimeout(() => input.style.borderColor = '', 800);
}

function showNotOnList() {
  const msg = document.getElementById('errorMsg');
  msg.textContent = "Hmm, we don't have you on the guest list. Double-check your name!";
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 4000);
}

function showError(text) {
  const msg = document.getElementById('errorMsg');
  msg.textContent = text;
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 4000);
}

// Allow Enter key on input
document.getElementById('nameInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') submitName();
});

/* ── Envelope / seal ── */
function breakSeal() {
  if (opened) return;
  opened = true;

  const seal    = document.getElementById('sealImg');
  const flap    = document.getElementById('flap');
  const envWrap = document.getElementById('envWrap');
  const card    = document.getElementById('card');
  const hint    = document.getElementById('hint');

  hint.style.display = 'none';

  seal.classList.add('falling');
  setTimeout(() => flap.classList.add('open'), 380);
  setTimeout(() => card.classList.add('revealed'), 1400);
  setTimeout(() => envWrap.classList.add('dropping'), 1750);
  setTimeout(launchConfetti, 1950);
}

function handleCheck(choice) {
  document.getElementById('chkYes').checked = choice === 'yes';
  document.getElementById('chkNo').checked  = choice === 'no';
}

function launchConfetti() {
  const colors = ['#f48fb1','#ce93d8','#90caf9','#a5d6a7','#fff176','#ffcc80','#ef9a9a'];
  for (let i = 0; i < 70; i++) {
    const p = document.createElement('div');
    p.className = 'cp';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = colors[Math.floor(Math.random() * colors.length)];
    p.style.animationDuration = (1.6 + Math.random() * 2) + 's';
    p.style.animationDelay   = (Math.random() * 0.7) + 's';
    p.style.width  = (6 + Math.random() * 10) + 'px';
    p.style.height = (6 + Math.random() * 10) + 'px';
    p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    document.body.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}