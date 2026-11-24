(function () {
  const voicePlayer = document.getElementById("voice-player");
  const toggleBtn = document.getElementById("btn-voice-toggle");
  const restartBtn = document.getElementById("btn-voice-restart");
  const seekBar = document.getElementById("voice-seek");
  const timeLabel = document.getElementById("voice-time");

  // بيانو هادئ جدًا عبر Web Audio API (بدون الحاجة لملف خارجي، ويعمل بعد لمسة المستخدم)
  let audioCtx = null;
  let ambientGain = null;
  let noteTimer = null;

  function ensureAmbientContext() {
    if (audioCtx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    audioCtx = new AudioContextClass();
    ambientGain = audioCtx.createGain();
    ambientGain.gain.value = 0.035; // هادئ وخافت جدًا
    ambientGain.connect(audioCtx.destination);

    // نغمات بيانو ناعمة متتابعة ببطء
    const notes = [261.63, 329.63, 392.0, 493.88, 392.0, 329.63];
    let idx = 0;

    noteTimer = window.setInterval(() => {
      if (!audioCtx || audioCtx.state !== "running") return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const env = audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(notes[idx % notes.length], now);
      idx += 1;

      env.gain.setValueAtTime(0.0001, now);
      env.gain.exponentialRampToValueAtTime(0.18, now + 0.35);
      env.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

      osc.connect(env);
      env.connect(ambientGain);
      osc.start(now);
      osc.stop(now + 2.5);
    }, 2600);
  }

  function startAmbientPiano() {
    ensureAmbientContext();
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    duckAmbient(false);
  }

  function duckAmbient(isDucking) {
    if (!audioCtx || !ambientGain) return;
    const target = isDucking ? 0.006 : 0.035;
    ambientGain.gain.setTargetAtTime(target, audioCtx.currentTime, 0.4);
  }

  function formatTime(sec) {
    if (!Number.isFinite(sec) || sec < 0) return "00:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function loadVoiceTrack(track) {
    voicePlayer.src = track.src;
    voicePlayer.load();
    seekBar.value = 0;
    timeLabel.textContent = "00:00";
    toggleBtn.textContent = "تشغيل";
  }

  toggleBtn.addEventListener("click", () => {
    if (!voicePlayer.src) return;
    if (voicePlayer.paused) {
      duckAmbient(true);
      voicePlayer
        .play()
        .then(() => {
          toggleBtn.textContent = "إيقاف مؤقت";
        })
        .catch(() => {
          // في حال لم يُرفع ملف الصوت بعد، يظل المشغل جاهزًا دون أخطاء
          toggleBtn.textContent = "تشغيل";
        });
    } else {
      voicePlayer.pause();
      duckAmbient(false);
      toggleBtn.textContent = "تشغيل";
    }
  });

  restartBtn.addEventListener("click", () => {
    voicePlayer.currentTime = 0;
    seekBar.value = 0;
    timeLabel.textContent = "00:00";
  });

  voicePlayer.addEventListener("timeupdate", () => {
    if (!voicePlayer.duration) return;
    seekBar.value = String((voicePlayer.currentTime / voicePlayer.duration) * 100);
    timeLabel.textContent = formatTime(voicePlayer.currentTime);
  });

  voicePlayer.addEventListener("ended", () => {
    toggleBtn.textContent = "تشغيل";
    duckAmbient(false);
  });

  seekBar.addEventListener("input", () => {
    if (!voicePlayer.duration) return;
    voicePlayer.currentTime = (Number(seekBar.value) / 100) * voicePlayer.duration;
  });

  window.JoudAudio = {
    startAmbientPiano,
    duckAmbient,
    loadVoiceTrack
  };
})();