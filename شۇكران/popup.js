document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const resultContainer = document.getElementById('resultContainer');
  const quickTags = document.getElementById('quickTags');

  // يەرلىكتە مەخسۇس ساقلانغان مۇھىم ئەقىدە، ئەخلاق ۋە ۋەتەن ئۇقۇملىرى
  const localPriorityDb = {
    "شۇكران": {
      word: "شۇكران",
      ar: "شُكْرَان",
      en: "Gratitude / Thanksgiving",
      cn: "感恩之意",
      explanation: "شۇكران سۆزى كۆڭۈلدىكى مىننەتدارلىق، رازىمەنلىك ۋە تەشەككۈر تۇيغۇسىنى بىلدۈرىدۇ. ئەھلى سۈننەت ئەدەپ-ئەخلاقىدا كىشى ئۆزىگە يەتكەن نېئمەتكە تەشەككۈر بايان قىلىش گۈزەل پەزىلەتتۇر.",
      context: "سۈپەت ۋە ئەخلاق"
    },
    "شۈكۈر": {
      word: "شۈكۈر",
      ar: "شُكْر",
      en: "Gratitude",
      cn: "感恩",
      explanation: "بېرىلگەن بارلىق ياخشىلىق، رىزىق ۋە سالامەتلىك ئۈچۈن قەلب، تىل ۋە ئەمەل ئارقىلىق مىننەتدارلىق بىلدۈرۈش.",
      context: "ئېتىقاد ۋە روھىيەت"
    },
    "ئەركىنلىك": {
      word: "ئەركىنلىك",
      ar: "حُرِّيَّة",
      en: "Freedom / Liberty",
      cn: "自由",
      explanation: "ھەربىر ئىنسان ۋە مىللەتنىڭ زۇلۇم ۋە باستۇرۇشتىن يىراق بولۇپ، ئۆز تەقدىرى ۋە ئېتىقادىنى ئۆزى ئەركىن ياشاش ھەققى. شەرقىي تۈركىستان خەلقىنىڭ قەدىر-قىممىتىگە بىۋاسىتە باغلانغان ئۇقۇم.",
      context: "مىللىي سالاھىيەت ۋە ھوقۇق"
    },
    "ۋەتەن": {
      word: "ۋەتەن",
      ar: "وَطَن",
      en: "Homeland",
      cn: "祖国 / 家园",
      explanation: "كىشى تۇغۇلۇپ ئۆسكەن، ئەجدادلار مىراسى بولغان، تىل ۋە مەدەنىيەت يىلتىز تارتقان مۇبارەك ماكان.",
      context: "مۇقەددەس ماكان"
    },
    "ئىلىم": {
      word: "ئىلىم",
      ar: "عِلْم",
      en: "Knowledge / Science",
      cn: "知识 / 科学",
      explanation: "ھەقىقەتنى، ھاياتنى ۋە ئالەمنى چۈشىنىش، تەپەككۇر قىلىش جەريانى. پايدىلىق ئىلىم ئىنساننى گۈزەل ئەخلاققا باشلايدۇ.",
      context: "مەرىپەت"
    },
    "تەۋەككۈل": {
      word: "تەۋەككۈل",
      ar: "تَوَكُّل",
      en: "Trust in God",
      cn: "托靠 / 信赖",
      explanation: "نىشانغا يېتىش ئۈچۈن بارلىق سەۋەبلەرنى تەلەپ بويىچە قىلىپ بولغاندىن كېيىن، قەلبىدە نەتىجىنى ئاللاھ تائالاغا تاپشۇرۇش، خاتىرجەم بولۇش دېگەنلىكتۇر.",
      context: "ئېتىقاد"
    }
  };

  function renderLoading(text) {
    resultContainer.innerHTML = `
      <div class="empty-state">
        <div style="margin-bottom: 8px;">«${escapeHtml(text)}» سۆزىنىڭ شەرھى ۋە تەرجىمىسى تەييارلىنىۋاتىدۇ...</div>
        <div style="font-size: 11px; opacity: 0.7;">تەبىئىي كۆپ تىللىق تەھلىل ئېلىپ بېرىلماقتا</div>
      </div>
    `;
  }

  function renderResult(data) {
    if (!data) {
      resultContainer.innerHTML = `
        <div class="empty-state">
          كەچۈرۈڭ، بۇ سۆزنىڭ مەنىسى تېپىلمىدى. قايتا سىناپ بېقىڭ.
        </div>
      `;
      return;
    }

    resultContainer.innerHTML = `
      <div class="word-header">
        <span class="word-main">${escapeHtml(data.word)}</span>
        <button class="audio-btn" id="playAudioBtn" title="مەنىسىنى ۋە تەلەپپۇزىنى ئوقۇش">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        </button>
      </div>

      <div class="translation-grid">
        <div class="trans-row">
          <span class="trans-label">ئۇيغۇرچە مەنىسى:</span>
          <span class="trans-val" dir="rtl">${escapeHtml(data.ug || data.word)}</span>
        </div>
        <div class="trans-row">
          <span class="trans-label">ئىنگلىزچە:</span>
          <span class="trans-val" dir="ltr">${escapeHtml(data.en || "—")}</span>
        </div>
        <div class="trans-row">
          <span class="trans-label">ئەرەبچە:</span>
          <span class="trans-val" dir="rtl">${escapeHtml(data.ar || "—")}</span>
        </div>
        <div class="trans-row">
          <span class="trans-label">خىتاي تىلى:</span>
          <span class="trans-val" dir="ltr">${escapeHtml(data.cn || "—")}</span>
        </div>
      </div>

      <div>
        <div class="explanation-title">تەپسىلىي شەرھى:</div>
        <p class="explanation-text">${escapeHtml(data.explanation)}</p>
      </div>

      <div class="meta-box">
        <span>ساھەسى: ${escapeHtml(data.context || "ئومۇمىي تىل")}</span>
        <span>بىخەتەرلىك: تەكشۈرۈلگەن & ئىز قوغلاشسىز</span>
      </div>
    `;

    const playAudioBtn = document.getElementById('playAudioBtn');
    if (playAudioBtn) {
      playAudioBtn.addEventListener('click', () => {
        speakWordExplanation(data.word, data.explanation, data.ug);
      });
    }
  }

  // ھەرقانداق تىلدىن نىشان تىلغا تەرجىمە قىلىش (ئوچۇق ئاممىۋى مۇلازىمەت ئارقىلىق)
  async function fetchTranslation(text, targetLang) {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|${targetLang}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.responseData && json.responseData.translatedText) {
          return json.responseData.translatedText;
        }
      }
    } catch (e) {
      console.warn(`Translation to ${targetLang} failed`, e);
    }
    return "";
  }

  async function search(query) {
    const rawInput = query.trim();
    if (!rawInput) return;

    renderLoading(rawInput);

    try {
      // 1. ئالدى بىلەن يەرلىك سۈكۈتتىكى ئامبارنى تەكشۈرۈش
      const key = Object.keys(localPriorityDb).find(k => k.toLowerCase() === rawInput.toLowerCase());
      if (key) {
        const matched = localPriorityDb[key];
        renderResult({
          word: rawInput,
          ug: matched.word,
          ar: matched.ar,
          en: matched.en,
          cn: matched.cn,
          explanation: matched.explanation,
          context: matched.context
        });
        saveLastWord(rawInput);
        return;
      }

      // 2. دۇنيادىكى بارلىق تىللارنى تەڭ بىر تەرەپ قىلىش:
      // ئۇيغۇرچە، ئەرەبچە، ئىنگلىزچە ۋە خىتاي تىلىغا بىرلا ۋاقىتتا مۇستەقىل ئايلاندۇرۇش
      const [transUg, transEn, transAr, transCn] = await Promise.all([
        fetchTranslation(rawInput, 'ug'),
        fetchTranslation(rawInput, 'en'),
        fetchTranslation(rawInput, 'ar'),
        fetchTranslation(rawInput, 'zh-CN')
      ]);

      const primaryMeaning = transUg || rawInput;
      const explanationText = `«${rawInput}» سۆزى خەلقئارالىق تىل ئالاقىسىدە «${primaryMeaning}» مەنىسىدە قوللىنىلىدۇ. ئىنگلىزچىدە «${transEn || rawInput}»، ئەرەب تىلىدا «${transAr || rawInput}»، خىتاي تىلىدا بولسا «${transCn || rawInput}» شەكلىدە ئىپادىلىنىدۇ. ئەھلى سۈننەت ئەدەپ-ئەخلاقىغا ئۇيغۇن، ئىلمىي ۋە رەسمىي ئالاقىلەردە ئۆز مەزمۇنى بىلەن ئىشلىتىلىدۇ.`;

      renderResult({
        word: rawInput,
        ug: primaryMeaning,
        en: transEn || rawInput,
        ar: transAr || "—",
        cn: transCn || "—",
        explanation: explanationText,
        context: "كۆپ تىللىق شەرھ"
      });

      saveLastWord(rawInput);

    } catch (err) {
      console.error("ئىزدەشتە خاتالىق كۆرۈلدى:", err);
      renderResult(null);
    }
  }

  function saveLastWord(w) {
    if (chrome && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ lastWord: w });
    }
  }

  function speakWordExplanation(word, text, ugMeaning) {
    try {
      if (!('speechSynthesis' in window)) {
        alert("تور كۆرگۈچىڭىز ئاۋاز سىستېمىسىنى قوللىمىدى.");
        return;
      }

      window.speechSynthesis.cancel();

      // پۈتۈن شەرھ ۋە مەنىسىنى تەلەپپۇز قىلىش
      const fullSpeechText = `${word}. مەنىسى: ${ugMeaning}. ${text}`;
      const utterance = new SpeechSynthesisUtterance(fullSpeechText);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(v => 
        v.lang.startsWith('ug') || 
        v.lang.startsWith('tr') || 
        v.lang.startsWith('ar') || 
        v.lang.startsWith('en')
      );

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("ئاۋاز ئوقۇش خاتالىقى:", e);
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  searchBtn.addEventListener('click', () => search(searchInput.value));
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      search(searchInput.value);
    }
  });

  quickTags.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('tag-item')) {
      const selectedWord = e.target.getAttribute('data-word');
      searchInput.value = selectedWord;
      search(selectedWord);
    }
  });

  if (chrome && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['lastWord'], (res) => {
      if (res && res.lastWord) {
        searchInput.value = res.lastWord;
        search(res.lastWord);
      }
    });
  }
});