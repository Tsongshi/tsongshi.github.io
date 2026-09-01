(function () {
  "use strict";

  var STORAGE_KEY = "language-lab:method-03:v1";
  var MAX_PASSES = 22;

  var jobs = [
    { label: "Pass 01 · Meaning", title: "Listen once. What is the speaker trying to do?", help: "Do not chase every word. Find the main situation: greeting, ordering, sitting here, and closing." },
    { label: "Pass 02 · Chunks", title: "Read the four Spanish chunks and connect each one to its job.", help: "Point to the English job, then to the matching Spanish line. Meaning comes before speed." },
    { label: "Pass 03 · Sound map", title: "Listen again and move your finger with the Spanish text.", help: "Notice where one chunk ends and the next one begins. Do not speak yet." },
    { label: "Pass 04 · Echo", title: "Pause after each chunk and echo it once.", help: "Keep the rhythm. A short, clear echo is better than a fast, blurred one." },
    { label: "Pass 05 · Shadow", title: "Speak with the audio, quietly and one beat behind.", help: "Use the text as support. Let the sound lead; do not translate while speaking." },
    { label: "Pass 06 · Paper", title: "Write four memory cues: greet, drink, here, close.", help: "Write only cues, not the full script. The paper should help recall, not replace it." },
    { label: "Pass 07 · Partial recall", title: "Hide the Spanish and say the first two chunks.", help: "Try before you look. Then reveal the text and repair only the missing part." },
    { label: "Pass 08 · Full recall", title: "Use the four English jobs to say the whole scene.", help: "A pause is allowed. Looking first is not: retrieval begins with an honest attempt." },
    { label: "Pass 09 · Variation", title: "Change café con leche to tinto or aromática.", help: "Keep the sentence frame stable while one useful detail changes." },
    { label: "Pass 10 · Day-one check", title: "Say the scene once without text, then listen once to check.", help: "Mark this pass only after the check. Familiarity is not the same as recall." },
    { label: "Pass 11 · Return", title: "After a gap, listen without looking at the script.", help: "Can you still predict the four parts? The gap is part of the practice." },
    { label: "Pass 12 · Reconnect", title: "Shadow the full audio once with the Spanish visible.", help: "Use the text briefly to reconnect sound and spelling." },
    { label: "Pass 13 · Retrieval", title: "Hide the text and rebuild the script from four English cues.", help: "Try the whole scene before opening support." },
    { label: "Pass 14 · Repair", title: "Repeat only the weakest chunk three careful times.", help: "Do not restart everything if one small piece is the real problem." },
    { label: "Pass 15 · Personal version", title: "Choose your real drink and say the complete order.", help: "A prepared line becomes more usable when one detail is genuinely yours." },
    { label: "Pass 16 · Keyword cue", title: "Look only at your keyword. Can it start the Spanish scene?", help: "The keyword should open the action; it should not contain the answer." },
    { label: "Pass 17 · Audio check", title: "Listen once and notice one sound that differs from your memory.", help: "Choose one repair. More listening is not always the next best step." },
    { label: "Pass 18 · Timed recall", title: "Say the whole scene in one calm breath sequence.", help: "Do not race. The goal is a stable path with fewer searches." },
    { label: "Pass 19 · Social tone", title: "Say it again with a warm greeting and a clear por favor.", help: "Language use includes timing and tone, not words alone." },
    { label: "Pass 20 · Surprise cue", title: "Start from the middle: say “here, thank you,” then rebuild the rest.", help: "A flexible memory can enter from more than one point." },
    { label: "Pass 21 · Island test", title: "Without text or audio, perform the café scene once.", help: "Imagine the person in front of you. Use your chosen drink." },
    { label: "Pass 22 · Use plan", title: "Say the scene once more, then name where you will use it.", help: "The last mark closes the schedule. Real use, or a realistic role-play, tests the island." }
  ];

  var gapHints = {
    sound: "Last check: sound broke. Use the audio first, then echo only the weak chunk.",
    words: "Last check: words disappeared. Attempt recall, reveal one line, and try again.",
    order: "Last check: order changed. Use the four English job cues before the Spanish.",
    ready: "Last check: you could vary it. Keep support hidden and change one detail again."
  };

  var state = {
    keyword: "café conversation",
    cue: "When I make coffee tomorrow",
    action: "I will say the café script aloud twice",
    completed: 0,
    gap: "",
    drink: "un café con leche"
  };

  function clampPasses(value) {
    var number = Number(value);
    if (!Number.isFinite(number)) return 0;
    return Math.max(0, Math.min(MAX_PASSES, Math.floor(number)));
  }

  function cleanText(value, fallback, maxLength) {
    var text = String(value == null ? "" : value).replace(/\s+/g, " ").trim();
    return (text || fallback).slice(0, maxLength);
  }

  function loadState() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved || typeof saved !== "object") return;
      state.keyword = cleanText(saved.keyword, state.keyword, 60);
      state.cue = cleanText(saved.cue, state.cue, 100);
      state.action = cleanText(saved.action, state.action, 120);
      state.completed = clampPasses(saved.completed);
      state.gap = Object.prototype.hasOwnProperty.call(gapHints, saved.gap) ? saved.gap : "";
      state.drink = ["un café con leche", "un tinto", "una aromática"].indexOf(saved.drink) >= 0 ? saved.drink : state.drink;
    } catch (error) {
      // Storage can be unavailable in a private window. The Session still works in memory.
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // Keep the interaction usable even when storage is blocked.
    }
  }

  function byId(id) { return document.getElementById(id); }

  var keywordInput = byId("keyword-input");
  var cueInput = byId("cue-input");
  var actionInput = byId("action-input");
  var startCardOutput = byId("start-card-output");
  var buildCardButton = byId("build-card");
  var scriptGrid = byId("script-grid");
  var toggleScriptButton = byId("toggle-script");
  var audio = byId("cafe-audio");
  var playAudioButton = byId("play-audio");
  var playSlowButton = byId("play-slow");
  var currentDay = byId("current-day");
  var passCount = byId("pass-count");
  var dayTarget = byId("day-target");
  var jobLabel = byId("job-label");
  var jobTitle = byId("job-title");
  var jobHelp = byId("job-help");
  var completePassButton = byId("complete-pass");
  var undoPassButton = byId("undo-pass");
  var passMarks = byId("pass-marks");
  var variationOutput = byId("variation-output");
  var feedbackLine = byId("feedback-line");
  var sessionFinish = byId("session-finish");
  var resetButton = byId("reset-session");

  if (!keywordInput || !cueInput || !actionInput || !passMarks) return;

  function sentence(text) {
    return /[.!?]$/.test(text) ? text : text + ".";
  }

  function renderStartCard() {
    keywordInput.value = state.keyword;
    cueInput.value = state.cue;
    actionInput.value = state.action;
    startCardOutput.replaceChildren();
    var label = document.createElement("span");
    label.textContent = "Keyword · " + state.keyword;
    var plan = document.createElement("strong");
    plan.textContent = sentence(state.cue) + " " + sentence(state.action);
    startCardOutput.append(label, plan);
  }

  function dayForPass(index) {
    if (index < 10) return 1;
    if (index < 15) return 2;
    if (index < 20) return 3;
    return 4;
  }

  function dayStatus(completed) {
    if (completed < 10) return { day: 1, done: completed, target: 10 };
    if (completed < 15) return { day: 2, done: completed - 10, target: 5 };
    if (completed < 20) return { day: 3, done: completed - 15, target: 5 };
    return { day: 4, done: Math.min(2, completed - 20), target: 2 };
  }

  function buildMarks() {
    passMarks.replaceChildren();
    jobs.forEach(function (_, index) {
      var item = document.createElement("li");
      item.className = "day-" + dayForPass(index);
      item.textContent = String(index + 1).padStart(2, "0");
      item.setAttribute("aria-label", "Pass " + (index + 1));
      passMarks.appendChild(item);
    });
  }

  function renderProgress() {
    var progress = dayStatus(state.completed);
    currentDay.textContent = "Day " + String(progress.day).padStart(2, "0");
    passCount.textContent = String(state.completed);
    dayTarget.textContent = progress.done + " / " + progress.target;

    Array.prototype.forEach.call(passMarks.children, function (item, index) {
      item.classList.toggle("is-done", index < state.completed);
      item.classList.toggle("is-current", index === state.completed && state.completed < MAX_PASSES);
      item.setAttribute("aria-label", "Pass " + (index + 1) + (index < state.completed ? ", completed" : index === state.completed ? ", current" : ", not completed"));
    });

    if (state.completed >= MAX_PASSES) {
      jobLabel.textContent = "Schedule complete · 22 / 22";
      jobTitle.textContent = "The counter is full. Test the scene again tomorrow without this page.";
      jobHelp.textContent = "Keep what you can retrieve and use. Repair the weak part instead of restarting all twenty-two passes.";
      completePassButton.disabled = true;
      sessionFinish.hidden = false;
    } else {
      var job = jobs[state.completed];
      jobLabel.textContent = job.label;
      jobTitle.textContent = job.title;
      jobHelp.textContent = job.help + (state.gap ? " " + gapHints[state.gap] : "");
      completePassButton.disabled = false;
      sessionFinish.hidden = true;
    }

    undoPassButton.disabled = state.completed === 0;
  }

  function renderVariation() {
    variationOutput.textContent = "Buenos días. Quisiera " + state.drink + ", por favor. Para tomar aquí, gracias. No, eso es todo.";
    Array.prototype.forEach.call(document.querySelectorAll(".variation"), function (button) {
      var selected = button.getAttribute("data-drink") === state.drink;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  function renderFeedback() {
    Array.prototype.forEach.call(document.querySelectorAll(".self-check button"), function (button) {
      var selected = button.getAttribute("data-gap") === state.gap;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    feedbackLine.textContent = state.gap ? gapHints[state.gap] : "Choose the most useful answer. It will set the next-pass hint.";
  }

  function renderAll() {
    renderStartCard();
    renderProgress();
    renderVariation();
    renderFeedback();
  }

  buildCardButton.addEventListener("click", function () {
    state.keyword = cleanText(keywordInput.value, "one Spanish scene", 60);
    state.cue = cleanText(cueInput.value, "When I start my next study break", 100);
    state.action = cleanText(actionInput.value, "I will say one short Spanish scene aloud", 120);
    saveState();
    renderStartCard();
  });

  [keywordInput, cueInput, actionInput].forEach(function (input) {
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        buildCardButton.click();
      }
    });
  });

  toggleScriptButton.addEventListener("click", function () {
    var hidden = scriptGrid.classList.toggle("is-hidden");
    toggleScriptButton.setAttribute("aria-expanded", hidden ? "false" : "true");
    toggleScriptButton.textContent = hidden ? "Show Spanish to check" : "Hide Spanish for recall";
  });

  function setAudioButtons(activeButton) {
    [playAudioButton, playSlowButton].forEach(function (button) {
      button.setAttribute("aria-pressed", button === activeButton ? "true" : "false");
    });
  }

  function playAt(rate, button) {
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.playbackRate = rate;
    setAudioButtons(button);
    var promise = audio.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () { setAudioButtons(null); });
    }
  }

  playAudioButton.addEventListener("click", function () { playAt(1, playAudioButton); });
  playSlowButton.addEventListener("click", function () { playAt(0.78, playSlowButton); });
  if (audio) {
    audio.addEventListener("ended", function () { setAudioButtons(null); });
    audio.addEventListener("pause", function () {
      if (audio.currentTime !== 0 && audio.currentTime < audio.duration) setAudioButtons(null);
    });
  }

  completePassButton.addEventListener("click", function () {
    if (state.completed >= MAX_PASSES) return;
    state.completed += 1;
    saveState();
    renderProgress();
  });

  undoPassButton.addEventListener("click", function () {
    if (state.completed <= 0) return;
    state.completed -= 1;
    saveState();
    renderProgress();
  });

  Array.prototype.forEach.call(document.querySelectorAll(".variation"), function (button) {
    button.addEventListener("click", function () {
      state.drink = button.getAttribute("data-drink") || state.drink;
      saveState();
      renderVariation();
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll(".self-check button"), function (button) {
    button.addEventListener("click", function () {
      state.gap = button.getAttribute("data-gap") || "";
      saveState();
      renderFeedback();
      renderProgress();
    });
  });

  resetButton.addEventListener("click", function () {
    var confirmed = window.confirm("Reset the keyword, plan, and all 22 local progress marks for Method 03?");
    if (!confirmed) return;
    state = {
      keyword: "café conversation",
      cue: "When I make coffee tomorrow",
      action: "I will say the café script aloud twice",
      completed: 0,
      gap: "",
      drink: "un café con leche"
    };
    try { localStorage.removeItem(STORAGE_KEY); } catch (error) { /* no-op */ }
    renderAll();
  });

  loadState();
  buildMarks();
  renderAll();
})();
