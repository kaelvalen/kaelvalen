export type Locale = "en" | "tr";

/** Paragraph made of plain strings and inline links. */
export type Rich = (string | { t: string; href: string })[];

const TRAINSCOPE = "https://pypi.org/project/trainscope/";
const CERATA = "https://github.com/kaelvalen/cerata";
const NOESIS = "https://github.com/kaelvalen/noesis";
const FINDINGS = "https://github.com/kaelvalen/noesis/blob/main/FINDINGS.md";

export const en = {
  skip: "Skip to content",
  nav: {
    research: "Research",
    projects: "Projects",
    toolbox: "Toolbox",
    contact: "Contact",
    primary: "Primary",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    search: "Search",
    openPalette: "Open command palette",
  },
  theme: { toLight: "Switch to light theme", toDark: "Switch to dark theme" },
  lang: { switchTo: "Türkçe'ye geç", short: "TR" },

  hero: {
    eyebrow: "ML architecture researcher",
    firstName: "Mehmet Arda",
    lastName: "Hakbilen",
    alias: "( kael valen )",
    lead: "I study why sequence architectures are built the way they are, rebuilding them from scratch to test which assumptions hold outside language.",
    location: "Ankara, TR",
    ctaPrimary: "Read the research",
    ctaSecondary: "Get in touch",
    status: {
      label: "Now running",
      title: "trainscope: loss-spike flight recorder",
      lines: [
        "CUSUM change-point detection (5-20 steps early)",
        "280+ noise scenarios tested · WandB auto-attach",
      ],
      cta: "pypi.org/project/trainscope",
    },
    metrics: [
      { value: "0.0%", label: "false positives across 280+ held-out noise scenarios" },
      { value: "5–20", label: "steps of early warning before a loss spike" },
      { value: "100%", label: "detection for 0.10σ–0.50σ drift" },
      { value: "76.77", label: "CERATA accuracy vs 59.30 for the v1 expert bank" },
    ],
    metricsLabel: "Key figures",
  },

  research: {
    title: "Research",
    heading: "Loss dynamics, sequence architectures, and empirical limits.",
    p1: [
      "My main focus is ",
      { t: "trainscope", href: TRAINSCOPE },
      ": a post-mortem flight recorder for LLM training loss spikes. Its CUSUM change-point detector catches gradual loss drift 5-20 steps before it turns into a full spike, validated with 0.0% false positives across 280+ noise scenarios and 100% sensitivity for 0.10σ-0.50σ drift. When failure occurs, it reconstructs which layer moved first, whether from activation kurtosis or gradient explosion.",
    ] as Rich,
    p2: [
      "Where trainscope watches training runs, ",
      { t: "CERATA", href: CERATA },
      " asks what a frozen model can still learn after deployment. Learning is an API call: a FAST key-value write for a single item, a MEDIUM closed-form edit from float64 sufficient statistics, and a SLOW consolidation into frozen experts. Every write and forget is guarded: locality, reversibility, order invariance, zero-parameter routing. Forget is an exact downdate. On frozen ViT-B/16 features (CIFAR-100, 20 tasks), its closed-form readout beats the v1 expert bank with zero trained parameters: 76.77 vs 59.30.",
    ] as Rich,
    p3: [
      "Earlier, I closed out ",
      { t: "NOESIS", href: NOESIS },
      ", testing if Titans-style associative memory matrices could inject continual learning directly into a frozen LLM manifold. The result was negative: frozen manifolds cannot assimilate untrained vector injections without distortion (0% recall on a 50-fact benchmark; full analysis in ",
      { t: "FINDINGS.md", href: FINDINGS },
      ").",
    ] as Rich,
    marginalia: "Marginalia",
    notes: [
      "guards on every write / forget / consolidate: locality (canary argmax flips), reversibility (trial undo/redo, max|dW| ≤ 1e-10), order invariance (seeded permutation re-sum), router purity (0 trainable scalars).",
      "forget is a downdate: the medium path subtracts an edit's float64 sufficient statistics; removing the last edit restores the base model bitwise.",
      "constraint: everything runs on a single RTX 5060 Laptop within 8 GB VRAM.",
    ],
    links: [
      { label: "pypi.org/project/trainscope", note: "loss spike debugger", href: TRAINSCOPE },
      { label: "github.com/kaelvalen/cerata", note: "learning after deployment", href: CERATA },
      { label: "noesis / FINDINGS.md", note: "continual learning", href: FINDINGS },
    ],
    benchTitle: "Learning after deployment: CIFAR-100, 20 tasks, frozen ViT-B/16",
    benchConfig: "config",
    benchAcc: "accuracy (%)",
    benchRows: [
      "oracle routing (ceiling)",
      "cerata: closed-form ridge, 0 params",
      "per-task expert bank",
      "NCM prototype, training-free",
      "iCaRL",
      "v1 PAL-MoE",
    ],
    specsTitle: "Validation specs",
    specs:
      "frozen ViT-B/16 · CIFAR-100 · 20 tasks · 3 seeds · RTX 5060. Closed-form readouts: 0 parameters, 0 optimizer steps; not comparable to published CIL tables (ImageNet-1K features, not 21K).",
  },

  projects: {
    title: "Projects",
    filterLabel: "Filter projects",
    filters: { all: "all", ml: "ml & research", systems: "systems", apps: "apps & tools" },
    shown: (n: number, total: number) => `showing ${n} of ${total} projects`,
    open: "open",
    cat: { ml: "ml & research", systems: "systems", apps: "apps & tools" },
    status: {
      active: "active",
      PyPI: "PyPI",
      "crates.io": "crates.io",
      public: "public",
      superseded: "superseded",
      archived: "archived",
    },
    blurbs: {
      cerata: "learning after deployment on a frozen model: closed-form edits, exact forgetting",
      trainscope: "loss-spike flight recorder for LLM training runs",
      "latch-lang": "a programming language of my own",
      connor: "terminal-native CI/CD runner (DAG execution, no YAML)",
      weave: "local-first, plugin-based productivity system",
      beyond_transformer: "PULSE: early sequence-architecture prototype, kept as design record",
      nanonet: "monitoring & control for distributed services, ~70k lines",
    } as Record<string, string>,
    footnote: "all projects above are original work (no forks). full index on",
  },

  toolbox: {
    title: "Toolbox",
    groups: [
      { label: "machine learning", items: "PyTorch · Triton · CUDA" },
      { label: "systems", items: "Rust · Go · C++" },
      { label: "web", items: "TypeScript · React · Next.js" },
      { label: "environment", items: "NixOS · Docker · Git" },
    ],
    note: "laptop runs NixOS. CERATA runs on a single RTX 5060: if the architecture does not fit in 8 GB, the architecture changes.",
  },

  contact: {
    title: "Contact",
    lead: "Write to me at",
    copy: "copy",
    copied: "copied",
    copiedMsg: "email copied to clipboard",
    copyLabel: "Copy email address",
    body: "Research chatter, collaboration, or just to argue about state-space models.",
  },

  footer: "© 2026 M. A. Hakbilen · no trackers · set in Instrument Serif & Geist",
  top: "back to top",

  palette: {
    label: "Command palette",
    placeholder: "Type a command or search (e.g. cerata, trainscope)...",
    empty: "No matching commands",
    hint: "↑↓ to navigate · ↵ to select",
    close: "esc to close",
    copied: "✓ copied",
    commands: "Commands",
    categories: { navigation: "navigation", repositories: "repositories", action: "action" },
    items: {
      research: { title: "01 Research · CERATA Architecture", desc: "Jump to section 01 (closed-form edits, exact forgetting)" },
      projects: { title: "02 Projects Index", desc: "Jump to section 02 (full index of open work)" },
      toolbox: { title: "03 Toolbox & Hardware", desc: "Jump to section 03 (PyTorch, Triton, NixOS, RTX 5060)" },
      contact: { title: "04 Contact & Email", desc: "Jump to section 04" },
      cerata: { title: "cerata repository", desc: "Open github.com/kaelvalen/cerata in new tab" },
      trainscope: { title: "trainscope on PyPI", desc: "Open pypi.org/project/trainscope in new tab" },
      noesis: { title: "noesis FINDINGS.md", desc: "Open continual learning findings on GitHub" },
      email: { title: "Copy email address to clipboard", desc: "mehmetardahakbilen2005@gmail.com" },
      themeLight: { title: "Switch to light theme", desc: "Paper-white reading mode" },
      themeDark: { title: "Switch to dark theme", desc: "Low-light reading mode" },
      language: { title: "Türkçe'ye geç", desc: "Switch the interface language to Turkish" },
    },
  },

  diagram: {
    title: "System architecture & flight recorder",
    tablist: "Project diagrams",
    tabTrainscope: "Trainscope recorder",
    tabCerata: "CERATA",
    cerata: {
      intro: "Learning after deployment: one fixed address space, three time scales.",
      base: { label: "Frozen base", meta: "content-hashed · immutable", title: "Backbone: frozen, never trained" },
      c1: "emits h at the chosen layer",
      address: { label: "Fixed address", meta: "key", title: "h = hidden state at chosen layer", note: "keys are never trained" },
      c2: "retrieval over fixed addresses",
      router: {
        label: "Router · on retrieval path",
        meta: "0 trainable scalars",
        title: "Parameter-free retrieval · exact cosine",
        purity: "purity asserted at runtime",
      },
      branch: "branches into three time scales",
      guards: { title: "Guards · every write / forget / consolidate", tolerance: "tolerance 1e-10" },
      guardNames: ["Locality", "Reversibility", "Order invariance", "Router purity"],
      guardChecks: [
        "canary argmax flip rate + max |Δoutput|",
        "trial undo/redo · max |dW| ≤ 1e-10, canary identical",
        "accumulator vs contributions re-summed in a seeded permutation",
        "0 trainable scalars reachable from the router",
      ],
      c3: "all paths converge → prediction",
      readout: { label: "Readout", title: "Prediction: labels, logits, routed expert ids, source" },
      inspector: "Spec inspector",
      formula: "Formula",
      lanes: {
        fast: { sub: "single item", title: "Append-only KV memory" },
        medium: { sub: "new batch", title: "Closed-form linear edit" },
        slow: { sub: "consolidation", title: "Frozen representation experts" },
      },
      cards: {
        fast: [
          {
            name: "Append-only Key-Value Memory",
            desc: "The frozen base emits the hidden state h at a chosen layer; h is the key and the label or text is the value. One fixed address space, never trained.",
            metric: "O(1) write",
          },
          {
            name: "Parameter-free Retrieval",
            desc: "Keys are never trained. Retrieval is exact cosine over the frozen addresses. No learned query, no router parameters on the fast path.",
            metric: "exact cosine",
          },
          {
            name: "Exact Delete",
            desc: "forget(id) removes a single memory row exactly, with no retraining and no drift.",
            metric: "exact delete",
          },
        ],
        medium: [
          {
            name: "Sufficient Statistics",
            desc: "A new batch becomes a closed-form linear edit from float64 sufficient statistics, held in one accumulator pair.",
            metric: "accumulator",
          },
          {
            name: "Closed-Form Solution",
            desc: "The solution W = A⁻¹B is order-invariant: contributions are additive, so the edit does not depend on when it lands.",
            metric: "order-invariant",
          },
          {
            name: "Downdate / Forget",
            desc: "Learning adds an edit's contribution; forget subtracts it. Removal is exact, fp-close rather than bitwise, with drift measured by the guards.",
            metric: "downdate",
          },
        ],
        slow: [
          {
            name: "Frozen Representation Experts",
            desc: "Representation experts are trained once at consolidation, then frozen. They are identity-initialized and function-preserving.",
            metric: "train once, freeze",
          },
          {
            name: "Boundary Policy",
            desc: "Which data trains which expert is a pluggable policy, not a fixed rule: by_arrival is the control, by_confusion is experimental and gated.",
            metric: "pluggable policy",
          },
          {
            name: "Consolidate & Freeze",
            desc: "Consolidation runs over pending data under the guards, then freezes the experts. The bank buys isolation, not capacity.",
            metric: "immutable after fit",
          },
        ],
      },
    },
    trainscope: {
      simulate: "Simulate LR surge:",
      surges: { "1.0": "1.0x (nominal)", "2.5": "2.5x (drift)", "5.0": "5.0x (spike)" },
      steps: "Training step",
      chartLabel:
        "Loss, kurtosis and CUSUM over training steps 10 to 60, with early-warning trigger lines. Select a step button to inspect it.",
      loss: "Loss ℒ(t)",
      kurtosis: "Kurtosis κ(t)",
      cusum: "CUSUM S_k",
      step: "Step",
      lossShort: "Loss",
      story: "Mechanism story",
      storage: "Storage: Arrow IPC",
      perBlock: "Per-block gradient L2 norm",
      telemetryNote: "telemetry is simulated; event names stay in English",
    },
  },
};

export type Dict = typeof en;

export const tr: Dict = {
  skip: "İçeriğe geç",
  nav: {
    research: "Araştırma",
    projects: "Projeler",
    toolbox: "Araçlar",
    contact: "İletişim",
    primary: "Ana gezinme",
    openMenu: "Menüyü aç",
    closeMenu: "Menüyü kapat",
    search: "Ara",
    openPalette: "Komut paletini aç",
  },
  theme: { toLight: "Açık temaya geç", toDark: "Koyu temaya geç" },
  lang: { switchTo: "Switch to English", short: "EN" },

  hero: {
    eyebrow: "ML architecture researcher",
    firstName: "Mehmet Arda",
    lastName: "Hakbilen",
    alias: "( kael valen )",
    lead: "Sequence architecture'ların neden böyle tasarlandığını inceliyorum; hangi varsayımların dil dışında da geçerli olduğunu test etmek için onları sıfırdan yeniden yazıyorum.",
    location: "Ankara, TR",
    ctaPrimary: "Araştırmayı oku",
    ctaSecondary: "İletişime geç",
    status: {
      label: "Şu an üzerinde çalıştığım",
      title: "trainscope: loss-spike flight recorder",
      lines: [
        "CUSUM change-point detection (5-20 adım erken)",
        "280+ noise scenario test edildi · WandB auto-attach",
      ],
      cta: "pypi.org/project/trainscope",
    },
    metrics: [
      { value: "%0,0", label: "280+ held-out noise scenario'da false positive" },
      { value: "5–20", label: "adım önceden loss spike uyarısı" },
      { value: "%100", label: "0,10σ–0,50σ drift'te detection" },
      { value: "76,77", label: "CERATA accuracy; v1 expert bank'te 59,30" },
    ],
    metricsLabel: "Öne çıkan sayılar",
  },

  research: {
    title: "Araştırma",
    heading: "Loss dynamics, sequence architecture'lar ve ampirik sınırlar.",
    p1: [
      "Ana odağım ",
      { t: "trainscope", href: TRAINSCOPE },
      ": LLM training'lerindeki loss spike'lar için post-mortem bir flight recorder. CUSUM change-point detector'ı, kademeli loss drift'ini tam bir spike'a dönüşmeden 5-20 adım önce yakalıyor; 280+ noise scenario'da %0,0 false positive ve 0,10σ-0,50σ drift'te %100 sensitivity ile doğrulandı. Bir arıza olduğunda hangi layer'ın önce kaydığını, bunun activation kurtosis'ten mi yoksa gradient explosion'dan mı geldiğini yeniden kurar.",
    ] as Rich,
    p2: [
      "trainscope training run'larını izlerken, ",
      { t: "CERATA", href: CERATA },
      " başka bir soru soruyor: frozen bir model deployment'tan sonra hâlâ ne öğrenebilir? Öğrenme bir API çağrısı: tek bir item için FAST key-value write, float64 sufficient statistics üzerinden MEDIUM closed-form edit ve frozen expert'lere SLOW consolidation. Her write ve forget guard'lı: locality, reversibility, order invariance, zero-parameter routing. Forget kesin bir downdate. Frozen ViT-B/16 feature'ları üzerinde (CIFAR-100, 20 task) closed-form readout'u, hiç eğitilmiş parametre olmadan v1 expert bank'i geçiyor: 76,77 - 59,30.",
    ] as Rich,
    p3: [
      "Daha önce ",
      { t: "NOESIS", href: NOESIS },
      "'i kapattım: Titans tarzı associative memory matrislerinin continual learning'i doğrudan frozen bir LLM manifold'una enjekte edip edemeyeceğini test ediyordu. Sonuç negatifti: frozen manifold'lar eğitilmemiş vektör injection'larını bozulma olmadan özümseyemiyor (50 fact'lik benchmark'ta %0 recall; tam analiz: ",
      { t: "FINDINGS.md", href: FINDINGS },
      ").",
    ] as Rich,
    marginalia: "Kenar notları",
    notes: [
      "her write / forget / consolidate'te guard'lar: locality (canary argmax flip'leri), reversibility (trial undo/redo, max|dW| ≤ 1e-10), order invariance (seeded permutation ile yeniden toplama), router purity (0 trainable scalar).",
      "forget bir downdate'tir: medium path, bir edit'in float64 sufficient statistics'ini çıkarır; son edit'i kaldırmak base modeli bitwise geri getirir.",
      "kısıt: her şey tek bir RTX 5060 Laptop'ta, 8 GB VRAM içinde çalışır.",
    ],
    links: [
      { label: "pypi.org/project/trainscope", note: "loss spike debugger", href: TRAINSCOPE },
      { label: "github.com/kaelvalen/cerata", note: "deployment sonrası öğrenme", href: CERATA },
      { label: "noesis / FINDINGS.md", note: "continual learning", href: FINDINGS },
    ],
    benchTitle: "Deployment sonrası öğrenme: CIFAR-100, 20 task, frozen ViT-B/16",
    benchConfig: "config",
    benchAcc: "accuracy (%)",
    benchRows: [
      "oracle routing (tavan)",
      "cerata: closed-form ridge, 0 parametre",
      "task başına expert bank",
      "NCM prototype, training-free",
      "iCaRL",
      "v1 PAL-MoE",
    ],
    specsTitle: "Validation specs",
    specs:
      "frozen ViT-B/16 · CIFAR-100 · 20 task · 3 seed · RTX 5060. Closed-form readout'lar: 0 parametre, 0 optimizer step; yayımlanmış CIL tablolarıyla karşılaştırılamaz (ImageNet-1K feature'ları, 21K değil).",
  },

  projects: {
    title: "Projeler",
    filterLabel: "Projeleri filtrele",
    filters: { all: "tümü", ml: "ml & research", systems: "systems", apps: "apps & tools" },
    shown: (n: number, total: number) => `${total} projeden ${n} tanesi gösteriliyor`,
    open: "aç",
    cat: { ml: "ml & research", systems: "systems", apps: "apps & tools" },
    status: {
      active: "aktif",
      PyPI: "PyPI",
      "crates.io": "crates.io",
      public: "public",
      superseded: "yerini aldı",
      archived: "arşivlendi",
    },
    blurbs: {
      cerata: "frozen modelde deployment sonrası öğrenme: closed-form edit'ler, exact forgetting",
      trainscope: "LLM training run'ları için loss-spike flight recorder",
      "latch-lang": "kendi programlama dilim",
      connor: "terminal-native CI/CD runner (DAG execution, YAML yok)",
      weave: "local-first, plugin tabanlı productivity sistemi",
      beyond_transformer: "PULSE: erken sequence-architecture prototipi, design record olarak duruyor",
      nanonet: "distributed service'ler için monitoring & control, ~70k satır",
    },
    footnote: "yukarıdaki tüm projeler özgün çalışma (fork yok). tam liste:",
  },

  toolbox: {
    title: "Araçlar",
    groups: [
      { label: "machine learning", items: "PyTorch · Triton · CUDA" },
      { label: "systems", items: "Rust · Go · C++" },
      { label: "web", items: "TypeScript · React · Next.js" },
      { label: "environment", items: "NixOS · Docker · Git" },
    ],
    note: "laptop'um NixOS çalıştırıyor. CERATA tek bir RTX 5060'ta koşuyor: mimari 8 GB'a sığmıyorsa, değişen mimari olur.",
  },

  contact: {
    title: "İletişim",
    lead: "Bana şu adresten yazabilirsin:",
    copy: "kopyala",
    copied: "kopyalandı",
    copiedMsg: "e-posta panoya kopyalandı",
    copyLabel: "E-posta adresini kopyala",
    body: "Araştırma muhabbeti, iş birliği ya da sadece state-space model'ler üzerine tartışmak için.",
  },

  footer: "© 2026 M. A. Hakbilen · tracker yok · Instrument Serif ve Geist ile dizildi",
  top: "başa dön",

  palette: {
    label: "Komut paleti",
    placeholder: "Komut yaz veya ara (örn. cerata, trainscope)...",
    empty: "Eşleşen komut yok",
    hint: "↑↓ gezin · ↵ seç",
    close: "esc kapat",
    copied: "✓ kopyalandı",
    commands: "Komutlar",
    categories: { navigation: "gezinme", repositories: "repo'lar", action: "eylem" },
    items: {
      research: { title: "01 Araştırma · CERATA Architecture", desc: "01. bölüme git (closed-form edit'ler, exact forgetting)" },
      projects: { title: "02 Proje Dizini", desc: "02. bölüme git (açık çalışmaların tam listesi)" },
      toolbox: { title: "03 Araçlar ve Donanım", desc: "03. bölüme git (PyTorch, Triton, NixOS, RTX 5060)" },
      contact: { title: "04 İletişim ve E-posta", desc: "04. bölüme git" },
      cerata: { title: "cerata repo'su", desc: "github.com/kaelvalen/cerata'yı yeni sekmede aç" },
      trainscope: { title: "PyPI'da trainscope", desc: "pypi.org/project/trainscope'u yeni sekmede aç" },
      noesis: { title: "noesis FINDINGS.md", desc: "Continual learning bulgularını GitHub'da aç" },
      email: { title: "E-posta adresini kopyala", desc: "mehmetardahakbilen2005@gmail.com" },
      themeLight: { title: "Açık temaya geç", desc: "Kâğıt beyazı okuma modu" },
      themeDark: { title: "Koyu temaya geç", desc: "Düşük ışıkta okuma modu" },
      language: { title: "Switch to English", desc: "Arayüz dilini İngilizce yap" },
    },
  },

  diagram: {
    title: "Sistem mimarisi ve flight recorder",
    tablist: "Proje diyagramları",
    tabTrainscope: "Trainscope recorder",
    tabCerata: "CERATA",
    cerata: {
      intro: "Deployment sonrası öğrenme: tek bir fixed address space, üç time scale.",
      base: { label: "Frozen base", meta: "content-hashed · immutable", title: "Backbone: frozen, hiç eğitilmez" },
      c1: "seçilen layer'da h üretir",
      address: { label: "Fixed address", meta: "key", title: "h = seçilen layer'daki hidden state", note: "key'ler hiç eğitilmez" },
      c2: "fixed address'ler üzerinde retrieval",
      router: {
        label: "Router · retrieval path'inde",
        meta: "0 trainable scalar",
        title: "Parameter-free retrieval · exact cosine",
        purity: "purity runtime'da assert edilir",
      },
      branch: "üç time scale'e ayrılır",
      guards: { title: "Guards · her write / forget / consolidate", tolerance: "tolerance 1e-10" },
      guardNames: ["Locality", "Reversibility", "Order invariance", "Router purity"],
      guardChecks: [
        "canary argmax flip oranı + max |Δoutput|",
        "trial undo/redo · max |dW| ≤ 1e-10, canary aynı",
        "accumulator ile contribution'ların seeded permutation'da yeniden toplanması",
        "router'dan erişilebilen 0 trainable scalar",
      ],
      c3: "tüm path'ler birleşir → prediction",
      readout: { label: "Readout", title: "Prediction: label'lar, logit'ler, routed expert id'leri, source" },
      inspector: "Spec inspector",
      formula: "Formula",
      lanes: {
        fast: { sub: "tek item", title: "Append-only KV memory" },
        medium: { sub: "yeni batch", title: "Closed-form linear edit" },
        slow: { sub: "consolidation", title: "Frozen representation expert'leri" },
      },
      cards: {
        fast: [
          {
            name: "Append-only Key-Value Memory",
            desc: "Frozen base, seçilen layer'da h hidden state'ini üretir; h key, label veya text ise value. Hiç eğitilmeyen tek bir fixed address space.",
            metric: "O(1) write",
          },
          {
            name: "Parameter-free Retrieval",
            desc: "Key'ler hiç eğitilmez. Retrieval, frozen address'ler üzerinde exact cosine. Fast path'te öğrenilmiş query ya da router parametresi yok.",
            metric: "exact cosine",
          },
          {
            name: "Exact Delete",
            desc: "forget(id) tek bir memory row'unu retraining ve drift olmadan tam olarak siler.",
            metric: "exact delete",
          },
        ],
        medium: [
          {
            name: "Sufficient Statistics",
            desc: "Yeni bir batch, float64 sufficient statistics'ten closed-form linear edit'e dönüşür ve tek bir accumulator çiftinde tutulur.",
            metric: "accumulator",
          },
          {
            name: "Closed-Form Solution",
            desc: "W = A⁻¹B çözümü order-invariant: contribution'lar toplamsal olduğu için edit'in ne zaman geldiği fark etmez.",
            metric: "order-invariant",
          },
          {
            name: "Downdate / Forget",
            desc: "Learning bir edit'in contribution'ını ekler, forget çıkarır. Silme exact, ama bitwise değil fp-close; drift guard'lar tarafından ölçülür.",
            metric: "downdate",
          },
        ],
        slow: [
          {
            name: "Frozen Representation Experts",
            desc: "Representation expert'leri consolidation'da bir kez eğitilir, sonra freeze edilir. Identity-initialized ve function-preserving'dirler.",
            metric: "train once, freeze",
          },
          {
            name: "Boundary Policy",
            desc: "Hangi verinin hangi expert'i eğittiği sabit bir kural değil, takılabilir bir policy: by_arrival kontrol, by_confusion deneysel ve gated.",
            metric: "pluggable policy",
          },
          {
            name: "Consolidate & Freeze",
            desc: "Consolidation, bekleyen veri üzerinde guard'lar altında çalışır, sonra expert'leri freeze eder. Bank kapasite değil isolation sağlar.",
            metric: "immutable after fit",
          },
        ],
      },
    },
    trainscope: {
      simulate: "LR surge simüle et:",
      surges: { "1.0": "1.0x (nominal)", "2.5": "2.5x (drift)", "5.0": "5.0x (spike)" },
      steps: "Training step",
      chartLabel:
        "10 ile 60 arasındaki training step'lerde loss, kurtosis ve CUSUM; early-warning trigger çizgileriyle. İncelemek için bir step düğmesi seç.",
      loss: "Loss ℒ(t)",
      kurtosis: "Kurtosis κ(t)",
      cusum: "CUSUM S_k",
      step: "Step",
      lossShort: "Loss",
      story: "Mechanism story",
      storage: "Storage: Arrow IPC",
      perBlock: "Block başına gradient L2 norm",
      telemetryNote: "telemetri simüle; event isimleri İngilizce kalır",
    },
  },
};

export const dictionaries: Record<Locale, Dict> = { en, tr };
