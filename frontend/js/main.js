/* ============================================
   AI Interview Analyzer - Main JavaScript
   ============================================ */

const API_BASE = window.location.origin;

const SAMPLES = {
    junior: `Tell me about yourself and why you're interested in this role.

I am a recent graduate with a degree in Computer Science from State University. During my studies, I developed a strong passion for web development and software engineering. I completed three internships where I gained hands-on experience with React, Node.js, and Python.

In my most recent internship at TechStart Inc, I led a small team of four developers to build a customer management dashboard. We successfully delivered the project two weeks ahead of schedule, which resulted in a 30% improvement in the client support team's response time. I implemented the front-end using React and designed the REST API with Express.js.

I am particularly drawn to this position because of your company's commitment to innovation and using technology to solve real-world problems. I believe my technical skills combined with my ability to collaborate effectively with cross-functional teams make me a strong candidate. I am eager to learn from experienced developers and contribute meaningfully to your projects.`,

    senior: `Describe your leadership style and a time you managed a challenging project.

Throughout my 12 years of experience in project management, I have developed a collaborative and empowering leadership style. I believe in setting clear expectations, providing the resources my team needs, and then trusting them to deliver exceptional results.

One particularly challenging project involved migrating our entire infrastructure to cloud-based services while maintaining 99.9% uptime. I managed a cross-functional team of 25 members across three time zones. I implemented agile methodologies, established daily standups, and created a comprehensive risk mitigation strategy.

The project was delivered on time and under budget, resulting in a 40% reduction in operational costs and a 60% improvement in system performance. I personally negotiated with vendors, resolved escalated technical issues, and maintained transparent communication with all stakeholders throughout the process.

This experience reinforced my belief that effective leadership requires both strategic vision and attention to detail. I consistently mentored junior team members, and three of them have since been promoted to senior positions.`,

    creative: `How do you approach creative problem-solving?

My approach to creative problem-solving begins with thoroughly understanding the problem from multiple perspectives. I start by gathering extensive research, analyzing user data, and conducting stakeholder interviews to ensure I have a comprehensive understanding.

For example, when our marketing team was struggling with declining engagement rates, I initiated a cross-departmental brainstorming session. I facilitated an ideation workshop using design thinking principles, which led to the development of an innovative interactive content strategy.

I proposed creating personalized video experiences for our users, which required close collaboration with the design, engineering, and analytics teams. I managed the project from concept to launch, overseeing the creation of a dynamic content platform that adapted to individual user preferences.

The results were outstanding. We achieved a 185% increase in user engagement, a 45% improvement in conversion rates, and the campaign won the industry award for digital innovation. This experience demonstrated my ability to combine creative thinking with analytical rigor and effective project management.

I am passionate about pushing boundaries and finding unconventional solutions that drive meaningful business outcomes.`
};

let currentFile = null;

/* ============================================
   3D Background Canvas
   ============================================ */

class ParticleBackground {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.particles = [];
        this.mouse = { x: null, y: null };
        this.resize();
        this.init();
        this.animate();

        window.addEventListener("resize", () => this.resize());
        window.addEventListener("mousemove", (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        const count = Math.min(Math.floor((this.canvas.width * this.canvas.height) / 12000), 120);
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.5 + 0.1,
                hue: Math.random() > 0.5 ? 240 : 270,
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;

            if (this.mouse.x !== null) {
                const dx = this.mouse.x - p.x;
                const dy = this.mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    const force = (200 - dist) / 200;
                    p.vx -= (dx / dist) * force * 0.02;
                    p.vy -= (dy / dist) * force * 0.02;
                }
            }

            p.vx *= 0.99;
            p.vy *= 0.99;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.alpha})`;
            this.ctx.fill();

            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `hsla(255, 80%, 65%, ${0.08 * (1 - dist / 120)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

/* ============================================
   Navigation
   ============================================ */

function navigateTo(page) {
    document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
    document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));

    const target = document.getElementById(`page-${page}`);
    if (target) {
        target.classList.add("active");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const navLink = document.querySelector(`.nav-link[data-page="${page}"]`);
    if (navLink) navLink.classList.add("active");

    if (page === "history") loadHistory();
}

function scrollToFeatures() {
    const el = document.getElementById("features");
    if (el) el.scrollIntoView({ behavior: "smooth" });
}

/* ============================================
   Tabs
   ============================================ */

document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
        document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
        btn.classList.add("active");
        const tab = document.getElementById(`tab-${btn.dataset.tab}`);
        if (tab) tab.classList.add("active");
    });
});

/* ============================================
   Text Analysis
   ============================================ */

const responseTextarea = document.getElementById("interview-response");
const charCountEl = document.getElementById("char-count");

responseTextarea.addEventListener("input", () => {
    charCountEl.textContent = responseTextarea.value.length;
});

async function analyzeText() {
    const text = responseTextarea.value.trim();
    if (!text) {
        shakeElement(document.getElementById("tab-text"));
        return;
    }

    const btn = document.getElementById("analyze-btn");
    const spinner = document.getElementById("analyze-spinner");
    btn.disabled = true;
    btn.querySelector("span").textContent = "Analyzing...";
    spinner.classList.add("active");

    try {
        const res = await fetch(`${API_BASE}/api/analyze/text`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        showResults(data.result);
        navigateTo("results");
    } catch (err) {
        alert("Analysis failed: " + err.message);
    } finally {
        btn.disabled = false;
        btn.querySelector("span").textContent = "Analyze Response";
        spinner.classList.remove("active");
    }
}

/* ============================================
   File Analysis
   ============================================ */

const uploadZone = document.getElementById("upload-zone");
const fileInput = document.getElementById("file-input");

uploadZone.addEventListener("click", () => fileInput.click());

uploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadZone.classList.add("dragover");
});

uploadZone.addEventListener("dragleave", () => {
    uploadZone.classList.remove("dragover");
});

uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.classList.remove("dragover");
    if (e.dataTransfer.files.length) handleFileSelect(e.dataTransfer.files[0]);
});

fileInput.addEventListener("change", (e) => {
    if (e.target.files.length) handleFileSelect(e.target.files[0]);
});

function handleFileSelect(file) {
    const allowed = ["txt", "pdf", "docx"];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!allowed.includes(ext)) {
        alert("Unsupported file type. Please use TXT, PDF, or DOCX.");
        return;
    }

    currentFile = file;
    document.getElementById("file-name").textContent = file.name;
    document.getElementById("file-size").textContent = formatSize(file.size);
    document.getElementById("selected-file").style.display = "flex";
    uploadZone.style.display = "none";
    document.getElementById("upload-btn").disabled = false;
}

function clearFile() {
    currentFile = null;
    fileInput.value = "";
    document.getElementById("selected-file").style.display = "none";
    uploadZone.style.display = "block";
    document.getElementById("upload-btn").disabled = true;
}

function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
}

async function analyzeFile() {
    if (!currentFile) return;

    const btn = document.getElementById("upload-btn");
    const spinner = document.getElementById("upload-spinner");
    btn.disabled = true;
    btn.querySelector("span").textContent = "Uploading & Analyzing...";
    spinner.classList.add("active");

    try {
        const formData = new FormData();
        formData.append("file", currentFile);

        const res = await fetch(`${API_BASE}/api/analyze/file`, {
            method: "POST",
            body: formData,
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        showResults(data.result);
        navigateTo("results");
    } catch (err) {
        alert("Analysis failed: " + err.message);
    } finally {
        btn.disabled = false;
        btn.querySelector("span").textContent = "Analyze File";
        spinner.classList.remove("active");
    }
}

/* ============================================
   Display Results
   ============================================ */

function showResults(result) {
    animateScore(result.overall_score);
    document.getElementById("overall-label").textContent = getScoreLabel(result.overall_score);
    document.getElementById("score-summary").textContent = getScoreSummary(result);

    animateMetric("comm", result.communication);
    animateMetric("conf", result.confidence);
    animateMetric("vocab", result.vocabulary);
    animateMetric("clar", result.clarity);

    const polarity = result.sentiment.polarity;
    const markerPos = ((polarity + 1) / 2) * 100;
    document.getElementById("gauge-fill").style.left = `calc(${markerPos}% - 8px)`;
    document.getElementById("pos-words").textContent = result.sentiment.positive_words;
    document.getElementById("neg-words").textContent = result.sentiment.negative_words;

    document.getElementById("filler-total").textContent = result.filler_words.total;
    const fillerRating = document.getElementById("filler-rating");
    fillerRating.textContent = result.filler_words.rating;
    fillerRating.style.color =
        result.filler_words.rating === "Excellent"
            ? "#22c55e"
            : result.filler_words.rating === "Good"
            ? "#f59e0b"
            : "#ef4444";

    const fillerList = document.getElementById("filler-list");
    fillerList.innerHTML = "";
    for (const [word, count] of Object.entries(result.filler_words.words)) {
        const tag = document.createElement("span");
        tag.className = "filler-tag";
        tag.textContent = `${word} (x${count})`;
        fillerList.appendChild(tag);
    }
    if (result.filler_words.total === 0) {
        fillerList.innerHTML = '<span style="color: var(--green-light); font-size: 13px;">No filler words detected!</span>';
    }

    const strengthsList = document.getElementById("strengths-list");
    strengthsList.innerHTML = "";
    result.strengths.forEach((s) => {
        const li = document.createElement("li");
        li.textContent = s;
        strengthsList.appendChild(li);
    });

    const improvementsList = document.getElementById("improvements-list");
    improvementsList.innerHTML = "";
    result.improvements.forEach((s) => {
        const li = document.createElement("li");
        li.textContent = s;
        improvementsList.appendChild(li);
    });

    const keywordsContainer = document.getElementById("keywords-container");
    keywordsContainer.innerHTML = "";
    const categories = Object.keys(result.keywords_found);
    if (categories.length === 0) {
        keywordsContainer.innerHTML = '<p class="keywords-empty">No industry-specific keywords detected.</p>';
    } else {
        categories.forEach((cat) => {
            const group = document.createElement("div");
            group.className = "keyword-group";
            group.innerHTML = `
                <div class="keyword-category">${cat}</div>
                <div class="keyword-words">${result.keywords_found[cat].join(", ")}</div>
            `;
            keywordsContainer.appendChild(group);
        });
    }

    const verbTags = document.getElementById("verb-tags");
    verbTags.innerHTML = "";
    result.action_verbs_used.forEach((v) => {
        const tag = document.createElement("span");
        tag.className = "verb-tag";
        tag.textContent = v;
        verbTags.appendChild(tag);
    });
    if (result.action_verbs_used.length === 0) {
        verbTags.innerHTML = '<span style="color: var(--text-muted); font-size: 13px;">No strong action verbs detected.</span>';
    }

    document.getElementById("sum-words").textContent = result.word_count;
    document.getElementById("sum-sentences").textContent = result.sentence_count;
    document.getElementById("sum-avglen").textContent = result.avg_sentence_length;
}

function animateScore(score) {
    const circle = document.getElementById("score-circle");
    const numberEl = document.getElementById("overall-score");
    const circumference = 565;
    const offset = circumference - (score / 100) * circumference;

    circle.style.transition = "none";
    circle.style.strokeDashoffset = circumference;
    numberEl.textContent = "0";

    requestAnimationFrame(() => {
        circle.style.transition = "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)";
        circle.style.strokeDashoffset = offset;

        let current = 0;
        const step = score / 60;
        const timer = setInterval(() => {
            current += step;
            if (current >= score) {
                current = score;
                clearInterval(timer);
            }
            numberEl.textContent = Math.round(current);
        }, 25);
    });
}

function animateMetric(prefix, data) {
    const bar = document.getElementById(`${prefix}-bar`);
    const scoreEl = document.getElementById(`${prefix}-score`);
    const detailEl = document.getElementById(`${prefix}-detail`);

    bar.style.width = "0%";
    scoreEl.textContent = "0";
    detailEl.textContent = data.detail || "";

    setTimeout(() => {
        bar.style.width = `${data.score}%`;
        let current = 0;
        const step = data.score / 40;
        const timer = setInterval(() => {
            current += step;
            if (current >= data.score) {
                current = data.score;
                clearInterval(timer);
            }
            scoreEl.textContent = Math.round(current);
        }, 30);
    }, 300);
}

function getScoreLabel(score) {
    if (score >= 85) return "Excellent Performance!";
    if (score >= 70) return "Good Performance";
    if (score >= 50) return "Average Performance";
    if (score >= 30) return "Needs Improvement";
    return "Significant Improvement Needed";
}

function getScoreSummary(result) {
    const parts = [];
    if (result.communication.score >= 70) parts.push("strong communication");
    if (result.confidence.score >= 70) parts.push("confident tone");
    if (result.vocabulary.score >= 70) parts.push("rich vocabulary");
    if (result.clarity.score >= 70) parts.push("clear structure");

    if (parts.length > 0) {
        return `Your response demonstrates ${parts.join(", ")}. ${result.improvements[0] || ""}`;
    }
    return `Your overall score is ${result.overall_score}/100. ${result.improvements[0] || "Keep practicing to improve."}`;
}

function shakeElement(el) {
    el.style.animation = "none";
    el.offsetHeight;
    el.style.animation = "shake 0.4s ease";
    setTimeout(() => (el.style.animation = ""), 400);
}

/* ============================================
   Load Sample Responses
   ============================================ */

function loadSample(type) {
    responseTextarea.value = SAMPLES[type] || "";
    charCountEl.textContent = responseTextarea.value.length;
    responseTextarea.focus();
}

/* ============================================
   History
   ============================================ */

async function loadHistory() {
    try {
        const res = await fetch(`${API_BASE}/api/history`);
        const data = await res.json();
        renderHistory(data.analyses);
    } catch (err) {
        console.error("Failed to load history:", err);
    }
}

function renderHistory(analyses) {
    const container = document.getElementById("history-list");
    if (!analyses || analyses.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="28" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>
                    <path d="M32 20V34L40 38" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <h3>No analyses yet</h3>
                <p>Start by analyzing your first interview response</p>
                <button class="btn btn-primary" onclick="navigateTo('analyze')">Start Analyzing</button>
            </div>
        `;
        return;
    }

    container.innerHTML = "";
    analyses.forEach((a) => {
        const score = a.result.overall_score;
        const item = document.createElement("div");
        item.className = "history-item";
        item.onclick = () => {
            showResults(a.result);
            navigateTo("results");
        };
        item.innerHTML = `
            <div class="history-score">${score}</div>
            <div class="history-info">
                <h4>${a.text_preview || a.filename || "Text Analysis"}</h4>
                <p>${a.result.word_count} words | ${a.result.sentence_count} sentences</p>
            </div>
            <div class="history-meta">
                <div class="date">${formatDate(a.created_at)}</div>
                <div class="type">${a.input_type}</div>
            </div>
        `;
        container.appendChild(item);
    });
}

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/* ============================================
   Counter Animation (Stats)
   ============================================ */

function animateCounters() {
    document.querySelectorAll(".stat-number").forEach((el) => {
        const target = parseInt(el.dataset.target);
        if (!target) return;
        let current = 0;
        const step = target / 50;
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            el.textContent = Math.round(current);
        }, 30);
    });
}

/* ============================================
   Init
   ============================================ */

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("bg-canvas");
    if (canvas) new ParticleBackground(canvas);

    setTimeout(animateCounters, 500);

    document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            navigateTo(link.dataset.page);
        });
    });

    const style = document.createElement("style");
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
});
