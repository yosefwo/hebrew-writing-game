const voiceStyles = [
  { role: 'woman', pitch: 1.05, rate: 0.78 },
  { role: 'man', pitch: 0.76, rate: 0.76 },
  { role: 'boy', pitch: 1.22, rate: 0.84 },
  { role: 'girl', pitch: 1.42, rate: 0.86 }
];

let hebrewVoices = [];
let lastVoiceStyle = -1;

function refreshHebrewVoices() {
  hebrewVoices = speechSynthesis.getVoices().filter(voice =>
    /^he([_-]|$)/i.test(voice.lang)
  );
}

refreshHebrewVoices();
speechSynthesis.addEventListener?.('voiceschanged', refreshHebrewVoices);

function nextVoiceStyle() {
  if (voiceStyles.length === 1) return voiceStyles[0];
  let index;
  do index = Math.floor(Math.random() * voiceStyles.length);
  while (index === lastVoiceStyle);
  lastVoiceStyle = index;
  return voiceStyles[index];
}

function say(text, rate) {
  speechSynthesis.cancel();
  refreshHebrewVoices();

  const style = nextVoiceStyle();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'he-IL';
  utterance.rate = rate ?? style.rate;
  utterance.pitch = style.pitch;

  if (hebrewVoices.length) {
    const voiceIndex = Math.floor(Math.random() * hebrewVoices.length);
    utterance.voice = hebrewVoices[voiceIndex];
  }

  speechSynthesis.speak(utterance);
}

function genderedPraise(profile) {
  const isGirl = profile?.gender === 'girl';
  const choices = isGirl
    ? ['כל הכבוד', 'אלופה', 'גאונה', 'מדהימה', 'אין עלייך']
    : ['כל הכבוד', 'אלוף', 'גאון', 'מדהים', 'אין עליך'];
  return choices[Math.floor(Math.random() * choices.length)];
}

function praiseText() {
  const profile = getProfile();
  const praise = genderedPraise(profile);
  return profile?.name ? `${profile.name}, ${praise}!` : `${praise}!`;
}

function retryText() {
  return getProfile()?.gender === 'girl' ? 'נסי שוב' : 'נסה שוב';
}

function applause(message = praiseText()) {
  say(message);
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  [0, .11, .22, .34].forEach((time, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = [660, 880, 990, 1320][index];
    gain.gain.setValueAtTime(.08, context.currentTime + time);
    gain.gain.exponentialRampToValueAtTime(.001, context.currentTime + time + .18);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(context.currentTime + time);
    oscillator.stop(context.currentTime + time + .2);
  });
}
