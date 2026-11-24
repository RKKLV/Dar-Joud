(function () {
  const data = window.JOUD_HOUSE_DATA;
  const veil = document.getElementById("light-veil");
  const beam = document.getElementById("room-beam");
  const navBar = document.getElementById("house-nav");
  const pillsContainer = document.getElementById("room-pills");

  const roomLabels = [
    { id: "room-01", label: "01 الباب" },
    { id: "room-02", label: "02 السجل" },
    { id: "room-03", label: "03 البدايات" },
    { id: "room-04", label: "04 المقتنيات" },
    { id: "room-05", label: "05 الصوت" },
    { id: "room-06", label: "06 التفاصيل" },
    { id: "room-07", label: "07 الأيام القادمة" },
    { id: "room-08", label: "08 الوثيقة" }
  ];

  function buildPills() {
    pillsContainer.innerHTML = "";
    roomLabels.slice(2).forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "room-pill";
      btn.dataset.target = item.id;
      btn.textContent = item.label;
      btn.addEventListener("click", () => goToRoom(item.id));
      pillsContainer.appendChild(btn);
    });
  }

  function syncPills(activeId) {
    pillsContainer.querySelectorAll(".room-pill").forEach((pill) => {
      pill.classList.toggle("is-current", pill.dataset.target === activeId);
    });
  }

  function goToRoom(targetId) {
    const current = document.querySelector(".room.active");
    const next = document.getElementById(targetId);
    if (!next || current === next) return;

    veil.classList.add("is-dimming");

    window.setTimeout(() => {
      if (current) {
        current.classList.remove("is-revealed", "active");
      }
      next.classList.add("active");
      window.scrollTo(0, 0);
      syncPills(targetId);

      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          next.classList.add("is-revealed");
          veil.classList.remove("is-dimming");
        });
      });
    }, 520);
  }

  // 01 — كتابة عبارة الباب تدريجيًا وفتح الباب بشعاع دافئ
  function initDoor() {
    const quoteEl = document.getElementById("door-quote");
    const approachBtn = document.getElementById("btn-approach-door");
    const doorEl = document.getElementById("wooden-door");
    const firstRoom = document.getElementById("room-01");

    window.requestAnimationFrame(() => firstRoom.classList.add("is-revealed"));

    const text = data.doorQuote;
    let idx = 0;
    const typeTimer = window.setInterval(() => {
      quoteEl.textContent += text.charAt(idx);
      idx += 1;
      if (idx >= text.length) {
        window.clearInterval(typeTimer);
        approachBtn.classList.remove("is-hidden");
      }
    }, 75 );

    approachBtn.addEventListener("click", () => {
      window.JoudAudio.startAmbientPiano();
      doorEl.classList.add("is-swinging");
      beam.classList.add("is-open");

      window.setTimeout(() => {
        goToRoom("room-02");
      }, 950);
    });
  }

  // 02 — سجلّ الدخول
  function initPermit() {
    const codeInput = document.getElementById("passcode-field");
    const wordInput = document.getElementById("word-field");
    const feedback = document.getElementById("permit-feedback");
    const issueBtn = document.getElementById("btn-issue-permit");

    issueBtn.addEventListener("click", () => {
      const codeVal = codeInput.value.trim();
      const wordVal = wordInput.value.trim().toLowerCase();

      const codeOk = codeVal === data.passcode;
      const wordOk = data.acceptedWords.some(
        (w) => wordVal === w.toLowerCase() || wordVal.includes(w.toLowerCase())
      );

      if (codeOk && wordOk) {
        feedback.textContent = "تم اعتماد التصريح.. تُفتح غرفة البدايات.";
        navBar.classList.remove("is-hidden");
        goToRoom("room-03");
      } else {
        feedback.textContent = "تأكدي من الرمز والكلمة، ثم أعيدي المحاولة بهدوء.";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    buildPills();
    initDoor();
    initPermit();
    window.JoudRooms.initAll(goToRoom);

    const homeDoorBtn = document.getElementById("btn-home-door");
    if (homeDoorBtn) {
      homeDoorBtn.addEventListener("click", () => {
        navBar.classList.add("is-hidden");
        document.getElementById("wooden-door").classList.remove("is-swinging");
        beam.classList.remove("is-open");
        goToRoom("room-01");
      });
    }
  });
})();