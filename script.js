const SHEET_URL = 'https://script.google.com/macros/s/AKfycbygDqNYcqHDYeMkSbkZmO1HGEigNviLjEFni3jhMNG0i_27KQ78AHa6CkOX14rrtHKJMQ/exec';

let opened      = false;
let currentName = '';
let currentRsvp = '';

/* ════════════════════════════
   NAME SCREEN
════════════════════════════ */
async function submitName() {
  const input = document.getElementById('nameInput');
  const name  = input.value.trim();
  if (!name) { flashInput(input); return; }

  const nextBtn = document.getElementById('nextBtn');
  nextBtn.textContent = 'Checking...';
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

    // Personalise invite text
    document.getElementById('inviteText').innerHTML =
      `Dear <strong>${match}</strong>,<br>You're invited to Kashev's birthday party on<br>June ??, 2026 from 4PM – 9PM!<br><br>Will you be able to attend?`;

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
  const hint    = document.getElementById('hint');

  hint.style.display = 'none';
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
  doneBtn.textContent = 'Saving...';
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
    document.getElementById('themeCard').classList.add('dropped');
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
  // Slide theme card off upward
  const themeCard = document.getElementById('themeCard');
  themeCard.style.transition = 'transform 0.7s ease, opacity 0.5s ease';
  themeCard.style.transform  = 'translate(-50%, -200vh)';
  themeCard.style.opacity    = '0';
  themeCard.style.pointerEvents = 'none';

  // Drop thank you card in
  setTimeout(() => {
    const msg = currentRsvp === 'yes'
      ? `We're so excited to celebrate with you, <strong>${currentName}</strong>!<br>See you there!`
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