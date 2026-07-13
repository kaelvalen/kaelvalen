<div align="center">
  <img src="assets/github-header-banner.png" width="100%" alt="Kael Valen Banner" />
  <br/>
  <h1>Mehmet Arda Hakbilen <strong>(Kael Valen)</strong></h1>
  <p><em>Software engineer — efficient sequence architectures and the infrastructure they run on</em></p>
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

I'm interested in **why modern sequence architectures are designed the way they are** — the inductive biases baked in by training on language, where they don't transfer, and whether cleaner designs can close the gap on other signal types.

My main project is [**PRISM**](https://github.com/kaelvalen/prism): a hybrid linear-recurrent backbone interleaving Mamba-2-style SSD blocks (per-channel selective state, no mean-over-D_h collapse) with Gated Delta Rule blocks (matrix-valued associative memory) at a 3:1 ratio. The same backbone — identical hyperparameters, no modality-specific tuning — is applied to 12-lead ECG (PTB-XL, primary), spoken commands, and sequential images. Primary metric is macro one-vs-rest AUROC; the target is matching `xresnet1d101` (~0.928) within bootstrap CI. A paper draft targeting ICML 2026 ES-FoMo IV / NeurIPS 2026 ENLSP-VI is in progress.

The reference implementation includes from-scratch SSD scan and chunked gated delta rule (UT transform / triangular solve), both with numerical-equivalence tests against `torch.associative_scan` and the FLA Triton kernels. 111 tests total: equivalence, float64 gradcheck, streaming state-passing, property-based.

Alongside the architecture work: Go/Rust microservices, observability tooling, and published PyPI packages — because the gap between "model that works in a notebook" and "model that ships" is a real engineering problem worth being good at.

**Current focus:**
- State-space models (Mamba-2 SSD, diagonal SSMs) and associative memory (delta rule, fast weights)
- Cross-modal portability — testing how far a single hybrid backbone generalizes without per-modality tuning
- Hardware-aware algorithm design: parallel scan, chunked recurrence, memory hierarchy
- Clinical time-series modeling: multi-label ECG classification, macro AUROC as primary metric
- Production ML infrastructure: training observability, checkpoint management, reproducible pipelines

---

## Projects

### [PRISM — modality-portable hybrid linear-recurrent backbone](https://github.com/kaelvalen/prism)
`PyTorch` `SSM` `Mamba-2 SSD` `Gated Delta Rule` `Research` · **Active — paper in progress**

12-layer hybrid backbone: SSD blocks (Mamba-2-style, per-channel selective state) interleaved with Gated Delta Rule blocks at 3:1. From-scratch reference implementations of both — Hillis-Steele scan + UT-transform chunked delta rule — with numerical equivalence tests against `torch.associative_scan` and FLA Triton kernels. Same backbone applied to PTB-XL ECG (primary, multi-label macro AUROC), Speech Commands, and sequential CIFAR-10 with no per-modality hyperparameter changes. S4D-Complex is preserved as an ablation row; the default is SSD. Paper target: ICML 2026 ES-FoMo IV or NeurIPS 2026 ENLSP-VI.

### [trainscope](https://pypi.org/project/trainscope/)
`Python` `FastAPI` `React` `Plotly` `PyPI` · **Published**

LLM training loss spike flight recorder. FastAPI backend, React+Plotly frontend, Welford online z-score spike detection, Apache Arrow IPC transport. Published at `pypi.org/project/trainscope/` — a small tool I wished existed while running PRISM training runs.

### [PULSE — Parallel Unified Linear State Engine](https://github.com/kaelvalen/beyond_transformer)
`PyTorch` `Research` · **Study repo**

Predecessor to PRISM. Single O(n) primitive combining local convolution, linear attention, gated fusion, and key-value memory. Kept public as a reference for the design choices that led to PRISM.

### [NanoNet — Microservice Monitoring & Control Platform](https://github.com/kaelvalen/nanonet)
`Go` `Rust` `TypeScript` `Docker` · **Production-grade**

Full-stack monitoring and control platform for distributed services: Go backend (auth, metrics, alerting, SLO tracking, incident management), Rust agents for low-overhead host-side data collection, React/TypeScript frontend. ~70k lines across the stack. Built solo end-to-end. The exercise was shipping a production system, not just designing one.

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
      <img src="https://img.shields.io/badge/NixOS-5277C3?style=flat-square&logo=nixos&logoColor=white" />
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
