const SHEET_URL = 'https://script.google.com/macros/s/AKfycbygDqNYcqHDYeMkSbkZmO1HGEigNviLjEFni3jhMNG0i_27KQ78AHa6CkOX14rrtHKJMQ/exec';

let opened      = false;
let currentName = '';
let currentRsvp = '';

/* ════════════════════════════
   BACKGROUND CROSSFADE
════════════════════════════ */
const bgLayers = ['bg1', 'bg2', 'bg3'].map(id => document.getElementById(id));
const bgBrown  = document.getElementById('bgBrown');
let bgCycleStarted = false;

function startBgCycle() {
  if (bgCycleStarted) return;
  bgCycleStarted = true;

  let current = 0;
  bgLayers[current].style.opacity = '1';

  // Fade out brown as first colour layer fades in
  bgBrown.style.opacity = '0';

  setInterval(() => {
    bgLayers[current].style.opacity = '0';
    current = (current + 1) % bgLayers.length;
    bgLayers[current].style.opacity = '1';
  }, 4000);
}

/* ════════════════════════════
   NAME SCREEN
════════════════════════════ */
async function submitName() {
  const input = document.getElementById('nameInput');
  const name  = input.value.trim();
  if (!name) { flashInput(input); return; }

  const nextBtn = document.getElementById('nextBtn');
  nextBtn.textContent = 'checking...';
  nextBtn.disabled = true;

  try {
    const res   = await fetch(SHEET_URL);
    const names = await res.json();
    const match = names.find(n => n.toLowerCase() === name.toLowerCase());

    if (!match) {
      showMsg("Hmm, we don't have you on the guest list. Double-check your name!");
      nextBtn.textContent = 'Next →';
      nextBtn.disabled = false;
      return;
    }

    currentName = match;
    startBgCycle();

    // Personalise invite text
    document.getElementById('inviteText').innerHTML =
      `Dearest ${match},<br>You're invited to Kashev's birthday party on<br><strong>July 4th, 2026 from 4PM - 9PM!</strong><br><br>Will you be attending?`;

    // Personalise pledge text
    document.getElementById('pledgeText').innerHTML =
      `I <strong>${match}</strong> hereby understand the theme and will dress appropriately.`;

    // Transition to envelope screen
    document.getElementById('nameScreen').classList.add('hide');
    const envScreen = document.getElementById('envelopeScreen');
    envScreen.classList.remove('hidden');
    setTimeout(() => envScreen.classList.add('visible'), 50);

  } catch (err) {
    showMsg("Couldn't reach the guest list. Check your connection and try again.");
    nextBtn.textContent = 'Next →';
    nextBtn.disabled = false;
  }
}

function flashInput(input) {
  input.style.borderColor = '#c0392b';
  input.focus();
  setTimeout(() => input.style.borderColor = '', 800);
}

function showMsg(text) {
  const msg = document.getElementById('errorMsg');
  msg.textContent = text;
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 4000);
}

document.getElementById('nameInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') submitName();
});

/* ════════════════════════════
   ENVELOPE / SEAL
════════════════════════════ */
function breakSeal() {
  if (opened) return;
  opened = true;

  const seal    = document.getElementById('sealImg');
  const flap    = document.getElementById('flap');
  const envWrap = document.getElementById('envWrap');
  const card    = document.getElementById('card');
  const hint = document.getElementById('hint');
if (hint) hint.style.display = 'none';

  seal.classList.add('falling');
  setTimeout(() => flap.classList.add('open'), 380);
  setTimeout(() => card.classList.add('revealed'), 1400);
  setTimeout(() => envWrap.classList.add('dropping'), 1750);
  setTimeout(launchConfetti, 1950);
}

/* ════════════════════════════
   CARD 1 — RSVP
════════════════════════════ */
function handleCheck(choice) {
  document.getElementById('chkYes').checked = choice === 'yes';
  document.getElementById('chkNo').checked  = choice === 'no';
  currentRsvp = choice;
  document.getElementById('doneBtn').classList.add('show');
}

async function submitRsvp() {
  const doneBtn = document.getElementById('doneBtn');
  doneBtn.textContent = 'saving...';
  doneBtn.disabled = true;

  // Write RSVP to sheet
  try {
    await fetch(SHEET_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: currentName, rsvp: currentRsvp })
    });
  } catch (err) {
    console.warn('RSVP note:', err);
  }

  // Slide invite card off upward
  const card = document.getElementById('card');
  card.style.transition = 'transform 0.7s ease, opacity 0.5s ease';
  card.style.transform  = 'translate(-50%, -200vh)';
  card.style.opacity    = '0';
  card.style.pointerEvents = 'none';

  // Drop theme card in
  setTimeout(() => {
  if (currentRsvp === 'no') {
    document.getElementById('noCard').classList.add('dropped');
  } else {
    document.getElementById('themeCard').classList.add('dropped');
  }
}, 550);
}

/* ════════════════════════════
   CARD 2 — THEME PLEDGE
════════════════════════════ */
function handlePledge() {
  const checked = document.getElementById('chkPledge').checked;
  const btn = document.getElementById('themeDoneBtn');
  btn.classList.toggle('show', checked);
}

function submitTheme() {
  const themeCard = document.getElementById('themeCard');
  themeCard.style.transition = 'transform 0.7s ease, opacity 0.5s ease';
  themeCard.style.transform  = 'translate(-50%, -200vh)';
  themeCard.style.opacity    = '0';
  themeCard.style.pointerEvents = 'none';

  setTimeout(() => {
    document.getElementById('giftsCard').classList.add('dropped');
  }, 550);
}

function submitGifts() {
  const giftsCard = document.getElementById('giftsCard');
  giftsCard.style.transition = 'transform 0.7s ease, opacity 0.5s ease';
  giftsCard.style.transform  = 'translate(-50%, -200vh)';
  giftsCard.style.opacity    = '0';
  giftsCard.style.pointerEvents = 'none';

  setTimeout(() => {
    const msg = currentRsvp === 'yes'
      ? `See you there, ${currentName}!`
      : `We'll miss you, <strong>${currentName}</strong>.<br>Thanks for letting us know!`;
    document.getElementById('thankYouText').innerHTML = msg;
    document.getElementById('thankYouCard').classList.add('dropped');
    launchConfetti();
  }, 550);
}

/* ════════════════════════════
   CONFETTI
════════════════════════════ */
function launchConfetti() {
  const petals = ['images/blue-petal.png', 'images/pink-petal.png', 'images/yellow-petal.png'];
  for (let i = 0; i < 70; i++) {
    const p = document.createElement('img');
    p.className = 'cp';
    p.src = petals[Math.floor(Math.random() * petals.length)];
    p.style.left = Math.random() * 100 + 'vw';
    p.style.width = (20 + Math.random() * 20) + 'px';
    p.style.height = 'auto';
    p.style.animationDuration = (1.6 + Math.random() * 2) + 's';
    p.style.animationDelay = (Math.random() * 0.7) + 's';
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(p);
    p.addEventListener('animationend', () => p.remove());
  }
}