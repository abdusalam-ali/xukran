/**
 * «بىلىم» قىستۇرمىسى - يادرولۇق پروگرامما بۆلىكى
 * ئۆلچەم: Chrome Manifest V3
 * بىخەتەرلىك: Zero Telemetry، يەرلىك سىستېما مەخپىيەتلىكى تولۇق كاپالەتكە ئىگە
 */

document.addEventListener('DOMContentLoaded', async () => {
  // ئېلېمېنتلارنى كۆرۈنمە يۈزدىن تاللاپ ئېلىش
  const summarizeBtn = document.getElementById('summarizeBtn');
  const ttsPlayBtn = document.getElementById('ttsPlayBtn');
  const ttsStopBtn = document.getElementById('ttsStopBtn');
  const statusBadge = document.getElementById('statusBadge');
  const resultContainer = document.getElementById('resultContainer');
  const summaryText = document.getElementById('summaryText');
  const keyPointsList = document.getElementById('keyPointsList');
  const metaSourceTitle = document.getElementById('metaSourceTitle');
  const metaSourceUrl = document.getElementById('metaSourceUrl');
  const metaRelated = document.getElementById('metaRelated');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const settingsToggle = document.getElementById('settingsToggle');
  const settingsContent = document.getElementById('settingsContent');
  const settingsArrow = document.getElementById('settingsArrow');
  const apiKeyInput = document.getElementById('apiKeyInput');
  const saveApiBtn = document.getElementById('saveApiBtn');

  // ساقلانغان تەڭشەكلەرنى ئوقۇش (تېما ۋە API Key)
  try {
    const stored = await chrome.storage.local.get(['theme', 'user_api_key', 'last_summary']);
    if (stored.theme) {
      document.body.setAttribute('data-theme', stored.theme);
    }
    if (stored.user_api_key) {
      apiKeyInput.value = stored.user_api_key;
    }
    if (stored.last_summary) {
      renderSummaryData(stored.last_summary);
    }
  } catch (err) {
    console.error('تەڭشەكلەرنى يۈكلەشتە كاشىلا كۆرۈلدى:', err);
  }

  // تەڭشەك كارتىسىنى ئېچىش/تاقاش
  settingsToggle.addEventListener('click', () => {
    const isOpen = settingsContent.classList.toggle('open');
    settingsArrow.textContent = isOpen ? '▲' : '▼';
  });

  // API ئاچقۇچىنى يەرلىك ساقلاشقا كىرگۈزۈش
  saveApiBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    try {
      await chrome.storage.local.set({ user_api_key: key });
      updateStatus('تەڭشەك يەرلىك كومپيۇتېرىڭىزدا بىخەتەر ساقلاندى.');
      setTimeout(() => updateStatus('مەزمۇن يىغىنچاقلاشقا تەييار'), 2500);
    } catch (e) {
      updateStatus('ساقلاش مەغلۇپ بولدى.');
    }
  });

  // كۈندۈز ۋە كېچە ھالىتىنى ئالماشتۇرۇش
  themeToggleBtn.addEventListener('click', async () => {
    const currentTheme = document.body.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.body.setAttribute('data-theme', nextTheme);
    try {
      await chrome.storage.local.set({ theme: nextTheme });
    } catch (e) {
      console.warn('تېما ساقلانمىدى:', e);
    }
  });

  // يىغىنچاقلاش كۇنۇپكىسىنىڭ مەشغۇلاتى
  summarizeBtn.addEventListener('click', async () => {
    updateStatus('تور بەت ئوقۇلۇۋاتىدۇ...');
    summarizeBtn.disabled = true;

    try {
      // نۆۋەتتىكى ئاكتىپ كۆزنەكنى تاللاش
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        throw new Error('ئاكتىپ كۆزنەك تېپىلمىدى.');
      }

      // تور بەت ئىچىدىن پاكىز تېكىست، ماۋزۇ ۋە ئادرېسنى سۈزۈپ ئېلىش
      const injectionResults = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractPageCleanText
      });

      if (!injectionResults || !injectionResults[0] || !injectionResults[0].result) {
        throw new Error('تور بەت مەزمۇنىنى ئوقۇش مۇمكىن بولمىدى.');
      }

      const pageData = injectionResults[0].result;
      if (!pageData.text || pageData.text.length < 50) {
        throw new Error('تور بەتتە يىغىنچاقلىغۇدەك يېتەرلىك مەزمۇن تېپىلمىدى.');
      }

      updateStatus('مەزمۇن ئۇيغۇرچىغا يىغىنچاقلىنىۋاتىدۇ...');

      // مەزمۇننى بىر تەرەپ قىلىش (يەرلىك ئەقىللىق تەھلىل ياكى API)
      const storageData = await chrome.storage.local.get(['user_api_key']);
      const apiKey = storageData.user_api_key;

      let summaryResult;
      if (apiKey && apiKey.length > 10) {
        summaryResult = await summarizeWithExternalLLM(pageData, apiKey);
      } else {
        // ئەگەر API ئاچقۇچ كىرگۈزۈلمىگەن بولسا، %100 يەرلىك ئەقىللىق ئالگورىزىم ئىشلەيدۇ
        summaryResult = summarizeLocally(pageData);
      }

      // نەتىجىنى ئېكرانغا چىقىرىش ۋە يەرلىك ئەستە ساقلاش
      renderSummaryData(summaryResult);
      await chrome.storage.local.set({ last_summary: summaryResult });
      updateStatus('يىغىنچاقلاش تامام Read-out قىلىشقا تەييار.');

    } catch (error) {
      console.error(error);
      updateStatus('خاتالىق: ' + error.message);
    } finally {
      summarizeBtn.disabled = false;
    }
  });

  // ئاۋازدا ئوقۇش مەشغۇلاتى (Chrome Native TTS)
  ttsPlayBtn.addEventListener('click', () => {
    const textToRead = summaryText.innerText.trim();
    if (!textToRead) {
      updateStatus('ئوقۇيدىغان تېكىست يوق. ئاۋۋال يىغىنچاقلاڭ.');
      return;
    }

    chrome.tts.stop(); // ئالدىنقى ئاۋاز بولسا توختىتىش
    updateStatus('ئوقۇلۇۋاتىدۇ...');

    chrome.tts.speak(textToRead, {
      lang: 'ug',
      rate: 0.95,
      pitch: 1.0,
      onEvent: function(event) {
        if (event.type === 'end') {
          updateStatus('ئوقۇش ئاخىرلاشتى.');
        }
        if (event.type === 'error') {
          // ئەگەر سىستېمىدا 'ug' ئاۋاز بولمىسا سۈكۈتتىكى سىستېما بىلەن ئەسلىگە كېلىش
          chrome.tts.speak(textToRead, { rate: 0.95 });
        }
      }
    });
  });

  // ئاۋازنى دەرھال توختىتىش
  ttsStopBtn.addEventListener('click', () => {
    chrome.tts.stop();
    updateStatus('ئاۋاز توختىتىلدى.');
  });

  // ھالەت ئۇچۇرىنى يېڭىلاش ياردەمچىسى
  function updateStatus(msg) {
    statusBadge.textContent = msg;
  }

  // سانلىق مەلۇماتلارنى UI غا بېسىش
  function renderSummaryData(data) {
    summaryText.textContent = data.summary;
    keyPointsList.innerHTML = '';
    data.keyPoints.forEach(point => {
      const li = document.createElement('li');
      li.textContent = point;
      keyPointsList.appendChild(li);
    });

    metaSourceTitle.textContent = data.title || 'نامەلۇم توربەت';
    metaSourceUrl.textContent = data.url || '-';
    metaSourceUrl.href = data.url || '#';
    metaRelated.textContent = data.relatedTopics || 'شەرقىي تۈركىستان، خەلقئارا جەمئىيەت، زامانىۋى بىلىم';
    resultContainer.style.display = 'block';
  }

  // يەرلىك (Local Native) تېكىست چىقىرىش ۋە ئەقىللىق يىغىنچاقلاش ماتورى
  function summarizeLocally(pageData) {
    const text = pageData.text;
    const title = pageData.title;

    // جۈملىلەرنى پارچىلاش
    const rawSentences = text
      .split(/(?<=[.!؟?\n])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 25);

    // سۆز بايلىقىنى ئانالىز قىلىش
    const wordFreq = {};
    const words = text.toLowerCase().match(/[\u0600-\u06FF\w]{3,}/g) || [];
    words.forEach(w => {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    });

    // ھەر بىر جۈملىنىڭ نۇقتىلىق دەرىجىسىنى ھېسابلاش
    const scoredSentences = rawSentences.map(sentence => {
      const sWords = sentence.toLowerCase().match(/[\u0600-\u06FF\w]{3,}/g) || [];
      let score = 0;
      sWords.forEach(w => {
        score += wordFreq[w] || 0;
      });
      return { sentence, score: score / (sWords.length || 1) };
    });

    // ئەڭ ئېغىر نۇقتىلارنى سۈزۈپ يىغىش
    scoredSentences.sort((a, b) => b.score - a.score);
    const topSentences = scoredSentences.slice(0, 4).map(item => item.sentence);

    // ئەخلاقىي ۋە ئاتالغۇ تۈزىتىش (ئەگەر كونا سۆزلەر بولسا ئورنىغا توغرىسىنى قويۇش)
    const sanitizedTitle = sanitizeTerminology(title);
    const sanitizedPoints = topSentences.map(p => sanitizeTerminology(p));

    return {
      title: sanitizedTitle,
      url: pageData.url,
      summary: `مەزكۇر «${sanitizedTitle}» سەرلەۋھىلىك ماقالىدە بەت يۈزىنىڭ ئاساسىي مەزمۇنلىرى سۈزۈلۈپ باھالاندى. مەزمۇن دائىرىسى تۈرلۈك مەلۇماتلار ۋە ئەمەلىي نۇقتىلارنى قاپلىغان بولۇپ، پۈتۈن تەپسىلاتلىرى ئىلمىي ۋە ئوبيېكتىپ تەھلىل پرىنسىپلىرى ئاساسىدا تۆۋەندىكى يادرولۇق نۇقتىلارغا جەملەنگەن.`,
      keyPoints: sanitizedPoints.length > 0 ? sanitizedPoints : ['يېتەرلىك مۇھىم نۇقتىلار ئايرىلمىدى.'],
      relatedTopics: 'شەرقىي تۈركىستان ئوبزورلىرى، تېخنىكا بىلىملىرى، ئىلمىي تەتقىقاتلار'
    };
  }

  // تاشقى شەخسىي OpenAI/باشقا API ئارقىلىق يىغىنچاقلاش
  async function summarizeWithExternalLLM(pageData, apiKey) {
    const prompt = `سەن بىر يۈكسەك دەرىجىلىك ئۇيغۇر تەتقىقاتچىسى. تۆۋەندىكى تور بەت تېكىستىنى ئەھلى سۈننەت ئەخلاقى ۋە ئىلمىي تىل بىلەن، شەرقىي تۈركىستان دەۋاسى ۋە مىللىي سالاھىيەت ئاتالغۇلىرىغا قاتتىق رىئايە قىلىپ (مەسىلەن، خىتايغا ئالاقىدار كەلىمىلەرنى پەقەتلا "شەرقىي تۈركىستان"، "خىتاي تىلى" ياكى "خىتاي" دەپ ئېلىپ)، مۇكەممەل ئۇيغۇر تىلىدا يىغىنچاقلاپ بەر. 
    
    جاۋابىڭنى پەقەت مۇشۇ JSON فورماتىدا قايتۇر:
    {
      "summary": "ئابزاس شەكلىدىكى تولۇق خۇلاسە",
      "keyPoints": ["1-نۇقتا", "2-نۇقتا", "3-نۇقتا"],
      "relatedTopics": "مۇناسىۋەتلىك 3 تېما"
    }

    ماۋزۇ: ${pageData.title}
    تېكىست: ${pageData.text.slice(0, 3000)}`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.3
      })
    });

    if (!res.ok) {
      throw new Error('API دىن جاۋاب ئېلىشتا كاشىلا كۆرۈلدى. يەرلىك ئۇسۇل تەۋسىيە قىلىنىدۇ.');
    }

    const json = await res.json();
    const parsed = JSON.parse(json.choices[0].message.content);

    return {
      title: sanitizeTerminology(pageData.title),
      url: pageData.url,
      summary: sanitizeTerminology(parsed.summary),
      keyPoints: parsed.keyPoints.map(k => sanitizeTerminology(k)),
      relatedTopics: sanitizeTerminology(parsed.relatedTopics)
    };
  }

  // ئاتالغۇلارنى دەلىللەش ۋە تۈزىتىش سۈزگۈچى
  function sanitizeTerminology(str) {
    if (!str) return '';
    return str
      .replace(/شىنجاڭ/g, 'شەرقىي تۈركىستان')
      .replace(/جۇڭگو/g, 'خىتاي')
      .replace(/خەنزۇ/g, 'خىتاي')
      .replace(/شىنلاڭ/g, 'خىتاي تورى');
  }
});

/**
 * مەزكۇر ئىقتىدار تور بەتنىڭ ئۆز كود دائىرىسىدە ئىجرا قىلىنىپ، تېكىستنى سۈزۈۋالىدۇ.
 * ھېچقانداق تاشقى كۇتۇپخانىغا تايانمايدۇ.
 */
function extractPageCleanText() {
  const title = document.title || 'ماۋزۇسىز بەت';
  const url = window.location.href;

  // قالايمىقان، كېرەكسىز تاغلارنى چىقىرىپ تاشلاش
  const clone = document.body.cloneNode(true);
  const unnecessary = clone.querySelectorAll('script, style, noscript, nav, footer, iframe, svg, button');
  unnecessary.forEach(el => el.remove());

  // بەتتىكى ئاساسلىق تېكىست قۇرۇلمىسىنى ئېلىش
  let extractedText = clone.innerText || clone.textContent || '';
  extractedText = extractedText.replace(/\s+/g, ' ').trim();

  return {
    title: title,
    url: url,
    text: extractedText.slice(0, 8000)
  };
}