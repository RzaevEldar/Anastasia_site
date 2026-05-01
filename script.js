const emojiSky = document.querySelector(".emoji-sky");
const questionScreen = document.querySelector("#questionScreen");
const yesScreen = document.querySelector("#yesScreen");
const buttonZone = document.querySelector("#buttonZone");
const yesButton = document.querySelector("#yesButton");
const noButton = document.querySelector("#noButton");
const resetButton = document.querySelector("#resetButton");
const screenshotButton = document.querySelector("#screenshotButton");
const telegramButton = document.querySelector("#telegramButton");
const screenshotResult = document.querySelector("#screenshotResult");
const certificateImage = document.querySelector("#certificateImage");
const downloadCertificate = document.querySelector("#downloadCertificate");
const certificateNumberElement = document.querySelector("#certificateNumber");
const certificateDateElement = document.querySelector("#certificateDate");
const confirmationStatus = document.querySelector("#confirmationStatus");
const reaction = document.querySelector("#reaction");
const subtitle = document.querySelector("#subtitle");
const meterFill = document.querySelector("#meterFill");
const meterText = document.querySelector("#meterText");
const toast = document.querySelector("#toast");
const stickerButtons = [...document.querySelectorAll(".sticker-button")];
const noButtonHome = document.createComment("no-button-home");
noButton.after(noButtonHome);

const CERTIFICATE_NUMBER = "№ ОБН-001";
const CERTIFICATE_DATE = new Intl.DateTimeFormat("ru-RU").format(new Date());
const SIGNATURE_SRC = "assets/signature-cropped.png";
const floatingEmojis = ["🥺", "💖", "😽", "🫶", "💌", "💕", "😌", "✨", "😘", "🤍", "🌸", "💘"];
const stickerMessages = [
  "Скучаометр проснулся. Уже теплее.",
  "Добавлена одна порция милоты.",
  "Сердечный датчик доволен.",
  "Если тебе нравится, то мне тоже нравится.",
  "Уровень обнимательной тревоги растет.",
  "Если ты хочешь, то я тоже хочу.",
];
const evasiveLabels = [
  ["Нет", "💔"],
  ["Не-а", "🥲"],
  ["Точно?", "👀"],
  ["Мимо", "💅"],
  ["Ой", "🫢"],
  ["Сбежала", "🏃"],
  ["Не верю", "😌"],
  ["Занято", "🙈"],
  ["Ошибка", "💘"],
  ["Поздно", "✨"],
  ["Почти", "😇"],
  ["Сама нет", "🤭"],
];
const noReactions = [
  "Так, кнопка “нет” подозрительно нервничает.",
  "Она сама понимает, что это неправильный ответ.",
  "Комиссия по обнимашкам требует пересмотра ответа.",
  "Нет? Солнышко, это был технический сбой сердца.",
  "Кнопка увернулась, потому что правда где-то рядом.",
  "Все дороги ведут к “да”. Очень научный факт.",
  "Кнопка подала заявление на отпуск от неправильных ответов.",
  "Система не принимает такие показания без обнимашки.",
  "Отказ отклонен по причине слишком милого лица.",
  "Кнопка спряталась, потому что ей тоже хочется “да”.",
  "Проверка честности не пройдена. Требуется улыбка.",
  "Этот ответ улетел на романтическую доработку.",
  "Сердце говорит: попробуй другую кнопку.",
  "Нет исчезло. Осталось только признаться.",
];

let meterValue = 0;
let noAttempts = 0;
let answersUnlocked = false;
let toastTimer;

certificateNumberElement.textContent = CERTIFICATE_NUMBER;
certificateDateElement.textContent = CERTIFICATE_DATE;

function createFloatingEmoji(index) {
  const span = document.createElement("span");
  span.className = "floating-emoji";
  span.textContent = floatingEmojis[index % floatingEmojis.length];
  span.style.setProperty("--x", `${Math.random() * 100}%`);
  span.style.setProperty("--duration", `${9 + Math.random() * 8}s`);
  span.style.setProperty("--delay", `${Math.random() * -12}s`);
  span.style.setProperty("--drift", `${-70 + Math.random() * 140}px`);
  span.style.setProperty("--rotate", `${-18 + Math.random() * 36}deg`);
  emojiSky.appendChild(span);
}

function seedEmojiSky() {
  emojiSky.innerHTML = "";
  const count = window.matchMedia("(max-width: 680px)").matches ? 18 : 28;
  for (let index = 0; index < count; index += 1) {
    createFloatingEmoji(index);
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomBetween(min, max) {
  if (max <= min) {
    return min;
  }

  return Math.floor(min + Math.random() * (max - min));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 1700);
}

function setNoLabel(label) {
  const [text, emoji] = label;
  const icon = document.createElement("span");
  icon.textContent = emoji;

  noButton.replaceChildren(document.createTextNode(text), icon);
}

function setMeter(value) {
  meterValue = clamp(value, 0, 100);
  meterFill.style.width = `${meterValue}%`;
  meterText.textContent = `${meterValue}%`;

  if (meterValue >= 100) {
    unlockAnswers();
  }
}

function unlockAnswers() {
  if (answersUnlocked) {
    return;
  }

  answersUnlocked = true;
  buttonZone.classList.remove("is-locked");
  buttonZone.classList.add("is-unlocked");
  buttonZone.removeAttribute("aria-hidden");
  yesButton.disabled = false;
  noButton.disabled = false;
  reaction.textContent = "Скучаометр заполнен. Теперь можно отвечать.";
  subtitle.textContent = "Данные собраны: кто-то явно соскучился, осталось только признаться.";
}

function handleStickerClick(event) {
  const sticker = event.currentTarget;

  if (sticker.classList.contains("is-loved")) {
    return;
  }

  const boost = Number(sticker.dataset.boost) || 14;
  const usedCount = stickerButtons.filter((button) => button.classList.contains("is-loved")).length;

  sticker.classList.add("is-loved");
  sticker.setAttribute("aria-pressed", "true");
  sticker.disabled = true;
  setMeter(meterValue + boost);

  if (!answersUnlocked) {
    reaction.textContent = stickerMessages[usedCount % stickerMessages.length];
  }
}

function getNoButtonBounds(rect) {
  const padding = window.matchMedia("(max-width: 680px)").matches ? 10 : 16;

  return {
    minLeft: padding,
    minTop: padding,
    maxLeft: Math.max(padding, window.innerWidth - rect.width - padding),
    maxTop: Math.max(padding, window.innerHeight - rect.height - padding),
  };
}

function pinNoButtonToCurrentPosition() {
  const rect = noButton.getBoundingClientRect();
  const bounds = getNoButtonBounds(rect);

  if (noButton.parentElement !== document.body) {
    document.body.appendChild(noButton);
  }

  noButton.style.setProperty("--left", `${clamp(rect.left, bounds.minLeft, bounds.maxLeft)}px`);
  noButton.style.setProperty("--top", `${clamp(rect.top, bounds.minTop, bounds.maxTop)}px`);
  noButton.classList.add("is-running");
  void noButton.offsetWidth;
}

function returnNoButtonHome() {
  if (noButton.parentElement === document.body) {
    noButtonHome.before(noButton);
  }

  noButton.classList.remove("is-running");
  noButton.removeAttribute("style");
}

function pickNoButtonPosition() {
  const rect = noButton.getBoundingClientRect();
  const bounds = getNoButtonBounds(rect);
  const yesRect = yesButton.getBoundingClientRect();
  const safeGap = 96;

  for (let tries = 0; tries < 28; tries += 1) {
    const left = randomBetween(bounds.minLeft, bounds.maxLeft);
    const top = randomBetween(bounds.minTop, bounds.maxTop);
    const overlapsYes =
      left < yesRect.right + safeGap &&
      left + rect.width > yesRect.left - safeGap &&
      top < yesRect.bottom + safeGap &&
      top + rect.height > yesRect.top - safeGap;
    const movedEnough = Math.hypot(left - rect.left, top - rect.top) > 90;

    if (!overlapsYes && movedEnough) {
      return { left, top };
    }
  }

  return {
    left: rect.left < window.innerWidth / 2 ? bounds.maxLeft : bounds.minLeft,
    top: randomBetween(bounds.minTop, bounds.maxTop),
  };
}

function moveNoButton() {
  if (!answersUnlocked) {
    return;
  }

  if (!noButton.classList.contains("is-running")) {
    pinNoButtonToCurrentPosition();
  }

  const target = pickNoButtonPosition();
  window.requestAnimationFrame(() => {
    noButton.style.setProperty("--left", `${target.left}px`);
    noButton.style.setProperty("--top", `${target.top}px`);
  });
}

function clampRunningNoButton() {
  if (!noButton.classList.contains("is-running")) {
    return;
  }

  const rect = noButton.getBoundingClientRect();
  const bounds = getNoButtonBounds(rect);

  noButton.style.setProperty("--left", `${clamp(rect.left, bounds.minLeft, bounds.maxLeft)}px`);
  noButton.style.setProperty("--top", `${clamp(rect.top, bounds.minTop, bounds.maxTop)}px`);
}

function evadeNoButton(event) {
  event.preventDefault();
  noAttempts += 1;

  const label = evasiveLabels[noAttempts % evasiveLabels.length];
  const message = noReactions[(noAttempts - 1) % noReactions.length];

  setNoLabel(label);
  reaction.textContent = message;
  showToast(message);
  moveNoButton();
}

function burstHearts(originX = window.innerWidth / 2, originY = window.innerHeight / 2) {
  const hearts = ["💖", "💘", "💕", "✨", "🫶", "💌"];

  for (let index = 0; index < 38; index += 1) {
    const heart = document.createElement("span");
    heart.className = "heart-burst";
    heart.textContent = hearts[index % hearts.length];
    heart.style.setProperty("--x", `${originX}px`);
    heart.style.setProperty("--y", `${originY}px`);
    heart.style.setProperty("--dx", `${-220 + Math.random() * 440}px`);
    heart.style.setProperty("--dy", `${-260 + Math.random() * 180}px`);
    heart.style.setProperty("--spin", `${-120 + Math.random() * 240}deg`);
    heart.style.setProperty("--size", `${22 + Math.random() * 28}px`);
    document.body.appendChild(heart);
    window.setTimeout(() => heart.remove(), 950);
  }
}

function drawRoundRect(context, x, y, width, height, radius) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawCenteredText(context, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    if (context.measureText(testLine).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });

  lines.push(line);
  lines.forEach((currentLine, index) => {
    context.fillText(currentLine, x, y + index * lineHeight);
  });

  return y + lines.length * lineHeight;
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function createCertificateImage() {
  const canvas = document.createElement("canvas");
  const width = 1080;
  const height = 860;
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, "#ffe5ec");
  background.addColorStop(0.52, "#daf6ff");
  background.addColorStop(1, "#fff4bf");
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  context.save();
  drawRoundRect(context, 70, 70, width - 140, height - 140, 46);
  context.fillStyle = "rgba(255, 255, 255, 0.9)";
  context.fill();
  context.lineWidth = 6;
  context.setLineDash([18, 14]);
  context.strokeStyle = "rgba(215, 48, 97, 0.42)";
  context.stroke();
  context.restore();

  context.textAlign = "center";
  context.textBaseline = "middle";

  context.fillStyle = "#d73061";
  context.font = "800 34px Manrope, Arial, sans-serif";
  context.fillText("СЕРТИФИКАТ", width / 2, 150);

  context.fillStyle = "#6f6277";
  context.font = "800 28px Manrope, Arial, sans-serif";
  context.fillText(`${CERTIFICATE_NUMBER}   •   ${CERTIFICATE_DATE}`, width / 2, 202);

  context.fillStyle = "#251f2d";
  context.font = "700 76px Comfortaa, Manrope, Arial, sans-serif";
  let nextY = drawCenteredText(context, "На одну долгую обнимашку", width / 2, 298, 790, 88);

  context.fillStyle = "#6f6277";
  context.font = "800 34px Manrope, Arial, sans-serif";
  context.fillText("кому выдан: самой красивой девушке", width / 2, nextY + 28);

  context.fillStyle = "#d73061";
  context.font = "800 38px Manrope, Arial, sans-serif";
  nextY = drawCenteredText(context, "Если ты хочешь, то я тоже хочу.", width / 2, nextY + 104, 760, 50);

  context.fillStyle = "#6f6277";
  context.font = "700 30px Manrope, Arial, sans-serif";
  context.fillText("действует сразу после подтверждения", width / 2, nextY + 56);

  const signature = await loadImage(SIGNATURE_SRC);
  const signatureWidth = 340;
  const signatureHeight = (signature.height / signature.width) * signatureWidth;
  context.globalAlpha = 0.96;
  context.drawImage(signature, 570, nextY + 92, signatureWidth, signatureHeight);
  context.globalAlpha = 1;
  context.fillStyle = "#6f6277";
  context.font = "800 26px Manrope, Arial, sans-serif";
  context.textAlign = "left";
  context.fillText("подпись:", 290, nextY + 158);
  context.textAlign = "center";

  context.save();
  context.translate(252, nextY + 178);
  context.rotate((-12 * Math.PI) / 180);
  context.strokeStyle = "rgba(215, 48, 97, 0.82)";
  context.fillStyle = "rgba(215, 48, 97, 0.9)";
  context.lineWidth = 6;
  context.beginPath();
  context.arc(0, 0, 74, 0, Math.PI * 2);
  context.stroke();
  context.lineWidth = 3;
  context.beginPath();
  context.arc(0, 0, 53, 0, Math.PI * 2);
  context.stroke();
  context.font = "800 20px Manrope, Arial, sans-serif";
  context.fillText("ПОДТВЕРЖДЕНО", 0, 5);
  context.restore();

  context.font = "96px 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif";
  context.fillText("💖", width / 2, height - 118);

  context.font = "700 26px Manrope, Arial, sans-serif";
  context.fillStyle = "rgba(37, 31, 45, 0.56)";
  context.fillText("от Эльдара для Насти", width / 2, height - 30);

  return canvas.toDataURL("image/png");
}

async function makeCertificateScreenshot() {
  screenshotButton.disabled = true;
  screenshotButton.replaceChildren(document.createTextNode("Делаю скрин"), document.createTextNode(" ✨"));

  if (document.fonts?.ready) {
    await document.fonts.ready;
  }

  const dataUrl = await createCertificateImage();
  certificateImage.src = dataUrl;
  downloadCertificate.href = dataUrl;
  screenshotResult.classList.remove("is-hidden");
  telegramButton.classList.remove("is-hidden");
  confirmationStatus.classList.add("is-hidden");
  screenshotButton.replaceChildren(document.createTextNode("Скрин готов"), document.createTextNode(" ✅"));
  screenshotButton.disabled = false;
}

function markConfirmationWaiting() {
  confirmationStatus.classList.remove("is-hidden");
  telegramButton.replaceChildren(document.createTextNode("Жду подтверждение"), document.createTextNode(" 💖"));
}

function acceptYes(event) {
  const rect = yesButton.getBoundingClientRect();
  const originX = event?.clientX ?? rect.left + rect.width / 2;
  const originY = event?.clientY ?? rect.top + rect.height / 2;

  returnNoButtonHome();
  questionScreen.hidden = true;
  yesScreen.hidden = false;
  burstHearts(originX, originY);
}

function resetExperience() {
  meterValue = 0;
  noAttempts = 0;
  answersUnlocked = false;

  questionScreen.hidden = false;
  yesScreen.hidden = true;
  buttonZone.classList.add("is-locked");
  buttonZone.classList.remove("is-unlocked");
  buttonZone.setAttribute("aria-hidden", "true");
  yesButton.disabled = true;
  noButton.disabled = true;
  returnNoButtonHome();
  yesButton.removeAttribute("style");
  screenshotResult.classList.add("is-hidden");
  telegramButton.classList.add("is-hidden");
  certificateImage.removeAttribute("src");
  downloadCertificate.removeAttribute("href");
  confirmationStatus.classList.add("is-hidden");
  telegramButton.replaceChildren(document.createTextNode("Отправить для подтверждения"), document.createTextNode(" ✈️"));
  screenshotButton.disabled = false;
  screenshotButton.replaceChildren(document.createTextNode("Сделать скрин"), document.createTextNode(" 📸"));
  setNoLabel(["Нет", "💔"]);
  reaction.textContent = "Нажми на стикеры, чтобы разогнать скучаометр.";
  subtitle.textContent = "Ответ очень важен для отдела поцелуйчиков и срочных обнимашек.";
  meterFill.style.width = "0%";
  meterText.textContent = "0%";

  stickerButtons.forEach((sticker) => {
    sticker.classList.remove("is-loved");
    sticker.disabled = false;
    sticker.setAttribute("aria-pressed", "false");
  });
}

seedEmojiSky();
stickerButtons.forEach((sticker) => {
  sticker.setAttribute("aria-pressed", "false");
  sticker.addEventListener("click", handleStickerClick);
});

yesButton.addEventListener("click", acceptYes);
resetButton.addEventListener("click", resetExperience);
screenshotButton.addEventListener("click", makeCertificateScreenshot);
telegramButton.addEventListener("click", markConfirmationWaiting);

["pointerenter", "pointerdown", "focus"].forEach((eventName) => {
  noButton.addEventListener(eventName, evadeNoButton);
});

window.addEventListener("resize", () => {
  seedEmojiSky();
  clampRunningNoButton();
});
