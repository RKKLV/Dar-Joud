(function () {
  const data = window.JOUD_HOUSE_DATA;

  // 03 — معرض البدايات
  function renderBeginnings(onOpenRoom) {
    const gallery = document.getElementById("beginnings-gallery");
    const viewer = document.getElementById("beginning-book");
    const tagEl = document.getElementById("book-tag");
    const titleEl = document.getElementById("book-title");
    const frameEl = document.getElementById("book-frame-visual");
    const storyEl = document.getElementById("book-story");
    const closeBtn = document.getElementById("close-book");

    gallery.innerHTML = "";
    data.beginnings.forEach((item) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "frame-card";
      card.innerHTML = `
        <div class="frame-mat">
          <span class="dusty-tag">${item.tag}</span>
          <h3>${item.title}</h3>
          <p>${item.caption}</p>
        </div>
      `;
      card.addEventListener("click", () => {
        tagEl.textContent = item.tag;
        titleEl.textContent = item.title;
        const imgPath = item.image || "assets/images/joud-portrait.jpg";
frameEl.innerHTML = `
  <div class="joud-photo-box">
  
    <img src="${imgPath}" alt="${item.title}" /> يا جعل هالحُسن ما يجي منه حرمان
  </div>
`;
        storyEl.textContent = item.story;
        viewer.classList.remove("is-hidden");
        viewer.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
      gallery.appendChild(card);
    });

    closeBtn.addEventListener("click", () => {
      viewer.classList.add("is-hidden");
    });

    document.querySelectorAll('#room-03 [data-go]').forEach((btn) => {
      btn.addEventListener("click", () => onOpenRoom(btn.dataset.go));
    });
  }

  // 04 — مقتنيات جود (سحب الدرج + فتح الظرف + الختم الشمعي)
  function renderDrawers(onOpenRoom) {
    const cabinet = document.getElementById("drawers-cabinet");
    const modal = document.getElementById("drawer-modal");
    const closeModal = document.getElementById("close-drawer");
    const numEl = document.getElementById("drawer-num");
    const titleEl = document.getElementById("drawer-title");
    const bodyEl = document.getElementById("drawer-body");
    const sealBtn = document.getElementById("wax-seal-btn");
    const secretEl = document.getElementById("wax-secret");

    let activeDrawer = null;
    cabinet.innerHTML = "";

    data.drawers.forEach((drawer) => {
      const slot = document.createElement("button");
      slot.type = "button";
      slot.className = "drawer-slot";
      slot.innerHTML = `
        <span class="drawer-handle" aria-hidden="true"></span>
        <span class="drawer-code">${drawer.code}</span>
        <div class="drawer-label">${drawer.label}</div>
      `;

      let startY = null;
      let pulled = false;

      function openThisDrawer() {
        activeDrawer = drawer;
        numEl.textContent = drawer.code;
        titleEl.textContent = drawer.title;
        bodyEl.textContent = drawer.body;
        secretEl.textContent = drawer.secret;
        secretEl.classList.add("is-hidden");
        sealBtn.classList.remove("is-broken");
        modal.classList.remove("is-hidden");
      }

      slot.addEventListener(
        "touchstart",
        (e) => {
          startY = e.touches[0].clientY;
        },
        { passive: true }
      );

      slot.addEventListener(
        "touchmove",
        (e) => {
          if (startY === null) return;
          const dy = e.touches[0].clientY - startY;
          if (Math.abs(dy) > 14 && !pulled) {
            pulled = true;
            slot.classList.add("is-pulled");
          }
        },
        { passive: true }
      );

      slot.addEventListener("touchend", () => {
        if (pulled) {
          window.setTimeout(() => {
            slot.classList.remove("is-pulled");
            pulled = false;
            openThisDrawer();
          }, 180);
        }
        startY = null;
      });

      slot.addEventListener("click", () => {
        if (!pulled) openThisDrawer();
      });

      cabinet.appendChild(slot);
    });

    function revealWaxSecret() {
      if (!activeDrawer) return;
      sealBtn.classList.add("is-broken");
      secretEl.classList.remove("is-hidden");
    }

    sealBtn.addEventListener("mouseenter", revealWaxSecret);
    sealBtn.addEventListener("click", revealWaxSecret);

    closeModal.addEventListener("click", () => {
      modal.classList.add("is-hidden");
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("is-hidden");
    });

    document.querySelectorAll('#room-04 [data-go]').forEach((btn) => {
      btn.addEventListener("click", () => onOpenRoom(btn.dataset.go));
    });
  }

  // 05 — جناح صوتها
  function renderVoiceRooms(onOpenRoom) {
    const list = document.getElementById("voice-rooms-list");
    const deck = document.getElementById("voice-deck");
    const occasionEl = document.getElementById("voice-occasion");
    const titleEl = document.getElementById("voice-title");
    const noteEl = document.getElementById("voice-note");

    list.innerHTML = "";
    data.voiceRooms.forEach((room) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "voice-room-btn";
      btn.innerHTML = `
        <span class="dusty-tag">${room.occasion}</span>
        <h3>${room.title}</h3>
      `;
      btn.addEventListener("click", () => {
        list.querySelectorAll(".voice-room-btn").forEach((el) => el.classList.remove("is-active"));
        btn.classList.add("is-active");
        occasionEl.textContent = room.occasion;
        titleEl.textContent = room.title;
        noteEl.textContent = room.note;
        deck.classList.remove("is-hidden");
        window.JoudAudio.loadVoiceTrack(room);
      });
      list.appendChild(btn);
    });

    document.querySelectorAll('#room-05 [data-go]').forEach((btn) => {
      btn.addEventListener("click", () => {
        window.JoudAudio.duckAmbient(false);
        onOpenRoom(btn.dataset.go);
      });
    });
  }

  // 06 — تفاصيل لا يعرفها سواي
  function renderQuiz(onOpenRoom) {
    const qText = document.getElementById("quiz-q-text");
    const choicesBox = document.getElementById("quiz-choices");
    const hintEl = document.getElementById("quiz-hint");
    const revealedBox = document.getElementById("secret-lines-revealed");
    const quizStage = document.getElementById("quiz-stage");
    const completeBox = document.getElementById("quiz-complete");

    let step = 0;
    revealedBox.innerHTML = "";

    function showQuestion() {
      const current = data.quiz[step];
      qText.textContent = current.question;
      hintEl.textContent = "";
      choicesBox.innerHTML = "";

      current.choices.forEach((choice, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "choice-btn";
        btn.textContent = choice;
        btn.addEventListener("click", () => {
          if (idx === current.correctIndex) {
            const chip = document.createElement("div");
            chip.className = "secret-line-chip";
            chip.textContent = current.revealedLine;
            revealedBox.appendChild(chip);

            step += 1;
            if (step < data.quiz.length) {
              showQuestion();
            } else {
              quizStage.classList.add("is-hidden");
              completeBox.classList.remove("is-hidden");
            }
          } else {
            hintEl.textContent = "اقتربي أكثر من التفاصيل التي ألاحظها فيكِ.";
          }
        });
        choicesBox.appendChild(btn);
      });
    }

    showQuestion();

    document.querySelectorAll('#room-06 [data-go]').forEach((btn) => {
      btn.addEventListener("click", () => onOpenRoom(btn.dataset.go));
    });
  }

  // 07 — جناح الأيام القادمة
  function renderFutureWings(onOpenRoom) {
    const container = document.getElementById("future-wings");
    container.innerHTML = "";

    data.futureWings.forEach((wing) => {
      const panel = document.createElement("article");
      panel.className = "future-panel";
      panel.innerHTML = `
        <h3>${wing.title}</h3>
        <p>${wing.text}</p>
      `;
      container.appendChild(panel);
    });

    document.querySelectorAll('#room-07 [data-go]').forEach((btn) => {
      btn.addEventListener("click", () => onOpenRoom(btn.dataset.go));
    });
  }

  // 08 — الوثيقة الأخيرة
  function renderFinalDocument() {
    const unfoldBtn = document.getElementById("btn-unfold-doc");
    const cover = document.getElementById("doc-seal-cover");
    const content = document.getElementById("doc-content");
    const proseEl = document.getElementById("final-doc-text");

    unfoldBtn.addEventListener("click", () => {
      cover.classList.add("is-hidden");
      content.classList.remove("is-hidden");
      proseEl.textContent = "";

      const full = data.finalDocument;
      let i = 0;
      const timer = window.setInterval(() => {
        proseEl.textContent += full.charAt(i);
        i += 1;
        if (i >= full.length) {
          window.clearInterval(timer);
        }
      }, 55);
    });
  }

  window.JoudRooms = {
    initAll(onOpenRoom) {
      renderBeginnings(onOpenRoom);
      renderDrawers(onOpenRoom);
      renderVoiceRooms(onOpenRoom);
      renderQuiz(onOpenRoom);
      renderFutureWings(onOpenRoom);
      renderFinalDocument();
    }
  };
})();
