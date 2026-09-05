(function () {
  "use strict";

  var STORAGE_KEY = "language-lab:method-05:v1";
  var MAX_ROUNDS = 7;
  var stages = [
    { label: "Round 01 · Listen", title: "Listen to all five parts without reading.", help: "Hide the Spanish. Play all five parts. Say the main problem in one easy English sentence.", cue: false },
    { label: "Round 02 · Mark", title: "Mark pauses and four focus words.", help: "Use / for a short pause. Mark one focus word in each part. Do not mark every word.", cue: false },
    { label: "Round 03 · Echo", title: "Echo each part after the model.", help: "Play one part. Pause. Repeat it slowly. Keep the meaning and the sentence ending clear.", cue: false },
    { label: "Round 04 · Shadow", title: "Shadow the two hardest parts.", help: "Speak with the model. Stay close to its rhythm. Two careful rounds are enough.", cue: false },
    { label: "Round 05 · Project", title: "Say one part with a clear meeting voice.", help: "Turn the model off. Use level 2 or 3. Never shout. Stop if the voice feels raw or tired.", cue: false },
    { label: "Round 06 · Retell", title: "Hide the text and rebuild the logic.", help: "Use only the four cues. Pauses and simpler words are allowed. Looking first is not.", cue: true },
    { label: "Round 07 · Transfer", title: "Change the problem and speak again.", help: "Choose one fictional change below. Keep the four-part logic, but do not copy the original sentences.", cue: true }
  ];
  var gapHints = {
    sound: "Next time: play one focus word, then the sentence that contains it.",
    rhythm: "Next time: shadow only the hardest ten seconds twice.",
    words: "Next time: attempt from the four cues, reveal one line, then hide it again.",
    logic: "Next time: say the four English jobs before any Spanish.",
    transfer: "Next time: change only the problem first; keep the rest of the frame stable."
  };
  var state = { rounds: 0, voice: 2, gap: "" };

  function byId(id) { return document.getElementById(id); }
  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved || typeof saved !== "object") return;
      state.rounds = Math.max(0, Math.min(MAX_ROUNDS, Math.floor(Number(saved.rounds) || 0)));
      state.voice = [1, 2, 3].indexOf(Number(saved.voice)) >= 0 ? Number(saved.voice) : 2;
      state.gap = Object.prototype.hasOwnProperty.call(gapHints, saved.gap) ? saved.gap : "";
    } catch (error) { /* The session still works without storage. */ }
  }
  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) { /* Local-only fallback. */ }
  }

  var sharedAudio = byId("shared-audio");
  var chunkGrid = byId("chunk-grid");
  var focusPanel = byId("focus-panel");
  var toggleSpanish = byId("toggle-spanish");
  var playAll = byId("play-all");
  var completeRound = byId("complete-round");
  var undoRound = byId("undo-round");
  var progressNumber = byId("progress-number");
  var progressBar = byId("progress-bar");
  var roundLabel = byId("round-label");
  var roundTitle = byId("round-title");
  var roundHelp = byId("round-help");
  var cueLine = byId("cue-line");
  var finish = byId("finish");

  function setPlayingButton(button) {
    document.querySelectorAll(".audio-button").forEach(function (item) {
      item.classList.toggle("playing", item === button);
      item.textContent = item === button ? "■ Playing" : "▶ Listen";
    });
  }

  document.querySelectorAll(".audio-button").forEach(function (button) {
    button.addEventListener("click", function () {
      sharedAudio.pause();
      sharedAudio.onended = null;
      sharedAudio.src = button.getAttribute("data-audio");
      sharedAudio.playbackRate = 1;
      setPlayingButton(button);
      sharedAudio.play().catch(function () { setPlayingButton(null); });
    });
  });
  sharedAudio.addEventListener("ended", function () { setPlayingButton(null); });

  function audioPaths() {
    return Array.from(document.querySelectorAll("#chunk-grid .audio-button")).map(function (button) {
      return button.getAttribute("data-audio");
    });
  }
  function playSequence(paths, index) {
    if (index >= paths.length) { setPlayingButton(null); return; }
    sharedAudio.src = paths[index];
    var matching = document.querySelector('.audio-button[data-audio="' + paths[index] + '"]');
    setPlayingButton(matching);
    sharedAudio.onended = function () { playSequence(paths, index + 1); };
    sharedAudio.play().catch(function () { setPlayingButton(null); });
  }
  playAll.addEventListener("click", function () {
    sharedAudio.pause();
    playSequence(audioPaths(), 0);
  });

  toggleSpanish.addEventListener("click", function () {
    var hidden = chunkGrid.classList.toggle("hidden-spanish");
    focusPanel.classList.toggle("hidden-spanish", hidden);
    toggleSpanish.textContent = hidden ? "Show Spanish to check" : "Hide Spanish";
    toggleSpanish.setAttribute("aria-expanded", hidden ? "false" : "true");
  });

  function render() {
    progressNumber.textContent = state.rounds + " / " + MAX_ROUNDS;
    progressBar.style.width = (state.rounds / MAX_ROUNDS * 100) + "%";
    undoRound.disabled = state.rounds === 0;
    if (state.rounds >= MAX_ROUNDS) {
      roundLabel.textContent = "Session complete";
      roundTitle.textContent = "Test the four cues again tomorrow before playing audio.";
      roundHelp.textContent = state.gap ? gapHints[state.gap] : "Choose one useful gap below. It will define the next Session.";
      cueLine.hidden = false;
      completeRound.disabled = true;
      finish.hidden = false;
    } else {
      var stage = stages[state.rounds];
      roundLabel.textContent = stage.label;
      roundTitle.textContent = stage.title;
      roundHelp.textContent = stage.help + (state.gap ? " " + gapHints[state.gap] : "");
      cueLine.hidden = !stage.cue;
      completeRound.disabled = false;
      finish.hidden = true;
    }
    document.querySelectorAll("#voice-choices button").forEach(function (button) {
      button.classList.toggle("selected", Number(button.getAttribute("data-level")) === state.voice);
    });
    document.querySelectorAll("#gap-choices button").forEach(function (button) {
      button.classList.toggle("selected", button.getAttribute("data-gap") === state.gap);
    });
    byId("voice-feedback").textContent = state.voice === 1 ? "Good for a warm-up. Move to 2 when the words feel stable." : state.voice === 2 ? "Normal conversation is enough for most rounds." : "Clear and projected is the ceiling. If it is effortful, return to 2.";
    byId("gap-feedback").textContent = state.gap ? gapHints[state.gap] : "Choose after one honest hidden-text attempt.";
  }

  completeRound.addEventListener("click", function () { state.rounds = Math.min(MAX_ROUNDS, state.rounds + 1); save(); render(); });
  undoRound.addEventListener("click", function () { state.rounds = Math.max(0, state.rounds - 1); save(); render(); });
  document.querySelectorAll("#voice-choices button").forEach(function (button) {
    button.addEventListener("click", function () { state.voice = Number(button.getAttribute("data-level")); save(); render(); });
  });
  document.querySelectorAll("#gap-choices button").forEach(function (button) {
    button.addEventListener("click", function () { state.gap = button.getAttribute("data-gap"); save(); render(); });
  });

  document.querySelectorAll(".transfer-options button").forEach(function (button) {
    button.addEventListener("click", function () {
      document.querySelectorAll(".transfer-options button").forEach(function (item) { item.classList.toggle("selected", item === button); });
      byId("transfer-output").textContent = button.getAttribute("data-transfer") + " Las opiniones son diferentes porque ____. Organizamos tres pasos: ____, ____ y ____. La decisión depende de ____.";
    });
  });

  var recorder = null;
  var chunks = [];
  var recordingUrl = "";
  var recordButton = byId("record");
  var stopButton = byId("stop-recording");
  var playback = byId("recording-playback");
  var status = byId("recording-status");

  recordButton.addEventListener("click", async function () {
    if (!navigator.mediaDevices || !window.MediaRecorder) { status.textContent = "Recording is not supported in this browser."; return; }
    try {
      var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks = [];
      recorder = new MediaRecorder(stream);
      recorder.addEventListener("dataavailable", function (event) { if (event.data.size) chunks.push(event.data); });
      recorder.addEventListener("stop", function () {
        if (recordingUrl) URL.revokeObjectURL(recordingUrl);
        recordingUrl = URL.createObjectURL(new Blob(chunks, { type: recorder.mimeType || "audio/webm" }));
        playback.src = recordingUrl;
        playback.hidden = false;
        stream.getTracks().forEach(function (track) { track.stop(); });
        status.textContent = "Ready to compare. This recording disappears on reload.";
      });
      recorder.start();
      recordButton.disabled = true;
      stopButton.disabled = false;
      status.textContent = "Recording…";
    } catch (error) { status.textContent = "Microphone permission was not available."; }
  });
  stopButton.addEventListener("click", function () {
    if (recorder && recorder.state !== "inactive") recorder.stop();
    recordButton.disabled = false;
    stopButton.disabled = true;
  });

  byId("reset").addEventListener("click", function () {
    localStorage.removeItem(STORAGE_KEY);
    state = { rounds: 0, voice: 2, gap: "" };
    chunkGrid.classList.remove("hidden-spanish");
    focusPanel.classList.remove("hidden-spanish");
    toggleSpanish.textContent = "Hide Spanish";
    render();
  });

  load();
  render();
})();
