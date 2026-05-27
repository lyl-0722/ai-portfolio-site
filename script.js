const projects = {
  "ai-design": {
    title: "AI-assisted automotive form design",
    desc: "Explored how concept expansion, direction refinement, and 3D generation can be stitched into one repeatable design workflow.",
    evidence: ["proposal", "workflow", "3d", "evaluation"],
    link: "#work"
  },
  idock: {
    title: "iDock AIGC module",
    desc: "Designed multimodal AIGC entry points and result loops for a desktop hardware experience, including voice input and generated output feedback.",
    evidence: ["hardware", "aigc", "voice ui", "feedback"],
    link: "#work"
  },
  "video-agent": {
    title: "Internal AIGC agent",
    desc: "Turned video production into a structured agent workflow spanning input, shot breakdown, keyframe generation, preview, and revision.",
    evidence: ["agent", "workflow", "video", "eval"],
    link: "#work"
  },
  management: {
    title: "AI team management architecture",
    desc: "Built a reusable team AI collaboration layer around Skill Hub, Agent orchestration, a GitHub skill library, and dashboard-based management.",
    evidence: ["Skill Hub", "Agent orchestration", "GitHub skill library", "Dashboard"],
    link: "https://github.com/lyl-0722/team-skills-demo",
    image: "assets/team-architecture.png",
    dashboard: "https://lyl-0722.github.io/skill-dashboard/",
    dashboardLabel: "View dashboard"
  },
  skills: {
    title: "20+ team skills built and iterated",
    desc: "Maintained a reusable set of team skills for research, reporting, competitor analysis, product detail generation, and recurring AI monitoring tasks.",
    evidence: ["20+ skills", "iteration", "reuse", "tracking"],
    link: "https://lyl-0722.github.io/skill-dashboard/"
  },
  thesis: {
    title: "Thesis: foundational algorithm application",
    desc: "Used data pipelines, XGBoost, and explainability analysis to study urban internal flood mechanisms and model-level causality hints.",
    evidence: ["xgboost", "shap", "data", "explainability"],
    link: "#experiment"
  },
  coze: {
    title: "Coze resume optimization agent",
    desc: "Built a career tool for JD matching, resume rewriting, gap analysis, and learning path generation for students and career switchers.",
    evidence: ["coze", "resume", "career", "agent"],
    link: "#experiment"
  },
  anniversary: {
    title: "SZU 40th anniversary AI interaction",
    desc: "Designed an on-site multimodal interaction flow for capture, generation, download, and rapid iteration under public event conditions.",
    evidence: ["offline", "multimodal", "aigc", "mvp"],
    link: "#experiment"
  }
};

const initWebglBackground = () => {
  const ambient = document.querySelector(".ambient");
  if (!ambient) return;

  let canvas = ambient.querySelector(".webgl-bg");
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.className = "webgl-bg";
    ambient.prepend(canvas);
  }

  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    powerPreference: "high-performance",
    preserveDrawingBuffer: false
  });

  if (!gl) {
    canvas.style.display = "none";
    return;
  }

  const vertexSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentSource = `
    precision highp float;

    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_time;
    varying vec2 v_uv;

    mat2 rot(float a) {
      float s = sin(a);
      float c = cos(a);
      return mat2(c, -s, s, c);
    }

    float hash(vec2 p) {
      p = fract(p * vec2(127.1, 311.7));
      p += dot(p, p + 34.123);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amp = 0.5;
      for (int i = 0; i < 5; i++) {
        value += amp * noise(p);
        p = rot(0.45) * p * 2.02 + 4.7;
        amp *= 0.53;
      }
      return value;
    }

    float softBlob(vec2 p, vec2 c, float radius, float softness) {
      return smoothstep(radius, radius - softness, length(p - c));
    }

    float softRibbon(vec2 p, float offset, float width, float amp, float speed, float blur) {
      float wave = sin(p.x * 0.92 + u_time * speed + offset) * amp;
      wave += sin(p.x * 1.86 - u_time * speed * 0.58 + offset * 1.7) * amp * 0.42;
      wave += cos(p.x * 0.55 + u_time * speed * 0.35 + offset * 0.9) * amp * 0.24;
      return smoothstep(width, width - blur, abs(p.y - wave));
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
      vec2 mouse = (u_mouse * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);

      vec2 q = p;
      q.x += fbm(p * 0.44 + vec2(u_time * 0.026, -u_time * 0.018)) * 0.84;
      q.y += fbm(p * 0.38 + vec2(-u_time * 0.022, u_time * 0.028)) * 0.64;

      float fieldA = fbm(q * 0.88 + vec2(u_time * 0.024, -u_time * 0.016));
      float fieldB = fbm((q + vec2(2.7, -1.2)) * 1.26 - vec2(u_time * 0.02, u_time * 0.02));
      float fieldC = fbm((q - vec2(1.1, 1.9)) * 1.8 + u_time * 0.018);

      vec2 driftA = vec2(sin(u_time * 0.15) * 0.34, cos(u_time * 0.11) * 0.22);
      vec2 driftB = vec2(cos(u_time * 0.09) * 0.28, sin(u_time * 0.16) * 0.24);
      vec2 driftC = vec2(sin(u_time * 0.08 + 1.7) * 0.32, cos(u_time * 0.12 + 0.9) * 0.22);

      float cloudA = softBlob(q, vec2(-0.78, -0.04) + driftA, 1.68, 1.2);
      float cloudB = softBlob(q, vec2(0.92, 0.1) + driftB, 1.54, 1.16);
      float cloudC = softBlob(q, vec2(0.04, -0.9) + driftC, 1.34, 1.08);

      float ribbonA = softRibbon((q + vec2(0.04, 0.02)) * rot(-0.16), 0.24, 0.88, 0.32, 0.12, 0.72);
      float ribbonB = softRibbon((q + vec2(-0.12, -0.18)) * rot(0.12), 1.86, 0.78, 0.28, 0.1, 0.66);
      float ribbonC = softRibbon((q + vec2(0.08, -0.32)) * rot(-0.05), 3.1, 0.62, 0.18, 0.08, 0.54);

      float aurora = smoothstep(0.18, 0.9, fieldA * 0.7 + fieldB * 0.58 + cloudA * 0.44 + cloudB * 0.48);
      float glow = smoothstep(0.08, 1.0, cloudA * 0.82 + cloudB * 0.76 + cloudC * 0.56 + fieldC * 0.28 + ribbonA * 0.52 + ribbonB * 0.48 + ribbonC * 0.34);
      float pulse = 0.94 + 0.06 * sin(u_time * 0.55 + fieldA * 6.283);

      float mouseGlow = smoothstep(0.82, 0.0, length(p - mouse));
      float centerShade = smoothstep(1.45, 0.08, length(p * vec2(0.84, 1.0)));
      float vignette = smoothstep(1.72, 0.18, length(p * vec2(0.76, 1.0)));

      vec3 ink = vec3(0.01, 0.012, 0.008);
      vec3 violet = vec3(0.60, 0.36, 0.96);
      vec3 purple = vec3(0.28, 0.17, 0.54);
      vec3 lime = vec3(0.68, 0.98, 0.08);
      vec3 moss = vec3(0.18, 0.34, 0.08);

      vec3 color = ink;
      color += mix(purple, violet, fieldA) * (0.32 + cloudA * 0.28);
      color += mix(moss, lime, fieldB) * (0.28 + cloudB * 0.3);
      color += mix(violet, lime, aurora) * glow * pulse * 0.34;
      color += mix(violet, lime, 0.5 + 0.5 * sin(u_time * 0.16 + q.x * 0.66)) * ribbonA * 0.28;
      color += mix(lime, violet, 0.5 + 0.5 * cos(u_time * 0.14 + q.x * 0.58)) * ribbonB * 0.24;
      color += mix(violet, lime, 0.5 + 0.5 * sin(u_time * 0.1 + q.x * 0.42)) * ribbonC * 0.14;
      color += violet * cloudA * 0.08;
      color += lime * cloudB * 0.08;
      color += vec3(0.72, 1.0, 0.22) * mouseGlow * 0.08;
      color += vec3(0.58, 0.36, 1.0) * mouseGlow * 0.07;
      color *= 0.34 + centerShade * 0.24;
      color *= 0.24 + vignette * 0.92;

      float scan = sin((uv.y + u_time * 0.018) * 760.0) * 0.004;
      color += scan;
      color = pow(color, vec3(0.98));

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const createShader = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) {
    canvas.style.display = "none";
    return;
  }

  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn(gl.getProgramInfoLog(program));
    canvas.style.display = "none";
    return;
  }

  const positionLocation = gl.getAttribLocation(program, "a_position");
  const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
  const mouseLocation = gl.getUniformLocation(program, "u_mouse");
  const timeLocation = gl.getUniformLocation(program, "u_time");
  const buffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );

  const pointer = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.45 };

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const width = Math.floor(window.innerWidth * dpr);
    const height = Math.floor(window.innerHeight * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  };

  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (event) => {
    pointer.x += (event.clientX - pointer.x) * 0.28;
    pointer.y += (event.clientY - pointer.y) * 0.28;
  });

  const start = performance.now();
  const render = () => {
    resize();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    gl.uniform2f(mouseLocation, pointer.x * dpr, (window.innerHeight - pointer.y) * dpr);
    gl.uniform1f(timeLocation, (performance.now() - start) * 0.001);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(render);
  };

  render();
};

initWebglBackground();

const experienceGrid = document.querySelector(".experience-grid");
if (experienceGrid) {
  ["management", "ai-design", "video-agent", "idock", "skills"].forEach((key) => {
    const card = experienceGrid.querySelector(`[data-project="${key}"]`);
    if (card) {
      experienceGrid.appendChild(card);
    }
  });
}

projects.management = {
  ...projects.management,
  title: "AI team management architecture",
  desc: "Built a team-level AI operating framework around Skill Hub, Agent orchestration, GitHub skill versioning, knowledge retrieval, and a dashboard for tracking usage, scoring, contributors, and document output.",
  evidence: ["Skill Hub", "Agent orchestration", "GitHub skill library", "Knowledge base", "Dashboard"],
  link: "https://github.com/lyl-0722/team-skills-demo",
  dashboard: "https://lyl-0722.github.io/skill-dashboard/",
  screenshots: [
    "assets/management-01.jpg",
    "assets/management-02.jpg",
    "assets/management-03.png",
    "assets/management-04.png"
  ]
};

const dialog = document.getElementById("projectDialog");
const dialogTitle = document.getElementById("dialogTitle");
const dialogDesc = document.getElementById("dialogDesc");
const dialogGallery = document.getElementById("dialogGallery");
const dialogEvidence = document.getElementById("dialogEvidence");

let cursorFrame = 0;
window.addEventListener("pointermove", (event) => {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  cancelAnimationFrame(cursorFrame);
  cursorFrame = requestAnimationFrame(() => {
    document.body.style.setProperty("--cursor-x", `${event.clientX}px`);
    document.body.style.setProperty("--cursor-y", `${event.clientY}px`);
  });
});

const renderDialogEvidence = (item) => {
  if (!dialogEvidence) return;
  dialogEvidence.innerHTML = "";
  (item.evidence || []).forEach((label) => {
    const chip = document.createElement("span");
    chip.textContent = label;
    dialogEvidence.appendChild(chip);
  });
};

const renderDialogGallery = (item) => {
  if (!dialogGallery) return;
  dialogGallery.innerHTML = "";

  const screenshots = Array.isArray(item.screenshots) ? item.screenshots.filter(Boolean) : [];
  const frames = screenshots.length ? screenshots : item.image ? [item.image] : [];

  if (!frames.length) {
    const placeholder = document.createElement("div");
    placeholder.className = "dialog-shot dialog-placeholder";
    placeholder.textContent = "Screens coming soon.";
    dialogGallery.appendChild(placeholder);
    return;
  }

  frames.forEach((src, index) => {
    const figure = document.createElement("figure");
    figure.className = "dialog-shot";

    const img = document.createElement("img");
    img.src = src;
    img.alt = `${item.title} screenshot ${index + 1}`;
    img.loading = index === 0 ? "eager" : "lazy";
    img.decoding = "async";

    figure.appendChild(img);
    dialogGallery.appendChild(figure);
  });

  dialogGallery.scrollLeft = 0;
};

if (dialogGallery) {
  dialogGallery.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      dialogGallery.scrollBy({ left: event.deltaY, behavior: "smooth" });
    },
    { passive: false }
  );
}

document.querySelectorAll(".work-card").forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rx = ((y / rect.height) - 0.5) * -5;
    const ry = ((x / rect.width) - 0.5) * 5;
    card.style.setProperty("--mx", `${x}px`);
    card.style.setProperty("--my", `${y}px`);
    card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-8px) scale(1.025)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });

  card.addEventListener("click", () => {
    const item = projects[card.dataset.project];
    if (!item || !dialog) return;

    dialogTitle.textContent = item.title;
    dialogDesc.textContent = item.desc;
    renderDialogEvidence(item);
    renderDialogGallery(item);

    document.body.classList.add("dialog-open");
    dialog.showModal();
  });
});

if (dialog) {
  dialog.addEventListener("click", (event) => {
    const box = dialog.querySelector(".dialog-card");
    if (box && !box.contains(event.target)) {
      dialog.close();
    }
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("dialog-open");
  });
}
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16, rootMargin: "0px 0px -10% 0px" }
);

const revealTargets = [
  ...document.querySelectorAll(".metric"),
  ...document.querySelectorAll(".belief-grid > .section-kicker, .belief-grid > h2, .belief-copy"),
  ...document.querySelectorAll(".section-head, .work-card, .contact, .contact-panel")
];

revealTargets.forEach((el, index) => {
  el.classList.add("scroll-reveal");
  el.style.setProperty("--reveal-delay", `${(index % 6) * 65}ms`);
  observer.observe(el);
});
