const API = (() => {
    const origin = window.location.origin;
    const isLocal3000 = /localhost:3000|127\.0\.0\.1:3000/.test(origin);
    return isLocal3000 ? origin : "https://numerology-app-w6rq.onrender.com";
})();

const {
    TITLE_MAP,
    TL_KEYWORD,
    TL_COLOR,
    TL_DESC,
    DEEP_MAP,
    MOON_MAP,
    P_DETAIL,
    C_DETAIL,
    QUESTIONS,
    GROWTH_DATA,
    CHALLENGE_DATA,
    YEAR_STRATEGY,
    MONTHLY_KEYWORDS,
    DAY_ADVICE,
    DAILY_TIPS,
    LOSHU_STRENGTH_RULES,
    LOSHU_WEAKNESS_RULES,
    LOSHU_INTENSITY_RULES,
    INTERPRETATION_TEXTS,
    LOSHU_ARROWS,
    getZodiacInfo
} = window.NUMEROLOGY_DATA;

// PWA(홈 화면 추가) 앱인지 일반 웹인지 판별하여 저장소 결정
const isPWA = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
const storage = isPWA ? localStorage : sessionStorage;

document.addEventListener("DOMContentLoaded", checkAuth);

function showToast(message, type = "warn", duration = 2200) {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 260);
    }, duration);
}

async function checkAuth() {
    const token = storage.getItem("token");
    const loginView = document.getElementById("loginView");
    const container = document.querySelector(".container");

    if (!token) {
        loginView.style.display = "block";
        container.style.display = "none";
        return;
    }

    loginView.style.display = "none";
    container.style.display = "block";

    if (navigator.onLine) {
        try {
            const res = await fetch(API + "/check-auth", {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await res.json();
            if (res.status === 401) {
                showToast("보안 정책이 변경되어 다시 로그인해주세요.", "error", 2600);
                storage.removeItem("token");
                location.reload();
            } else if (data.token) {
                storage.setItem("token", data.token);
            }
        } catch (e) {
            console.log("서버 응답 없음, 현재 세션 유지");
        }
    }
}

async function login() {
    const password = document.getElementById("password").value;
    try {
        const res = await fetch(API + "/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password })
        });

        if (res.ok) {
            const data = await res.json();
            storage.setItem("token", data.token);
            showToast("인증 성공!", "success");
            location.reload();
        } else {
            showToast("비밀번호가 틀렸습니다.", "error");
        }
    } catch (e) {
        // Fallback: GitHub Pages 등 백엔드 없는 정적 호스팅에서 테스트 로그인 허용
        if (password === "888") {
            try {
                const store = (typeof storage !== "undefined") ? storage : (window.localStorage || window.sessionStorage);
                store.setItem("token", "local-fallback-token");
                showToast("로그인 성공!", "success", 1400);
                setTimeout(() => location.reload(), 500);
            } catch (sErr) {
                // storage 접근 불가 시 sessionStorage 직접 사용
                try { window.sessionStorage.setItem("token", "local-fallback-token"); location.reload(); } catch(e2) { showToast("로그인 실패: 브라우저 설정을 확인하세요.", "error", 2600); }
            }
        } else {
            showToast("서버 연결 실패. 비밀번호를 확인하세요.", "error", 2600);
        }
    }
}

// 버튼 클릭 이벤트 리스너 (보안 체크)
document.getElementById("btnRun").addEventListener("click", function () {
    const token = storage.getItem("token");
    if (token) {
        startAnalysis();
    } else {
        showToast("로그인이 필요합니다.", "warn");
        document.querySelector(".container").style.display = "none";
        document.getElementById("loginView").style.display = "block";
    }
});

function getNameScore(name) {
    let soulSum = 0;
    let consSum = 0;
    const allDigits = new Set();
    const isH = /[ㄱ-ㅎ|가-힣]/.test(name);
    const hc = { "ㄱ": 1, "ㄴ": 2, "ㄷ": 3, "ㄹ": 4, "ㅁ": 5, "ㅂ": 6, "ㅅ": 7, "ㅇ": 8, "ㅈ": 9, "ㅊ": 1, "ㅋ": 2, "ㅌ": 3, "ㅍ": 4, "ㅎ": 5 };
    const hv = { "ㅏ": 1, "ㅐ": 2, "ㅑ": 2, "ㅒ": 3, "ㅓ": 3, "ㅔ": 4, "ㅕ": 4, "ㅖ": 5, "ㅗ": 5, "ㅘ": 6, "ㅙ": 7, "ㅚ": 8, "ㅛ": 6, "ㅜ": 7, "ㅝ": 8, "ㅞ": 9, "ㅟ": 1, "ㅠ": 8, "ㅡ": 9, "ㅢ": 1, "ㅣ": 1 };
    const enVal = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9, J: 1, K: 2, L: 3, M: 4, N: 5, O: 6, P: 7, Q: 8, R: 9, S: 1, T: 2, U: 3, V: 4, W: 5, X: 6, Y: 7, Z: 8 };
    if (isH) {
        for (const char of name) {
            const code = char.charCodeAt(0) - 44032;
            if (code < 0 || code > 11171) continue;
            const cho = Math.floor(code / 588);
            const jung = Math.floor((code % 588) / 28);
            const jong = code % 28;
            const choList = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
            const jungList = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];
            const jongList = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
            const choChar = choList[cho];
            const nCho = { "ㄲ": "ㄱ", "ㄸ": "ㄷ", "ㅃ": "ㅂ", "ㅆ": "ㅅ", "ㅉ": "ㅈ" }[choChar] || choChar;
            const choVal = hc[nCho] || 0;
            consSum += choVal;
            if (choVal > 0) allDigits.add(choVal);
            const jungVal = hv[jungList[jung]] || 0;
            soulSum += jungVal;
            if (jungVal > 0) allDigits.add(jungVal);
            if (jong > 0) {
                const jChar = jongList[jong].substring(0, 1);
                const nJ = { "ㄲ": "ㄱ", "ㄸ": "ㄷ", "ㅃ": "ㅂ", "ㅆ": "ㅅ", "ㅉ": "ㅈ" }[jChar] || jChar;
                const jVal = hc[nJ] || 0;
                consSum += jVal;
                if (jVal > 0) allDigits.add(jVal);
            }
        }
    } else {
        for (const c of name.toUpperCase().replace(/[^A-Z]/g, "")) {
            const val = enVal[c] || 0;
            if (["A", "E", "I", "O", "U"].includes(c)) {
                soulSum += val;
            } else {
                consSum += val;
            }
            if (val > 0) allDigits.add(val);
        }
    }
    return { soulSum, consSum, allDigits };
}

function reduceToSingle(n, allowM = true) {
    let r = n;
    while (r > 9) {
        if (allowM && (r === 11 || r === 22 || r === 33)) return r;
        r = String(r).split("").reduce((a, b) => Number(a) + Number(b), 0);
    }
    return r;
}

function initAccordion() {
    document.querySelectorAll(".accordion-header,.cycle-header-acc").forEach(h => {
        h.onclick = function () {
            this.parentElement.classList.toggle("active");
        };
    });
}

function setHtml(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}

// Loshu arrow detection: returns keys of matched arrows (e.g., "9-5-1")
function detectLoshuArrows(counts) {
    const found = [];
    try {
        const arrows = LOSHU_ARROWS || {};
        for (const key of Object.keys(arrows)) {
            const nums = key.split("-").map(n => parseInt(n.trim(), 10));
            if (nums.every(n => counts[n] > 0)) found.push(key);
        }
    } catch (e) {
        console.error("Loshu arrow detection error", e);
    }
    return found;
}

function renderTimeline(mr_r, dr_r, py, curYear, curM) {
    const yearData = [];
    for (let i = 0; i < 10; i++) {
        const yr = curYear + i;
        const ySum = String(yr).split("").reduce((a, b) => Number(a) + Number(b), 0);
        const yRed = reduceToSingle(ySum, true);
        const num = reduceToSingle(yRed + mr_r + dr_r, true);
        yearData.push({ year: yr, num });
    }

    const cur = yearData[0];
    setHtml("currentBanner", `
        <div style="flex:1">
            <div style="font-size:0.68rem;color:var(--muted);margin-bottom:3px;">현재 흐름</div>
            <div style="font-size:0.95rem;font-weight:bold;">
                <span style="color:var(--accent);font-size:1.1rem;font-weight:900;">${curYear}년</span>
                &nbsp;·&nbsp; ${cur.num}번
                <strong style="color:var(--teal)">${TITLE_MAP[cur.num] || ""}</strong>
            </div>
        </div>
        <div style="font-size:3rem;font-weight:900;color:rgba(163,102,255,0.2);line-height:1;">${cur.num}</div>
    `);

    const chartEl = document.getElementById("chartInner");
    chartEl.innerHTML = "";
    yearData.forEach(({ year, num }) => {
        const isCurrent = year === curYear;
        const isTurning = num === 1 && year !== curYear;
        const displayNum = num > 9 ? (num === 11 ? 8 : 9) : num;
        const hPx = Math.round((displayNum / 11) * 110) + 16;
        const color = TL_COLOR[num] || "#555";
        const barBg = isCurrent ? color : isTurning ? "var(--gold)" : "#2a2f3e";

        const col = document.createElement("div");
        col.className = `bar-col${isCurrent ? " current" : ""}${isTurning ? " turning" : ""}`;
        col.innerHTML = `
            <div class="bar-energy">${num}</div>
            <div class="bar-keyword">${TL_KEYWORD[num] || ""}</div>
            <div class="bar-body" style="height:${hPx}px;background:${barBg};"></div>
            <div class="bar-year">${String(year).slice(2)}'</div>
        `;
        chartEl.appendChild(col);
    });

    const cardsEl = document.getElementById("yearCards");
    cardsEl.innerHTML = "";
    yearData.forEach(({ year, num }) => {
        const isCurrent = year === curYear;
        const isTurning = num === 1 && year !== curYear;
        const color = TL_COLOR[num] || "#aaa";
        const card = document.createElement("div");
        card.className = `year-card${isCurrent ? " current" : ""}${isTurning ? " turning" : ""}`;
        card.innerHTML = `
            ${isCurrent ? '<span class="yc-badge now">NOW</span>' : ""}
            ${isTurning ? '<span class="yc-badge turn">전환점</span>' : ""}
            <span class="yc-year">${year}</span>
            <span class="yc-num" style="color:${color}">${num}</span>
            <span class="yc-keyword" style="color:${color}">${TL_KEYWORD[num] || ""}</span>
            <span class="yc-desc">${TL_DESC[num] || ""}</span>
        `;
        cardsEl.appendChild(card);
    });

    const turning = yearData.find(d => d.num === 1 && d.year !== curYear);
    const peak = yearData.reduce((a, b) => {
        const av = a.num > 9 ? (a.num === 11 ? 8 : 9) : a.num;
        const bv = b.num > 9 ? (b.num === 11 ? 8 : 9) : b.num;
        return bv > av ? b : a;
    });
    let html = "<strong>📍 10년 타임라인 핵심 인사이트</strong><br><br>";
    if (turning) html += `🔄 <strong>다음 전환점:</strong> <span style="color:var(--gold)">${turning.year}년</span> — 새로운 9년 주기가 시작됩니다. 삶의 방향이 재설정되는 시기입니다.<br><br>`;
    html += `⚡ <strong>에너지 정점:</strong> <span style="color:var(--teal)">${peak.year}년 (${peak.num}번 · ${TITLE_MAP[peak.num] || ""})</span> — 이 시기에 가장 강력한 성취 에너지가 흐릅니다.<br><br>`;
    html += `💡 <strong>지금(${curYear}):</strong> ${TL_DESC[cur.num] || ""}`;
    setHtml("insightBox", html);
}

function startAnalysis() {
    const name = document.getElementById("inputName").value.trim() || "무명";
    const dateStr = document.getElementById("inputBirth").value;
    if (!dateStr) {
        showToast("생년월일을 먼저 선택해주세요.", "warn");
        document.getElementById("inputBirth").focus();
        return;
    }
    const [y, m, d] = dateStr.split("-").map(Number);
    document.getElementById("v-birth-display").innerText = `(${y}년 ${m}월 ${d}일)`;

    const z = getZodiacInfo(m, d);
    document.getElementById("v-zodiac-name").innerText = `${z.i} ${z.n}`;
    document.getElementById("v-zodiac-desc").innerText = z.t;

    const yr_r = reduceToSingle(String(y).split("").reduce((a, b) => Number(a) + Number(b), 0), true);
    const mr_r = reduceToSingle(m, true);
    const dr_r = reduceToSingle(d, true);

    const lpS = yr_r + mr_r + dr_r;
    const lp = reduceToSingle(lpS, true);
    const mnS = mr_r + dr_r;
    const mn = reduceToSingle(mnS, true);
    const sc = getNameScore(name);
    const su = reduceToSingle(sc.soulSum, true);
    const ps = reduceToSingle(sc.consSum, true);
    const dt = reduceToSingle(sc.soulSum + sc.consSum, true);
    const mt = reduceToSingle(lp + dt, true);

    document.getElementById("v-lp").innerText = `${lp}(${lpS})`;
    document.getElementById("v-dt").innerText = dt;
    document.getElementById("v-su").innerText = su;
    document.getElementById("v-ps").innerText = ps;
    document.getElementById("v-mt").innerText = mt;
    document.getElementById("v-mn").innerText = `${mn}(${mnS})`;

    setHtml("coreDescArea", [
        { k: "인생여정수", v: lp },
        { k: "문 넘버", v: mn },
        { k: "혼의 수", v: su },
        { k: "성격수", v: ps },
        { k: "완성수", v: mt },
        { k: "운명수", v: dt }
    ].map(i => {
        const desc = i.k === "문 넘버" ? (MOON_MAP[i.v] || "") : (DEEP_MAP[i.v] || "");
        return `
            <div class="accordion">
                <div class="accordion-header"><h4>✦ ${i.k} ${i.v}번 분석</h4></div>
                <div class="accordion-content">
                    <span class="q-text">Q. ${QUESTIONS[i.k]}</span>
                    <div class="desc-content">${desc}</div>
                </div>
            </div>`;
    }).join(""));

    const now = new Date();
    const curY = now.getFullYear();
    const curM = now.getMonth() + 1;
    const curD = now.getDate();
    const curY_r = reduceToSingle(String(curY).split("").reduce((a, b) => Number(a) + Number(b), 0), true);
    const pyS = curY_r + mr_r + dr_r;
    const py = reduceToSingle(pyS, true);
    const pmS = py + curM;
    const pm = reduceToSingle(pmS, true);
    const pdS = pm + curD;
    const pd = reduceToSingle(pdS, true);

    document.getElementById("v-py").innerText = `${py}(${pyS})`;
    document.getElementById("v-pm").innerText = `${pm}(${pmS})`;
    document.getElementById("v-pd").innerText = `${pd}(${pdS})`;

    setHtml("flowDescArea", [{ k: "올해의 수", v: py }, { k: "이번 달의 수", v: pm }, { k: "오늘의 수", v: pd }]
        .map(i => `<div class="accordion"><div class="accordion-header"><h4>✦ ${i.k} ${i.v}번 흐름</h4></div><div class="accordion-content"><span class="q-text">Q. ${QUESTIONS[i.k]}</span><div class="desc-content">${DEEP_MAP[i.v] || ""}</div></div></div>`)
        .join(""));

    const lpV = (lp === 11 ? 2 : (lp === 22 ? 4 : (lp === 33 ? 6 : lp)));
    const age1 = 36 - lpV;
    setHtml("mainCycleGrid", `<div class="cycle-mini-card"><span>제1주기(월)</span><strong>${mr_r}</strong></div><div class="cycle-mini-card"><span>제2주기(일)</span><strong>${dr_r}</strong></div><div class="cycle-mini-card"><span>제3주기(년)</span><strong>${yr_r}</strong></div>`);
    setHtml("mainCycleArea", [{ t: "첫 번째 주기", a: `0~${age1}세`, v: mr_r, q: "인생의 전반기, 어떤 씨앗을 뿌려야 하는가?" }, { t: "두 번째 주기", a: `${age1 + 1}~${age1 + 27}세`, v: dr_r, q: "인생의 중반기, 어떤 꽃을 피워야 하는가?" }, { t: "세 번째 주기", a: `${age1 + 28}세~`, v: yr_r, q: "인생의 후반기, 어떤 열매를 거두어야 하는가?" }]
        .map(c => `<div class="accordion"><div class="accordion-header"><h4>✦ ${c.t} ${c.v}번 (${c.a})</h4></div><div class="accordion-content"><span class="q-text">Q. ${c.q}</span><div class="desc-content">${DEEP_MAP[c.v] || ""}</div></div></div>`)
        .join(""));

    const p1 = reduceToSingle(mr_r + dr_r, true);
    const p2 = reduceToSingle(dr_r + yr_r, true);
    const p3 = reduceToSingle(p1 + p2, true);
    const p4 = reduceToSingle(mr_r + yr_r, true);
    const c1 = reduceToSingle(Math.abs(mr_r - dr_r), true);
    const c2 = reduceToSingle(Math.abs(dr_r - yr_r), true);
    const c3 = reduceToSingle(Math.abs(c1 - c2), true);
    const c4 = reduceToSingle(Math.abs(mr_r - yr_r), true);
    const cyData = [{ s: "1단계", a: `0~${age1}`, p: p1, c: c1 }, { s: "2단계", a: `${age1 + 1}~${age1 + 9}`, p: p2, c: c2 }, { s: "3단계", a: `${age1 + 10}~${age1 + 18}`, p: p3, c: c3 }, { s: "4단계", a: `${age1 + 19}~`, p: p4, c: c4 }];
    setHtml("tableBody", cyData.map(c => `<tr><td>${c.s}</td><td>${c.a}</td><td class="p-num">${c.p}</td><td class="c-num">${c.c}</td></tr>`).join(""));
    setHtml("cycleArea", cyData.map((c, i) => `<div class="cycle-block"><div class="cycle-header-acc"><div class="cy-hd-left"><span class="cy-hd-stage">${c.s} (${c.a}세)</span><span class="cy-hd-age">${TITLE_MAP[c.p] || ""}</span></div><div class="cy-hd-badges"><span class="cy-badge-p">P${c.p}</span><span class="cy-badge-c">C${c.c}</span></div></div><div class="cycle-content-acc"><div class="cy-info-row"><span class="cycle-label-p">📍 환경 ${c.p}번</span></div><div class="cycle-text"><div class=\"pdetail-inner\">${P_DETAIL[c.p] || ""}</div></div><div class="cy-info-row"><span class="cycle-label-c">🎯 과제 ${c.c}번</span></div><div class="cycle-text"><div class=\"pdetail-inner\">${C_DETAIL[c.c] || ""}</div></div><button class="cycle-deep-btn" data-cycle-index="${i}">심층 진단 리포트 →</button><div id="cycleDeepPrompt-${i}" class="deep-prompt-container"></div><div id="cycleDeepReport-${i}" class="cycle-deep-report" style="display:none;"></div></div></div>`).join(""));

    // ── 현재 단계 계산 ──
    const userAge = curY - y;
    let curStageIdx = 3;
    if (userAge <= age1) curStageIdx = 0;
    else if (userAge <= age1 + 9) curStageIdx = 1;
    else if (userAge <= age1 + 18) curStageIdx = 2;
    const stageSeasons = ["봄 · 씨앗기", "여름 · 성장기", "가을 · 결실기", "겨울 · 완성기"];

    // ── 프로그레스 바 ──
    setHtml("stageProgressBar", `<div class="stage-progress-wrap">
        <div class="stage-progress-bar">
            ${cyData.map((c, i) => `
                <div class="stage-step ${i === curStageIdx ? 'active' : i < curStageIdx ? 'done' : ''}">
                    <div class="step-dot">${i < curStageIdx ? '✓' : (i === curStageIdx ? '◉' : String(i + 1))}</div>
                    <div class="step-label">${c.s}<br>${stageSeasons[i]}</div>
                </div>
                ${i < 3 ? `<div class="step-line-wrap"><div class="step-line ${i < curStageIdx ? 'done' : ''}"></div></div>` : ''}
            `).join("")}
        </div>
        <div class="stage-progress-msg">
            현재 당신은 <strong style="color:var(--gold);">${curStageIdx + 1}단계 — ${stageSeasons[curStageIdx]}</strong>를 지나고 있습니다
            <span style="color:var(--muted);font-size:0.72rem;margin-left:5px;">(${cyData[curStageIdx].a}세)</span>
        </div>
    </div>`);

    // ── 인생 스토리텔링 리포트 ──
    const curCycle = cyData[curStageIdx];
    const curPNum = Number(curCycle.p);
    const curCNum = Number(curCycle.c);
    const curCD = (CHALLENGE_DATA && CHALLENGE_DATA[curCNum]) || { name: "균형", keyword: "균형", why: "", report: "" };
    const prescKeyword = curCD.keyword || "";
    const prescWhy = curCD.why || "";
    // 현재 대주기 결정
    const majorCycles = [
        { order: "첫 번째", num: mr_r, ageRange: `0~${age1}세`, chapter: "씨앗을 뿌리는 챕터", symbol: "🌱" },
        { order: "두 번째", num: dr_r, ageRange: `${age1 + 1}~${age1 + 27}세`, chapter: "꽃을 피우는 챕터", symbol: "🌸" },
        { order: "세 번째", num: yr_r, ageRange: `${age1 + 28}세 이후`, chapter: "열매를 거두는 챕터", symbol: "🍂" }
    ];
    const curMajor = userAge <= age1 ? majorCycles[0] : (userAge <= age1 + 27 ? majorCycles[1] : majorCycles[2]);

    setHtml("storyReport", `<div class="story-report">
        <div class="story-title">✦ 당신의 인생 스토리 — 지금 이 순간의 나침반</div>

        <div class="story-card">
            <div class="story-card-tag">🌟 본질 · 인생여정수 ${lp}번</div>
            <div class="story-card-desc">${DEEP_MAP[lp] || ""}</div>
        </div>

        <div class="story-arrow-line">↓</div>

        <div class="story-card">
            <div class="story-card-tag">${curMajor.symbol} 인생 흐름 · ${curMajor.order} 대주기 ${curMajor.num}번 (${curMajor.ageRange}) — <span class="story-chapter">${curMajor.chapter}</span></div>
            <div class="story-card-desc">${DEEP_MAP[curMajor.num] || ""}</div>
        </div>

        <div class="story-arrow-line">↓</div>

        <div class="story-card">
            <div class="story-card-tag">📍 현재 환경 · 인생 ${curStageIdx + 1}단계 피나클 ${curPNum}번</div>
            <div class="story-card-desc"><b>[피나클 ${curPNum}번] ${TITLE_MAP[curPNum] || ""}</b>${P_DETAIL[curPNum] || ""}</div>
        </div>

        <div class="story-arrow-line">↓</div>

        <div class="story-card">
            <div class="story-card-tag">🎯 핵심 처방 · 챌린지 ${curCNum}번 · ${curCD.name}</div>
            <div class="story-presc-box">
                <div class="story-presc-headline">지금 당신에게 가장 필요한 것은<br><span class="story-presc-keyword">「 ${prescKeyword} 」</span></div>
                <div class="story-presc-divider"></div>
                <div class="story-presc-why">${prescWhy}</div>
            </div>
        </div>

    </div>`);

    // 즉시 통합 진단 리포트 출력 (질문/선택 버튼 없음)
    (function attachCycleDeepHandlers() {
        try {
            document.querySelectorAll(".cycle-deep-btn").forEach(btn => {
                btn.onclick = function () {
                    const idx = Number(this.dataset.cycleIndex);
                    const cycle = cyData[idx];
                    const pinnacleNum = Number(cycle.p) || 1;
                    const challengeNum = Number(cycle.c) || 0;
                    const cd = (CHALLENGE_DATA && CHALLENGE_DATA[challengeNum]) || { name: "알 수 없는 과제", report: "데이터를 불러올 수 없습니다." };
                    const pinnacleEnv = TITLE_MAP[pinnacleNum] || "알 수 없는 환경";
                    const pinnacleDesc = P_DETAIL[pinnacleNum] || "";

                    const reportEl = document.getElementById(`cycleDeepReport-${idx}`);
                    if (!reportEl) return;

                    this.style.display = "none";

                    const fmtReport = cd.report
                        .split("\n\n")
                        .map(para => `<p style="margin:0 0 7px 0;">${para.replace(/\n/g, "<br>")}</p>`)
                        .join("");

                    reportEl.innerHTML = `
                        <div style="font-size:0.78rem;color:var(--gold);font-weight:700;margin-bottom:6px;padding-bottom:5px;border-bottom:1px solid rgba(217,177,111,0.15);text-align:left;">✦ ${pinnacleEnv} × ${cd.name} — 심층 진단 리포트</div>
                        <div style="border-left:2px solid var(--teal);padding:5px 9px;margin-bottom:6px;text-align:left;">
                            <div style="font-size:0.72rem;color:var(--teal);font-weight:700;line-height:1.2;margin-bottom:3px;">📍 현재 환경 (Pinnacle ${pinnacleNum})</div>
                            <div style="font-size:0.82rem;color:#ccc;line-height:1.55;">${pinnacleDesc}</div>
                        </div>
                        <div style="border-left:2px solid var(--gold);padding:5px 9px;text-align:left;">
                            <div style="font-size:0.72rem;color:var(--gold);font-weight:700;line-height:1.2;margin-bottom:3px;">🎯 핵심 과제 (Challenge ${challengeNum}) — ${cd.name}</div>
                            <div style="font-size:0.84rem;color:#efe9e3;line-height:1.6;">${fmtReport}</div>
                        </div>`;
                    reportEl.style.display = "block";
                    reportEl.scrollIntoView({ behavior: "smooth", block: "center" });
                };
            });
        } catch (e) {
            console.error("attachCycleDeepHandlers error", e);
        }
    })();

    const birthOnlyDigits = new Set((String(y) + String(m) + String(d)).split("").map(Number).filter(n => n !== 0));
    const karmicLessons = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => !birthOnlyDigits.has(n));
    const nameDigits = sc.allDigits;
    const compensated = karmicLessons.filter(n => nameDigits.has(n));
    const remaining = karmicLessons.filter(n => !nameDigits.has(n));

    let missingHtml = "";
    if (karmicLessons.length === 0) {
        missingHtml = `<p style="font-size:0.82rem;color:var(--muted);">${INTERPRETATION_TEXTS.growthMapAllActive}</p>`;
    } else {
        missingHtml += `<div style="margin-bottom:10px;"><span style="font-size:0.72rem;color:var(--muted);display:block;margin-bottom:6px;">📌 생년월일에 없는 숫자 = 선천적 미활성 영역. 이름이 보완하는지 함께 분석합니다.</span>${karmicLessons.map(n => `<div style="margin-bottom:6px;padding:7px 10px;background:rgba(255,255,255,0.02);border-radius:8px;border:1px solid #2a2a3a;"><strong style="color:var(--teal);font-size:0.83rem;">● ${n}번 ${GROWTH_DATA[n].t}</strong><span style="font-size:0.8rem;color:#bbb;display:block;margin-top:2px;">${GROWTH_DATA[n].d}</span></div>`).join("")}</div>`;
        if (compensated.length > 0) {
            missingHtml += `<div style="margin-bottom:8px;padding:8px 10px;background:rgba(46,213,115,0.04);border-radius:8px;border:1px solid rgba(46,213,115,0.25);"><span style="color:var(--teal);font-size:0.8rem;font-weight:bold;display:block;margin-bottom:4px;">✅ 후천적 보완 역량</span><span style="font-size:0.74rem;color:var(--muted);display:block;margin-bottom:6px;">이름(언어 환경)이 자연스럽게 채워주고 있습니다.</span>${compensated.map(n => `<div style="margin-bottom:3px;"><strong style="color:var(--teal);font-size:0.82rem;">● ${n}번 ${GROWTH_DATA[n].t} ✅</strong></div>`).join("")}</div>`;
        }
        if (remaining.length > 0) {
            missingHtml += `<div style="padding:8px 10px;background:rgba(255,123,114,0.04);border-radius:8px;border:1px solid rgba(255,123,114,0.25);"><span style="color:var(--red);font-size:0.8rem;font-weight:bold;display:block;margin-bottom:4px;">🎯 집중 개발 역량</span><span style="font-size:0.74rem;color:var(--muted);display:block;margin-bottom:6px;">의식적인 행동 실천으로 채워나갈 성장 영역입니다.</span>${remaining.map(n => `<div style="margin-bottom:7px;"><strong style="color:var(--red);font-size:0.82rem;">● ${n}번 ${GROWTH_DATA[n].t}</strong><span style="font-size:0.79rem;color:#bbb;display:block;margin-top:2px;">${GROWTH_DATA[n].d}</span><span style="font-size:0.74rem;color:var(--gold);display:block;margin-top:2px;">📌 실천: ${GROWTH_DATA[n].action}</span></div>`).join("")}</div>`;
        }
    }
    setHtml("missingNumberArea", missingHtml);

    const birthStr = y.toString() + m.toString().padStart(2, "0") + d.toString().padStart(2, "0");
    const counts = Array(10).fill(0);
    for (const n of birthStr) if (n !== "0") counts[n]++;
    for (let i = 1; i <= 9; i++) {
        const cell = document.getElementById("lc" + i);
        if (cell) {
            const numDiv = cell.querySelector(".loshu-nums");
            numDiv.innerText = counts[i] > 0 ? i.toString().repeat(counts[i]) : "";
            counts[i] > 0 ? cell.classList.add("active") : cell.classList.remove("active");
        }
    }
    const has = n => counts[n] > 0;
    let finalHtml = "";
    let strengthText = "";
    LOSHU_STRENGTH_RULES.forEach(rule => {
        if (rule.requires.every(has)) strengthText += rule.text;
    });
    finalHtml += `<div class="loshu-report-card" style="border-left-color:var(--teal);"><h5 style="color:var(--teal);">🎯 강점 분석</h5><div class="desc-content">${strengthText || INTERPRETATION_TEXTS.loshuStrengthDefault}</div></div>`;

    let weaknessText = "";
    LOSHU_WEAKNESS_RULES.forEach(rule => {
        if (!has(rule.missing)) weaknessText += rule.text;
    });
    finalHtml += `<div class="loshu-report-card" style="border-left-color:#ff7b72;"><h5 style="color:#ff7b72;">⚠️ 보완 영역</h5><div class="desc-content">${weaknessText || INTERPRETATION_TEXTS.loshuWeaknessDefault}</div></div>`;

    let intensityTxt = "";
    if (LOSHU_INTENSITY_RULES) {
        LOSHU_INTENSITY_RULES.forEach(rule => {
            if (counts[rule.digit] >= rule.minCount) {
                intensityTxt += rule.text.replace('${count}', counts[rule.digit]);
            }
        });
    }

    const solutionTxt = (!has(4) || !has(8)) ? INTERPRETATION_TEXTS.loshuSolutionWhenWeak : INTERPRETATION_TEXTS.loshuSolutionWhenStable;
    // 강력한 재능 먼저 강조
    if (intensityTxt) {
        finalHtml += `<div class="loshu-report-card" style="border-left-color:var(--gold);"><h5 style="color:var(--gold);">🌟 강력한 타고난 재능</h5><div class="desc-content">${intensityTxt}</div></div>`;
    }

    finalHtml += `
    <div class="loshu-report-card" style="border-left-color:#fbc531;background:rgba(251,197,49,0.04);">
        <h5 style="color:#fbc531;">💡 핵심 성장 전략</h5>
        <div class="desc-content">
            <p style="margin-bottom:8px;">${INTERPRETATION_TEXTS.loshuCoreStructurePrefix} ${has(5) ? INTERPRETATION_TEXTS.loshuCoreStructureWith5 : INTERPRETATION_TEXTS.loshuCoreStructureWithout5}</p>
            ${(has(9) && has(5) && has(1)) ? `<p style="margin-bottom:8px;">${INTERPRETATION_TEXTS.loshuSuccessArrow}</p>` : ""}
            <p><b>📍 최종 솔루션:</b> ${solutionTxt}</p>
        </div>
    </div>`;
    setHtml("loshuAnalysis", finalHtml);

    // Loshu arrows detection and 상세 해설 추가
    try {
        const arrowKeys = detectLoshuArrows(counts);
        if (arrowKeys.length > 0) {
            const arrowEl = document.getElementById("loshuAnalysis");
            const arrowHtml = arrowKeys.map(k => {
                const info = (LOSHU_ARROWS && LOSHU_ARROWS[k]) || null;
                return info ? `<div class="loshu-report-card" style="border-left-color:var(--gold);background:rgba(217,177,111,0.04);"><h5 style="color:var(--gold);">⚡ 피타고라스 화살표 ${k}</h5><div class="desc-content">${info}</div></div>` : "";
            }).join("");
            if (arrowEl) arrowEl.innerHTML = arrowEl.innerHTML + arrowHtml;
        }
    } catch (e) {
        console.error("Arrow append error", e);
    }

    const cs = YEAR_STRATEGY[py] || YEAR_STRATEGY[1];
    setHtml("yearHighlightArea", `<div class="card" style="border:1px solid var(--accent);background:linear-gradient(145deg,rgba(163,102,255,0.12),rgba(20,184,166,0.08));padding:14px 16px;margin-top:20px;margin-bottom:16px;border-radius:12px;position:relative;overflow:hidden;"><div style="position:absolute;top:-6px;right:8px;font-size:3.5rem;color:rgba(163,102,255,0.08);font-weight:bold;line-height:1;">${py}</div><div style="font-size:0.72rem;color:var(--teal);font-weight:700;margin-bottom:4px;">🌟 ${curY}년 메인 테마</div><div style="font-size:1.1rem;font-weight:bold;color:var(--text);margin-bottom:8px;">${py}번. ${TITLE_MAP[py]}</div><p style="font-size:0.84rem;color:#ccc;line-height:1.55;position:relative;z-index:1;margin:0;"><b style="color:var(--gold);">목표:</b> ${cs.goal}<br><b style="color:var(--gold);">전략:</b> ${cs.action}</p></div>`);

    // ── 오늘의 최종 결론 ──
    const pyKw = TL_KEYWORD[py] || (TITLE_MAP[py] || "").split("의")[0] || "";
    const pmKw = (TITLE_MAP[pm] || "").split("의")[0] || "";
    const pdKw = (TITLE_MAP[pd] || "").split("의")[0] || "";
    setHtml("todayConclusion", `
        <div class="section-title">🔮 오늘의 최종 결론</div>
        <div class="today-conclusion">
            <div class="tc-title">📌 지금 이 순간, 당신에게 가장 필요한 메시지</div>
            <div class="tc-flow">
                <div class="tc-item">
                    <div class="tc-label">올해 (${curY})</div>
                    <div class="tc-num">${py}</div>
                    <div class="tc-kw">${pyKw}</div>
                </div>
                <div class="tc-sep">×</div>
                <div class="tc-item">
                    <div class="tc-label">${curM}월</div>
                    <div class="tc-num">${pm}</div>
                    <div class="tc-kw">${pmKw}</div>
                </div>
                <div class="tc-sep">×</div>
                <div class="tc-item tc-today">
                    <div class="tc-label">오늘 ${curD}일</div>
                    <div class="tc-num">${pd}</div>
                    <div class="tc-kw">${pdKw}</div>
                </div>
            </div>
            <div class="tc-msg">
                <div class="tc-msg-line"><strong style="color:var(--gold);">📌 올해의 방향 (${py}번):</strong> ${cs.goal}</div>
                <div class="tc-msg-line"><strong style="color:var(--teal);">⚡ 지금 바로 할 행동:</strong> ${cs.action}</div>
                <div class="tc-final">✦ 이 모든 흐름 속에서 당신의 핵심 과제는 <strong style="color:var(--gold);">${curCNum}번 · ${curCD.name}</strong>의 균형입니다. ${prescKeyword ? `<em style="color:#c5bde0;">지금 필요한 것: 「${prescKeyword}」</em>` : ""}</div>
            </div>
        </div>`);

    renderTimeline(mr_r, dr_r, py, curY, curM);

    const turningPoints = [];
    for (let age = 15; age <= 85; age++) {
        const checkYear = y + age;
        const ySum = String(checkYear).split("").reduce((a, b) => Number(a) + Number(b), 0);
        const yRed = reduceToSingle(ySum, true);
        const checkPy = reduceToSingle(yRed + mr_r + dr_r, true);
        if (checkPy === 1) turningPoints.push({ age, year: checkYear });
    }
    const upcoming = turningPoints.find(p => p.year >= curY) || turningPoints[0];
    if (upcoming) {
        setHtml("turningPointArea", `<div class="card" style="border:1px solid var(--gold);background:rgba(251,197,49,0.04);padding:10px 14px;border-radius:10px;"><div style="font-size:0.75rem;color:var(--gold);font-weight:700;margin-bottom:4px;">🚀 가장 가까운 인생 전환점</div><p style="font-size:0.84rem;line-height:1.55;color:var(--text);margin:0;">다음 변화는 <strong style="color:var(--accent);">${upcoming.year}년 (${upcoming.age}세)</strong>에 찾아옵니다. 새로운 9년 주기가 시작되는 이 시기, 인생의 중요한 결단과 환경 변화가 일어납니다.</p></div>`);
    }

    const monthlyGrid = document.getElementById("monthlyForecastGrid");
    if (monthlyGrid) {
        const monthlyCards = [];
        for (let mo = 1; mo <= 12; mo++) {
            const pm2 = reduceToSingle(py + mo, true);
            const isCurrentMonth = (mo === curM);
            const kw = MONTHLY_KEYWORDS[pm2] || (MONTHLY_KEYWORDS[(pm2 % 9 === 0) ? 9 : pm2 % 9] || "흐름");
            monthlyCards.push(`<div class="card" style="padding:10px 2px;${isCurrentMonth ? "border:1px solid var(--teal);background:rgba(20,184,166,0.1);" : "border:1px solid #222;"}"><span style="font-size:0.65rem;color:${isCurrentMonth ? "var(--teal)" : "var(--muted)"}">${mo}월</span><strong style="font-size:1.1rem;display:block;margin:2px 0;color:var(--accent);">${pm2}</strong><span style="font-size:0.6rem;color:#ccc;">${kw}</span></div>`);
        }
        monthlyGrid.innerHTML = monthlyCards.join("");
    }

    const weeklyTableBody = document.getElementById("weeklyTableBody");
    if (weeklyTableBody) {
        const weekRows = [];
        for (let i = 0; i < 7; i++) {
            const td = new Date();
            td.setDate(now.getDate() + i);
            const tM = td.getMonth() + 1;
            const tD = td.getDate();
            const tPm = reduceToSingle(py + tM);
            const tPd = reduceToSingle(tPm + tD, true);
            const adv = DAY_ADVICE[tPd] || { status: "평온", desc: "차분하게 에너지를 비축하세요." };
            let ss = "";
            if (tPd === 4 || tPd === 9) ss = "color:var(--red);font-weight:bold;";
            if (tPd === 1 || tPd === 8) ss = "color:var(--gold);font-weight:bold;";
            if (tPd === 11 || tPd === 22) ss = "color:var(--accent);font-weight:bold;";
            weekRows.push(`<tr><td style="font-size:0.85rem;">${tM}/${tD}</td><td class="p-num" style="font-size:1rem;color:var(--gold);">${tPd}</td><td style="${ss}">${adv.status}</td><td style="text-align:left;font-size:0.85rem;line-height:1.4;">${adv.desc}</td></tr>`);
        }
        weeklyTableBody.innerHTML = weekRows.join("");
    }

    const tip = DAILY_TIPS[pd] || DAILY_TIPS[1];
    document.getElementById("luckAction").innerText = tip.a;
    document.getElementById("luckCaution").innerText = tip.c;

    function generateComboComment(lpNum, pyNum) {
        if (lpNum === pyNum) return INTERPRETATION_TEXTS.comboCommentMatch.replace("{num}", lpNum);
        if (pyNum === 7) return INTERPRETATION_TEXTS.comboCommentYear7.replace("{lp}", lpNum);
        return INTERPRETATION_TEXTS.comboCommentDefault.replace("{lp}", lpNum).replace("{py}", pyNum);
    }
    document.getElementById("specialComment").innerText = generateComboComment(lp, py);

    document.getElementById("resultView").style.display = "block";
    document.getElementById("finalDownloadBtn").style.display = "flex";
    initAccordion();
}

async function downloadPDF() {
    const resultView = document.getElementById("resultView");
    if (resultView.style.display === "none") {
        showToast('"나의 라이프코드 확인하기"를 먼저 실행해주세요.', "warn", 2600);
        return;
    }

    const { jsPDF } = window.jspdf;
    const btn = document.getElementById("finalDownloadBtn");
    btn.style.display = "none";
    const element = document.querySelector(".container");

    try {
        const useMultiPage = confirm("PDF 저장 방식 선택:\n[확인] A4 여러 페이지(가독성)\n[취소] 긴 한 페이지(기존 방식)");
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: "#090a10",
            scrollY: -window.scrollY,
            windowHeight: element.scrollHeight
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgProps = pdf.getImageProperties(imgData);
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = (imgProps.height * pageWidth) / imgProps.width;
        const fileName = `라이프코드_분석리포트_${new Date().toLocaleDateString()}.pdf`;

        if (useMultiPage) {
            let heightLeft = imgHeight;
            let position = 0;
            pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            pdf.save(fileName);
            showToast("A4 다중 페이지 PDF로 저장되었습니다.", "success", 2600);
        } else {
            const longPdf = new jsPDF("p", "mm", [pageWidth, imgHeight]);
            longPdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
            longPdf.save(fileName);
            showToast("긴 한 페이지 PDF로 저장되었습니다.", "success", 2600);
        }
    } catch (error) {
        console.error("PDF 생성 실패:", error);
        showToast("PDF 생성 중 오류가 발생했습니다.", "error", 2800);
    } finally {
        btn.style.display = "flex";
    }
}

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js").then(reg => {
            console.log("서비스 워커 등록 성공!", reg);
        }).catch(err => {
            console.log("서비스 워커 등록 실패", err);
        });
    });
}

let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const installBanner = document.createElement("div");
    installBanner.style = "position:fixed; top:0; left:0; width:100%; background:var(--accent); color:white; padding:15px; text-align:center; z-index:10000; cursor:pointer; font-weight:bold;";
    installBanner.innerHTML = "✨ 편리한 이용을 위해 '라이프코드 앱'으로 저장하기 (클릭)";
    document.body.appendChild(installBanner);
    installBanner.addEventListener("click", () => {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => {
            installBanner.remove();
        });
    });
});
