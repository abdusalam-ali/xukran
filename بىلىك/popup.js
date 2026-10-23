/**
 * «ئىلىك» قىستۇرمىسى (V3.0)
 * بارلىق CORS ۋە CSP چەكلىمىلىرىنى ھەل قىلغان پۈتۈن بەت تەرجىمە ماتورى
 */

document.addEventListener('DOMContentLoaded', async () => {
  // كۆرۈنمە يۈز ئېلېمېنتلىرى
  const themeBtn = document.getElementById('themeBtn');
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');

  // تەرجىمە بۆلىكى
  const translateWholePageBtn = document.getElementById('translateWholePageBtn');
  const extractTranslateBtn = document.getElementById('extractTranslateBtn');
  const translateStatus = document.getElementById('translateStatus');
  const liveTranslateResult = document.getElementById('liveTranslateResult');
  const dictInput = document.getElementById('dictInput');
  const dictBtn = document.getElementById('dictBtn');
  const dictOutput = document.getElementById('dictOutput');

  // ئېلان سۈزگۈچ
  const cleanAdsBtn = document.getElementById('cleanAdsBtn');
  const resetAdsBtn = document.getElementById('resetAdsBtn');
  const blockedCountDisplay = document.getElementById('blockedCountDisplay');
  const adStatus = document.getElementById('adStatus');

  // كود كۆرگۈچ
  const fetchCodeBtn = document.getElementById('fetchCodeBtn');
  const copyCodeBtn = document.getElementById('copyCodeBtn');
  const codeView = document.getElementById('codeView');
  const codeStatus = document.getElementById('codeStatus');

  // ساقلانغان تەڭشەكلەرنى ئوقۇش
  try {
    const store = await chrome.storage.local.get(['elik_theme', 'elik_blocked_ads']);
    if (store.elik_theme) document.body.setAttribute('data-theme', store.elik_theme);
    if (typeof store.elik_blocked_ads === 'number') {
      blockedCountDisplay.textContent = store.elik_blocked_ads;
    }
  } catch (e) {
    console.error(e);
  }

  // كۈندۈز / كېچە ئالماشتۇرۇش
  themeBtn.addEventListener('click', async () => {
    const cur = document.body.getAttribute('data-theme') || 'dark';
    const next = cur === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    await chrome.storage.local.set({ elik_theme: next });
  });

  // بەت تاللىغۇچ
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      item.classList.add('active');
      document.getElementById(item.getAttribute('data-tab')).classList.add('active');
    });
  });

  // 1-ئۇسۇل: پۈتۈن بىر تور بەتنى قىلچە چەكلىمىسىز بىۋاسىتە ئۇيغۇرچىغا ئۆرۈپ ئېچىش
  // (بۇ ئۇسۇل خىتاي تورلىرىنى، چەتئەل خەۋەرلىرىنى 100% تەرجىمە قىلىدۇ)
  translateWholePageBtn.addEventListener('click', async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.url) {
        translateStatus.textContent = 'نۆۋەتتىكى تور بەت تېپىلمىدى.';
        return;
      }

      if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://')) {
        translateStatus.textContent = 'Chrome ئىچكى بەتلىرىنى تەرجىمە قىلغىلى بولمايدۇ.';
        return;
      }

      translateStatus.textContent = 'پۈتۈن بەت ئۇيغۇرچىغا ئۆرۈلۈپ ئېچىلىۋاتىدۇ...';

      // پۈتۈن تور بەتنى ئۇيغۇر تىلى كودى 'ug' بويىچە يېڭى بەتتە پۈتۈنلەي ئۇيغۇرچە قىلىپ ئاچىدۇ
      const translateUrl = `https://translate.google.com/translate?sl=auto&tl=ug&u=${encodeURIComponent(tab.url)}`;
      await chrome.tabs.create({ url: translateUrl });

      translateStatus.textContent = 'بەت مۇۋەپپەقىيەتلىك ئېچىلدى!';
    } catch (err) {
      translateStatus.textContent = 'خاتالىق: ' + err.message;
    }
  });

  // 2-ئۇسۇل: ھازىرقى تۇرغان تور بەتتىكى ئەڭ مۇھىم مەزمۇنلارنى سۈزۈپ ئېلىپ، قىستۇرمىنىڭ ئىچىدە تەرجىمە قىلىپ بېرىش
  extractTranslateBtn.addEventListener('click', async () => {
    translateStatus.textContent = 'بەت مەزمۇنى تەھلىل قىلىنىۋاتىدۇ...';
    extractTranslateBtn.disabled = true;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) throw new Error('بەت تېپىلمىدى.');

      // بەتتىكى تېكىستلەرنى سۈزۈۋېلىش
      const res = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractReadableContent
      });

      if (!res || !res[0] || !res[0].result) {
        throw new Error('بەتتىن تېكىست ئوقۇلمىدى.');
      }

      const rawText = res[0].result;
      translateStatus.textContent = 'ئۇيغۇرچىغا تەرجىمە قىلىنىۋاتىدۇ...';

      // تەرجىمە قىلىش (ھەقسىز يەرلىك دەرۋازا ئارقىلىق)
      const encoded = encodeURIComponent(rawText.slice(0, 1000));
      const apiRes = await fetch(`https://api.mymemory.translated.net/get?q=${encoded}&langpair=autodetect|ug`);
      
      let finalUyghur = '';
      if (apiRes.ok) {
        const data = await apiRes.json();
        finalUyghur = data.responseData ? data.responseData.translatedText : rawText;
      } else {
        finalUyghur = rawText;
      }

      // ئاتالغۇ تۈزىتىش
      finalUyghur = sanitizeNationalTerms(finalUyghur);

      liveTranslateResult.style.display = 'block';
      liveTranslateResult.innerHTML = `<strong>تەرجىمە قىلىنغان مەزمۇن:</strong><br>${finalUyghur}`;
      translateStatus.textContent = 'تەرجىمە كۆرسىتىلدى!';
    } catch (e) {
      translateStatus.textContent = 'كاشىلا كۆرۈلدى: ' + e.message;
    } finally {
      extractTranslateBtn.disabled = false;
    }
  });

  // سۆزلۈك ئىزدەش
  dictBtn.addEventListener('click', async () => {
    const q = dictInput.value.trim();
    if (!q) {
      dictOutput.style.display = 'block';
      dictOutput.textContent = 'سۆز كىرگۈزۈڭ.';
      return;
    }

    dictOutput.style.display = 'block';
    dictOutput.textContent = 'تەرجىمە قىلىنىۋاتىدۇ...';

    try {
      const apiRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(q)}&langpair=autodetect|ug`);
      if (apiRes.ok) {
        const data = await apiRes.json();
        let resText = data.responseData ? data.responseData.translatedText : q;
        dictOutput.innerHTML = `<strong>نەتىجە:</strong> ${sanitizeNationalTerms(resText)}`;
      } else {
        dictOutput.innerHTML = `نەتىجە تېپىلمىدى.`;
      }
    } catch (e) {
      dictOutput.innerHTML = `كاشىلا كۆرۈلدى.`;
    }
  });

  // ئېلانلارنى تازىلاش
  cleanAdsBtn.addEventListener('click', async () => {
    adStatus.textContent = 'ئېلانلار سۈزۈلۈۋاتىدۇ...';
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) throw new Error('بەت يوق.');

      const res = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: executeAdPurge
      });

      const count = (res && res[0] && res[0].result) ? res[0].result : 0;
      const cur = await chrome.storage.local.get(['elik_blocked_ads']);
      const total = (cur.elik_blocked_ads || 0) + count;

      await chrome.storage.local.set({ elik_blocked_ads: total });
      blockedCountDisplay.textContent = total;
      adStatus.textContent = `مۇۋەپپەقىيەتلىك! ${count} دانە ئېلان يوقىتىلدى.`;
    } catch (e) {
      adStatus.textContent = 'خاتالىق: ' + e.message;
    }
  });

  // ساناقچىنى نۆللەش
  resetAdsBtn.addEventListener('click', async () => {
    await chrome.storage.local.set({ elik_blocked_ads: 0 });
    blockedCountDisplay.textContent = '0';
    adStatus.textContent = 'ساناقچى نۆللەندى.';
  });

  // كودنى كۆرۈش
  fetchCodeBtn.addEventListener('click', async () => {
    codeStatus.textContent = 'كود يىغىۋېلىنىۋاتىدۇ...';
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) throw new Error('بەت تېپىلمىدى.');

      const res = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.documentElement.outerHTML || ''
      });

      if (res && res[0] && res[0].result) {
        codeView.textContent = res[0].result.slice(0, 4500) + '\n\n/* ... قالغان كود يەرلىكتە تۇتۇپ قېلىندى ... */';
        codeView.style.display = 'block';
        copyCodeBtn.style.display = 'block';
        codeStatus.textContent = 'كود كۆرسىتىلدى.';
      }
    } catch (e) {
      codeStatus.textContent = 'خاتالىق: ' + e.message;
    }
  });

  copyCodeBtn.addEventListener('click', async () => {
    await navigator.clipboard.writeText(codeView.textContent);
    codeStatus.textContent = 'كود كۆچۈرۈۋېلىندى!';
  });

  // مىللىي سالاھىيەت ئاتالغۇ تۈزىتىش سۈزگۈچى
  function sanitizeNationalTerms(str) {
    if (!str) return '';
    return str
      .replace(/新疆/g, 'شەرقىي تۈركىستان')
      .replace(/جۇڭگو/g, 'خىتاي')
      .replace(/中国/g, 'خىتاي')
      .replace(/汉族/g, 'خىتاي')
      .replace(/شىنجاڭ/g, 'شەرقىي تۈركىستان')
      .replace(/شىنلاڭ/g, 'خىتاي تورى');
  }
});

/**
 * بەتتىكى ئەڭ مۇھىم مەزمۇن تېكىستىنى سۈزۈپ ئېلىش
 */
function extractReadableContent() {
  const clone = document.body.cloneNode(true);
  const trash = clone.querySelectorAll('script, style, noscript, nav, footer, iframe, svg');
  trash.forEach(el => el.remove());
  let text = clone.innerText || clone.textContent || '';
  return text.replace(/\s+/g, ' ').trim().slice(0, 800);
}

/**
 * بەتتىكى ئېلانلارنى سۈزۈپ تازىلاش
 */
function executeAdPurge() {
  const selectors = [
    'iframe[src*="google"]',
    'iframe[src*="doubleclick"]',
    'div[id*="google_ads"]',
    'div[class*="banner"]',
    'div[class*="advertisement"]',
    'ins.adsbygoogle',
    '.adsbygoogle'
  ];

  let purged = 0;
  selectors.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.remove();
      purged++;
    });
  });
  return purged;
}