&lt;div align="center"&gt;
  &lt;img src="assets/github-header-banner.png" width="100%" alt="Kael Valen Banner" /&gt;
  &lt;br/&gt;
  &lt;h1&gt;Mehmet Arda Hakbilen &lt;strong&gt;(Kael Valen)&lt;/strong&gt;&lt;/h1&gt;
  &lt;p&gt;&lt;em&gt;I build systems that learn, and the infrastructure that learns from them.&lt;/em&gt;&lt;/p&gt;
  &lt;br/&gt;
  &lt;p&gt;
    &lt;a href="mailto:mehmetardahakbilen2005@gmail.com"&gt;
      &lt;img src="https://img.shields.io/badge/Email-Contact-e53e3e?style=for-the-badge&logo=gmail&logoColor=white" /&gt;
    &lt;/a&gt;
    &lt;a href="https://www.linkedin.com/in/mehmet-arda-hakbilen-12aba6269/"&gt;
      &lt;img src="https://img.shields.io/badge/LinkedIn-Connect-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white" /&gt;
    &lt;/a&gt;
  &lt;/p&gt;
&lt;/div&gt;

---

## The Problem I Solve

Modern sequence models are either **expressive but inefficient** (Transformers, $O(n^2)$) or **efficient but forgetful** (SSMs, linear attention). Worse, every modality reinvents the wheel: vision models use convolutions, NLP uses transformers, ECG uses 1D-CNNs + LSTMs.

I work at the intersection of **architecture design** and **systems engineering** to build a single backbone that:
1. Runs in $O(n)$ time with sub-quadratic memory
2. Retains long-range dependencies via associative memory
3. Generalizes across modalities without modality-specific inductive biases

The hypothesis: *continuous-time state dynamics + matrix-valued fast weights* can capture structure that neither pure SSMs nor pure attention can model alone.

---

## Active Research

### [PRISM](https://github.com/kaelvalen/prism) — Parallel Recurrent Integrated Signal Model
`PyTorch` `SSM` `Delta Rule` `Hardware-aware` · **Active**

A modality-agnostic sequence backbone built on a single principle: **interleave continuous-time memory with associative memory**.

- **Architecture:** 12-layer hybrid backbone with **S4D-Complex** blocks (complex diagonal state-space models for continuous signal dynamics) interleaved with **Gated Delta Rule** blocks (matrix-valued associative memory / fast weights) at a **3:1 ratio**.
- **Implementation:** Custom work-efficient Blelloch parallel scan (upsweep/downsweep) for the SSM path; chunked recurrence for the delta rule to respect memory hierarchy. No off-the-shelf SSM library wrappers — from scratch.
- **Results:** 8M-parameter backbone reaches **88.4% on CIFAR-10** without vision-specific convolutions, attention, or patch embedding tricks. Same backbone handles 12-lead ECG (PTB-XL) and arbitrary continuous signals — only input projection and output head change.
- **Active tracks:** Block-pattern ablations (ratio sweep), PTB-XL diagnostic classification, and long-sequence scaling law characterization.

**Why this matters:** Most "modality-agnostic" models are just transformers with different tokenizers. PRISM tests whether a *recurrent* architecture can learn generalizable sequential structure that transfers across time-series, images, and signals without retraining the backbone.

---

### [PULSE](https://github.com/kaelvalen/beyond_transformer) — Parallel Unified Linear State Engine
`PyTorch` `Research` · **Archive / Reference**

Predecessor to PRISM. Explored a single $O(n)$ primitive combining local convolution, linear attention, gated fusion, and key-value memory. Public as a design archaeology reference — shows the evolution of thought that led to PRISM's hybrid interleaving strategy.

---

## Production Systems

### [NanoNet](https://github.com/kaelvalen/nanonet) — Microservice Monitoring & Control Platform
`Go` `Rust` `TypeScript` `Docker` · **Production-grade**

70k lines, solo-built, end-to-end. Go backend (auth, metrics, alerting, SLO tracking, incident management), Rust agents for zero-overhead host instrumentation, React/TypeScript frontend, mobile client.

**Why this matters:** PRISM will eventually need to ship. NanoNet is the proof that I can build the observability, deployment, and inference infrastructure that makes a model useful outside a Jupyter notebook.

---

## Tech Stack

&lt;table&gt;
  &lt;tr&gt;
    &lt;td&gt;&lt;strong&gt;ML / Research&lt;/strong&gt;&lt;/td&gt;
    &lt;td&gt;
      &lt;img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white" /&gt;
      &lt;img src="https://img.shields.io/badge/CUDA-76B900?style=flat-square&logo=nvidia&logoColor=white" /&gt;
      &lt;img src="https://img.shields.io/badge/Triton-9B59B6?style=flat-square&logo=openai&logoColor=white" /&gt;
      &lt;img src="https://img.shields.io/badge/HuggingFace-FFD21E?style=flat-square&logo=huggingface&logoColor=black" /&gt;
    &lt;/td&gt;
  &lt;/tr&gt;
  &lt;tr&gt;
    &lt;td&gt;&lt;strong&gt;Systems&lt;/strong&gt;&lt;/td&gt;
    &lt;td&gt;
      &lt;img src="https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white" /&gt;
      &lt;img src="https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=go&logoColor=white" /&gt;
      &lt;img src="https://img.shields.io/badge/C++-00599C?style=flat-square&logo=cplusplus&logoColor=white" /&gt;
      &lt;img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" /&gt;
    &lt;/td&gt;
  &lt;/tr&gt;
  &lt;tr&gt;
    &lt;td&gt;&lt;strong&gt;Web&lt;/strong&gt;&lt;/td&gt;
    &lt;td&gt;
      &lt;img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" /&gt;
      &lt;img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" /&gt;
      &lt;img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" /&gt;
      &lt;img src="https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" /&gt;
    &lt;/td&gt;
  &lt;/tr&gt;
  &lt;tr&gt;
    &lt;td&gt;&lt;strong&gt;Infra&lt;/strong&gt;&lt;/td&gt;
    &lt;td&gt;
      &lt;img src="https://img.shields.io/badge/Linux-FCC624?style=flat-square&logo=linux&logoColor=black" /&gt;
      &lt;img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" /&gt;
      &lt;img src="https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white" /&gt;
    &lt;/td&gt;
  &lt;/tr&gt;
&lt;/table&gt;

---

## Metrics

&lt;div align="center"&gt;
  &lt;img src="https://github.com/kaelvalen/kaelvalen/blob/metrics/github-metrics.svg" width="85%" alt="GitHub Metrics" /&gt;
  &lt;br/&gt;&lt;br/&gt;
  &lt;img src="https://github.com/kaelvalen/kaelvalen/blob/output/github-contribution-grid-snake.svg" width="100%" alt="Contribution Snake" /&gt;
&lt;/div&gt;

---

&lt;div align="center"&gt;
  &lt;p&gt;&lt;em&gt;Currently optimizing parallel scans and breaking ablation experiments.&lt;/em&gt;&lt;/p&gt;
  &lt;p&gt;&lt;strong&gt;Open to collaboration on state-space models, efficient sequence modeling, and ML infrastructure.&lt;/strong&gt;&lt;/p&gt;
&lt;/div&gt;
