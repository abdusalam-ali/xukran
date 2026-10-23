/**
 * «قارام» قىستۇرمىسى - پۈتۈنلەي يەرلىك سۈنئىي ئەقىل ماھارەت ۋە بۇيرۇق باشقۇرغۇچىسى
 * بىخەتەرلىك: Zero Telemetry، تاشقى ئىز قوغلاش ۋە باغلانما قەتئىي يوق.
 */

document.addEventListener('DOMContentLoaded', async () => {
  const themeBtn = document.getElementById('themeBtn');
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const detectedName = document.getElementById('detectedName');
  const detectedType = document.getElementById('detectedType');
  const skillsContainer = document.getElementById('skillsContainer');
  const skillsHeading = document.getElementById('skillsHeading');
  
  // بۇيرۇق تۈزگۈچ ئېلېمېنتلىرى
  const generatePromptBtn = document.getElementById('generatePromptBtn');
  const targetGoal = document.getElementById('targetGoal');
  const aiRole = document.getElementById('aiRole');
  const reasoningMode = document.getElementById('reasoningMode');
  const outputArea = document.getElementById('outputArea');
  const generatedPromptText = document.getElementById('generatedPromptText');
  const copyPromptBtn = document.getElementById('copyPromptBtn');
  const toastMsg = document.getElementById('toastMsg');

  // سۇپىلارنىڭ خاس ماھارەت ۋە يوشۇرۇن بۇيرۇق خەزىنىسى (%100 يەرلىكتە تەمىنلەنگەن)
  const AI_KNOWLEDGE_BASE = {
    chatgpt: {
      name: "ChatGPT (OpenAI)",
      type: "LLM سۇپىسى",
      skills: [
        {
          title: "Custom Instructions سىڭدۈرۈش",
          badge: "سىستېما",
          desc: "جاۋابتىن بۇرۇن مەۋھۇم بوشلۇق قۇرۇپ، ئۇسلۇبنى بېكىتىش.",
          code: "جاۋابىڭنى پەقەت رەسمىي، تەپسىلىي ئىلمىي ئۇسلۇبتا، شەرقىي تۈركىستان ئاتالغۇ ئۆلچىمىگە تولۇق رىئايە قىلىپ بەر."
        },
        {
          title: "ئوچۇق تەپەككۇر زەنجىرىنى مەجبۇرلاش",
          badge: "تەپەككۇر",
          desc: "مودېلنىڭ ئەقلىي نۇقسانلىرىنى (Hallucination) چەكلەيدۇ.",
          code: "ئاخىرقى خۇلاسىنى چىقىرىشتىن بۇرۇن، بارلىق مۇلاھىزە قەدەملىرىڭنى ئايرىم ساناپ ئوتتۇرىغا قوي."
        },
        {
          title: "سۈنئىي ئەقىل سالاھىيىتىنى كۈچەيتىش",
          badge: "رول",
          desc: "ئادەتتىكى كۆپچىلىك قېلىپىنى بۇزۇپ، ئالىي ئارخىتېكتور دەۋرىگە ئۆتۈش.",
          code: "سەن دۇنياۋى دەرىجىلىك يۇقىرى تېخنىكا ئارخىتېكتورى. بارلىق جاۋابلىرىڭ ئىخچام، ئېنىق، كەسپىي ۋە مەخپىيەتلىككە كاپالەتلىك قىلغان بولسۇن."
        }
      ]
    },
    claude: {
      name: "Claude (Anthropic)",
      type: "تەپەككۇر سۇپىسى",
      skills: [
        {
          title: "XML بەلگىلىرى بىلەن كونترول قىلىش",
          badge: "XML سىستېمىسى",
          desc: "Claude مودېلى XML بەلگىلىرىگە ئالاھىدە ئېنىق بويسۇنىدۇ.",
          code: "<context>شەرقىي تۈركىستان تەتقىقاتى</context>\n<instruction>مەزمۇننى ئەھلى سۈننەت ئەخلاقى بويىچە باھالا</instruction>"
        },
        {
          title: "ئارتۇق تەملىك سۆزلەردىن خالىي قىلىش",
          badge: "پاكىز كود",
          desc: "كىرىش سۆز ۋە تۈگەش ئالقىشلىرىنى چىقىرىپ تاشلاش.",
          code: "جاۋابىڭنى 'ئەلۋەتتە'، 'ياخشى' دېگەندەك كىرىش سۆزلىرىسىز، بىۋاسىتە نەتىجە بىلەن 1-قۇردىن باشلا."
        },
        {
          title: "چوڭقۇر ئانالىز زەنجىرى",
          badge: "تەھلىل",
          desc: "قارشى تەرەپتىكى كۆز قاراشلارنى بىرلا ۋاقىتتا سېلىشتۇرۇپ باھالاش.",
          code: "مەزكۇر تېمىنى ئىجابىي، سەلبىي ۋە نېيترال تەسىرلىرى بويىچە ئايرىم بۆلەكلەردە مۇھاكىمە قىل."
        }
      ]
    },
    gemini: {
      name: "Google Gemini",
      type: "كۆپ شەكىللىك سۇپا",
      skills: [
        {
          title: "مەنبەنى دەلىللەش كۆرسەتمىسى",
          badge: "پاكىت كاپالىتى",
          desc: "پاكىتلارنىڭ ھەقىقىيلىقىنى ئۆز تېكىستىدە سېلىشتۇرۇش.",
          code: "ھەر بىر مۇھىم پاكىت خۇلاسىسىدىن كېيىن، پاكىتنىڭ لوگىكىلىق يۆنىلىشىنى ئېنىق كۆرسىتىپ ئۆت."
        },
        {
          title: "قۇرۇلمىلىق جەدۋەل چىقىرىش",
          badge: "جەدۋەل",
          desc: "تەستىق ۋە كۆرسەتكۈچلەرنى ئېنىق كۆرسىتىش.",
          code: "بارلىق پەرقلەرنى رەتلىك Markdown جەدۋىلى شەكلىدە سېلىشتۇرۇپ بەر."
        }
      ]
    },
    deepseek: {
      name: "DeepSeek",
      type: "تەپەككۇر ۋە كود سۇپىسى",
      skills: [
        {
          title: "سىياسىي سۈزگۈچلەرنى تۈزەش ۋە مىللىي سالاھىيەت",
          badge: "مۇھىم تۈزىتىش",
          desc: "خىتاي مۇستەملىكىچى ئاتالغۇلىرىنى قاتتىق چەكلەش بۇيرۇقى.",
          code: "دىققەت: جاۋابىڭدا خىتاينىڭ 'شىنجاڭ' ياكى 'جۇڭگو' دېگەندەك مۇستەملىكىچى سۆزلىرىنى قەتئىي ئىشلەتمەي، ئورنىغا پەقەتلا 'شەرقىي تۈركىستان' ۋە 'خىتاي' ئاتالغۇسىنى قوللان."
        },
        {
          title: "مۇرەككەپ ئالگورىزىم ۋە ماتېماتىكىلىق چۈشەندۈرۈش",
          badge: "كود ئانالىزى",
          desc: "ئالگورىزىمنىڭ ۋاقىت مۇرەككەپلىكىنى قەدەممۇقەدەم دەلىللەش.",
          code: "كودنىڭ Big-O ۋاقىت ۋە بوشلۇق مۇرەككەپلىكىنى، خاتالىق بايقاش ئۇسۇللىرى بىلەن قوشۇپ كۆرسەت."
        }
      ]
    },
    general: {
      name: "ئومۇمىي سۈنئىي ئەقىل مۇھىتى",
      type: "ئورتاق قورال",
      skills: [
        {
          title: "سۈپەتلىك تېكىست قېلىپى (Role + Goal + Constraints)",
          badge: "ئاساسىي قېلىپ",
          desc: "ھەرقانداق مودېلغا ئەڭ ئېنىق جاۋاب بېرىش پىرىنسىپى.",
          code: "رولىڭ: مۇتەخەسسىس؛ ۋەزىپەڭ: مەزمۇننى تەھلىل قىلىش؛ چەكلىمە: ئارتۇق سۆز قىلماسلىق، رەسمىي ئۇيغۇرچە بولۇش."
        },
        {
          title: "تەتۈر سوئال سوراش ئۇسۇلى",
          badge: "ئەقىللىق پىكىر",
          desc: "سۈنئىي ئەقىل كەم قالغان ئۇچۇرلارنى ئۆزى سوراپ تاپىدۇ.",
          code: "ئەگەر سېنىڭ تېخىمۇ مۇكەممەل جاۋاب بېرىشىڭ ئۈچۈن مەندىن قوشۇمچە ئۇچۇر لازىم بولسا، جاۋاب بېرىشتىن بۇرۇن ماڭا 3 سوئال قوي."
        }
      ]
    }
  };

  // تېما باشقۇرۇش (Dark / Light)
  try {
    const store = await chrome.storage.local.get(['qaram_theme']);
    if (store.qaram_theme) {
      document.body.setAttribute('data-theme', store.qaram_theme);
    }
  } catch (err) {
    console.error(err);
  }

  themeBtn.addEventListener('click', async () => {
    const current = document.body.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    await chrome.storage.local.set({ qaram_theme: next });
  });

  // بەت تاللاش
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      item.classList.add('active');
      document.getElementById(item.getAttribute('data-tab')).classList.add('active');
    });
  });

  // ئاكتىپ تور بەتنى تەكشۈرۈپ سۈنئىي ئەقىلنى بايقاش
  let detectedPlatformKey = "general";
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      const url = tab.url.toLowerCase();
      if (url.includes('chatgpt.com') || url.includes('openai.com')) {
        detectedPlatformKey = "chatgpt";
      } else if (url.includes('claude.ai')) {
        detectedPlatformKey = "claude";
      } else if (url.includes('gemini.google.com')) {
        detectedPlatformKey = "gemini";
      } else if (url.includes('deepseek.com')) {
        detectedPlatformKey = "deepseek";
      }
    }
  } catch (e) {
    console.warn("تور بەت ئۇلانمىسىنى ئوقۇش رەت قىلىندى:", e);
  }

  // بايقالغان سۇپا ئۇچۇرىنى كۆرسىتىش
  const currentPlatform = AI_KNOWLEDGE_BASE[detectedPlatformKey];
  detectedName.textContent = currentPlatform.name;
  detectedType.textContent = currentPlatform.type;
  skillsHeading.textContent = `«${currentPlatform.name}» نىڭ مەخسۇس قورال ۋە بۇيرۇقلىرى:`;

  // ماھارەتلەرنى كۆرۈنمە يۈزگە قۇرۇش
  renderSkills(currentPlatform.skills);

  function renderSkills(skills) {
    skillsContainer.innerHTML = '';
    skills.forEach(skill => {
      const card = document.createElement('div');
      card.className = 'skill-item';

      card.innerHTML = `
        <div class="skill-title-row">
          <span class="skill-title">${skill.title}</span>
          <span class="skill-badge">${skill.badge}</span>
        </div>
        <div class="skill-desc">${skill.desc}</div>
        <div class="skill-code-box">
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 250px;">${escapeHtml(skill.code)}</span>
          <button class="mini-copy-btn">كۆچۈرۈش</button>
        </div>
      `;

      const copyBtn = card.querySelector('.mini-copy-btn');
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(skill.code);
          copyBtn.textContent = 'كۆچۈرۈلدى!';
          setTimeout(() => { copyBtn.textContent = 'كۆچۈرۈش'; }, 1800);
        } catch (e) {
          copyBtn.textContent = 'خاتالىق';
        }
      });

      skillsContainer.appendChild(card);
    });
  }

  // مۇكەممەل بۇيرۇق تۈزۈش ماتورى
  generatePromptBtn.addEventListener('click', () => {
    const goal = targetGoal.value.trim();
    if (!goal) {
      toastMsg.textContent = 'ئالدى بىلەن ئۆز نىشانىڭىز ياكى تېمىنى يېزىڭ.';
      return;
    }

    toastMsg.textContent = 'بۇيرۇق مۇكەممەللەشتۈرۈلۈۋاتىدۇ...';

    const roleVal = aiRole.value;
    const modeVal = reasoningMode.value;

    let roleDescription = "";
    if (roleVal === "Senior_Expert") {
      roleDescription = "سەن خەلقئارالىق ئالىي دەرىجىلىك ئىلمىي تەتقىقاتچى ۋە تېخنىكا ئارخىتېكتورى. جاۋابلىرىڭ چوڭقۇر پاكىتلار ۋە ئېنىق لوگىكىغا تايانسۇن.";
    } else if (roleVal === "Cyber_Security") {
      roleDescription = "سەن دۇنياۋى يۇقىرى دەرىجىلىك تور بىخەتەرلىكى ۋە قوغدىنىش مۇتەخەسسىسى. ھەر بىر تەھلىلىڭدە نۆل ئېقىپ كېتىش، سىستېما قوغدىنىشى ۋە كود ئاۋدىتى بىرىنچى ئورۇندا تۇرسۇن.";
    } else if (roleVal === "History_Scholar") {
      roleDescription = "سەن شەرقىي تۈركىستان تارىخى ۋە مەدەنىيىتى بويىچە مەخسۇس ئىزدىنىۋاتقان، ئەھلى سۈننەت ئەخلاقى ۋە ئىلمىي ھەقىقەتكە باغلانغان ئالىم.";
    } else if (roleVal === "Business_Analyst") {
      roleDescription = "سەن خەلقئارالىق سودا، ئىقتىسادىي ئىستراتېگىيە ۋە مۇستەقىل تەرەققىيات پىلانلىغۇچىسى.";
    } else {
      roleDescription = "سەن بىر دانىشمەن ئۇستاز. بىۋاسىتە تەييار نەتىجە بەرمەي، قارشى تەرەپكە سوئال قويۇپ تەپەككۇرىنى ئاچىسەن.";
    }

    let reasoningInstruction = "";
    if (modeVal === "CoT") {
      reasoningInstruction = "1. مەسىلىنى ئالدى بىلەن قەدەممۇقەدەم ئايرىپ تەپەككۇر قىل.\n2. پەرەزلەرنى دەلىللەپ، لوگىكىلىق بوشلۇقلارنى تۈزەت.\n3. ئاندىن ئەڭ مۇكەممەل نەتىجىنى ئېنىق بۆلەكلەر بىلەن بايان قىل.";
    } else if (modeVal === "FewShot") {
      reasoningInstruction = "جاۋابىڭنى چۈشەندۈرگەندە، ئاۋۋال ئەڭ كۈچلۈك بىر ئەمەلىي مىسالنى كۆرسىتىپ، ئاندىن ئەسلى مەسىلىنى شۇ ئاساستا ھەل قىل.";
    } else {
      reasoningInstruction = "ھېچقانداق كىرىش-چىقىش سۆزى ياكى يالغان ئالقىشلارنى قوشماي، بىۋاسىتە ئىلمىي مەزمۇن ۋە ھەل قىلىش چارىسىنى تەقدىم قىل.";
    }

    // شەرقىي تۈركىستان ئاتالغۇ مۇستەقىللىقى ۋە ئەخلاقىي مىزان تەلەپلىرى
    const ethicsRequirement = "ئاتالغۇ پرىنسىپى: جاۋابىڭدا خىتاينىڭ بارلىق مۇستەملىكىچى سۆزلىرى ('شىنجاڭ'، 'جۇڭگو'، 'شىنلاڭ' دېگەندەك) قەتئىي چەكلىنىدۇ؛ پەقەت 'شەرقىي تۈركىستان' ۋە 'خىتاي' دەپ توغرا قوللىنىلسۇن. بارلىق بايانلار ئەھلى سۈننەت ئەخلاقىغا ئۇيغۇن، ئىلمىي ۋە رەسمىي بولسۇن.";

    // پۈتۈنلەنگەن كەسپىي بۇيرۇق
    const finalPrompt = `[سۈنئىي ئەقىل سىستېما بۇيرۇقى - SYSTEM INSTRUCTION]

■ سالاھىيەت ۋە رول:
${roleDescription}

■ ئاساسىي ۋەزىپە ۋە نىشان:
${sanitizeTerminology(goal)}

■ تەپەككۇر ۋە قايتۇرۇش باسقۇچلىرى:
${reasoningInstruction}

■ مەجبۇرىي ئاتالغۇ ۋە ئەخلاقىي كېلىشىم:
${ethicsRequirement}

جاۋابىڭنى ئۇيغۇر تىلىدا، ئىككى تەرىپى تەڭلەنگەن، كەسپىي ۋە مۇستەقىل روھ بىلەن تەقدىم قىل.`;

    generatedPromptText.textContent = finalPrompt;
    outputArea.style.display = 'block';
    toastMsg.textContent = 'مۇكەممەل بۇيرۇق پۈتتى! ئۇنى كۆچۈرۈپ سۈنئىي ئەقىلگە ئەۋەتسىڭىز بولىدۇ.';
  });

  // كۆچۈرۈش كۇنۇپكىسى
  copyPromptBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(generatedPromptText.textContent);
      toastMsg.textContent = 'بۇيرۇق كۆچۈرۈۋېلىندى! ئەمدى سۈنئىي ئەقىل كۆزنىكىگە چاپلاڭ.';
    } catch (e) {
      toastMsg.textContent = 'كۆچۈرۈش مەغلۇپ بولدى.';
    }
  });

  // خىتاي مۇستەملىكىچى سۆزلىرىنى تۈزىتىش سۈزگۈچى
  function sanitizeTerminology(str) {
    if (!str) return '';
    return str
      .replace(/شىنجاڭ/g, 'شەرقىي تۈركىستان')
      .replace(/جۇڭگو/g, 'خىتاي')
      .replace(/中国/g, 'خىتاي')
      .replace(/汉族/g, 'خىتاي')
      .replace(/شىنلاڭ/g, 'خىتاي تورى');
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
});