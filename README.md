<div align="center">
  <img src="assets/github-header-banner.png" width="100%" alt="Kael Valen Banner" />

  <br/>

  <h1>Mehmet Arda Hakbilen <strong>(Kael Valen)</strong></h1>
  <p><em>Engineer building efficient ML systems and the infrastructure they run on</em></p>

  <br/>

  <p>
    <a href="mailto:mehmetardahakbilen2005@gmail.com">
      <img src="https://img.shields.io/badge/Email-Contact-e53e3e?style=for-the-badge&logo=gmail&logoColor=white" />
    </a>
    <a href="https://www.linkedin.com/in/mehmet-arda-hakbilen-12aba6269/">
      <img src="https://img.shields.io/badge/LinkedIn-Connect-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white" />
    </a>
  </p>
</div>

---

## What I'm Working On

I'm interested in the intersection of **model architecture** and **inference efficiency** — why modern sequence models are designed the way they are, where they fail, and whether simpler alternatives can close the gap.

My main project is [**PRISM**](https://github.com/kaelvalen/prism) — a modality-agnostic sequence model with a 12-layer hybrid backbone interleaving S4D-Complex blocks (continuous-time signal dynamics) with Gated Delta Rule blocks (matrix-valued associative memory) at a 3:1 ratio. The same backbone handles 12-lead ECG, image patches, and arbitrary continuous signals — only the input projection and output head are per-modality. Hybrid configuration reaches 88.4% on CIFAR-10 with ~8M parameters. Block-pattern ablations and PTB-XL ECG benchmarks are in progress; results land in the README as runs complete.

Alongside the architecture work, I build the systems that production ML lives in — Go/Rust microservices, observability pipelines, and infrastructure tooling. I think the gap between "model that works in a notebook" and "model that ships" is a real engineering problem worth being good at.

**Current focus areas:**
- State-space models (S4D, complex diagonal SSMs) and associative memory (delta rule, fast weights)
- Hybrid sequence architectures — when interleaving beats either component alone
- Hardware-aware algorithm design (parallel scan, chunked recurrence, memory hierarchy)
- Modality-agnostic backbones — testing how far a single design generalizes across signal types
- Production ML infrastructure — agents, observability, distributed services

---

## Projects

### [PRISM — Parallel Recurrent Integrated Signal Model](https://github.com/kaelvalen/prism)
`PyTorch` `SSM` `Delta Rule` `Research` · **Active**

A modality-agnostic sequence model: 12-layer hybrid backbone interleaving S4D-Complex blocks with Gated Delta Rule blocks at a 3:1 ratio. Custom parallel scan implementation (work-efficient Blelloch upsweep/downsweep) for the SSM path; chunked recurrence for the delta rule. Same backbone handles ECG, image patches, and continuous signals — only the input projection and output head change per modality. Hybrid run: 88.4% on CIFAR-10 (~8M params). Ablations and ECG benchmarks pending.

### [PULSE — Parallel Unified Linear State Engine](https://github.com/kaelvalen/beyond_transformer)
`PyTorch` `Research` · **Study repo**

Earlier exploration of a single O(n) primitive (local convolution + linear attention + gated fusion + key-value memory) as a transformer alternative. Predates PRISM and reflects an earlier mental model — kept public as a reference for the design choices that led to PRISM.

### [NanoNet — Microservice Monitoring & Control Platform](https://github.com/kaelvalen/nanonet)
`Go` `Rust` `TypeScript` `Docker` · **Production-grade**

A full-stack monitoring and control platform for distributed services: Go backend (auth, metrics, alerting, SLO tracking, incident management), Rust agents for low-overhead host-side data collection, React/TypeScript frontend, and a mobile client. ~70k lines across the stack. Built solo end-to-end as an exercise in shipping production systems — not just designing them.

---

## Tech Stack

<table>
  <tr>
    <td><strong>ML / Research</strong></td>
    <td>
      <img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white" />
      <img src="https://img.shields.io/badge/CUDA-76B900?style=flat-square&logo=nvidia&logoColor=white" />
      <img src="https://img.shields.io/badge/Triton-9B59B6?style=flat-square&logo=openai&logoColor=white" />
      <img src="https://img.shields.io/badge/HuggingFace-FFD21E?style=flat-square&logo=huggingface&logoColor=black" />
    </td>
  </tr>
  <tr>
    <td><strong>Systems</strong></td>
    <td>
      <img src="https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white" />
      <img src="https://img.shields.io/badge/Go-00ADD8?style=flat-square&logo=go&logoColor=white" />
      <img src="https://img.shields.io/badge/C++-00599C?style=flat-square&logo=cplusplus&logoColor=white" />
      <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" />
    </td>
  </tr>
  <tr>
    <td><strong>Web</strong></td>
    <td>
      <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
      <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" />
      <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" />
      <img src="https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
    </td>
  </tr>
  <tr>
    <td><strong>Infra</strong></td>
    <td>
      <img src="https://img.shields.io/badge/Linux-FCC624?style=flat-square&logo=linux&logoColor=black" />
      <img src="https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white" />
      <img src="https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white" />
    </td>
  </tr>
</table>

---

## GitHub Activity

<div align="center">
  <img src="https://github.com/kaelvalen/kaelvalen/blob/metrics/github-metrics.svg" width="85%" alt="GitHub Metrics" />
  <br/><br/>
  <img src="https://github.com/kaelvalen/kaelvalen/blob/output/github-contribution-grid-snake.svg" width="100%" alt="Contribution Snake" />
</div>
