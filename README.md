<div align="center">
  <img src="assets/github-header-banner.png" width="100%" alt="Kael Valen Banner" />

  <br/>

  <h1>Mehmet Arda Hakbilen <strong>(Kael Valen)</strong></h1>
  <p><em>Software Engineer · ML Systems & Efficient Architectures · Student</em></p>

  <br/>

  <p>
    <img src="https://img.shields.io/badge/Focus-Efficient%20ML%20Systems-e53e3e?style=for-the-badge&logo=pytorch&logoColor=white" />
    <img src="https://img.shields.io/badge/Research-Alternative%20Architectures-c53030?style=for-the-badge&logo=openai&logoColor=white" />
    <img src="https://komarev.com/ghpvc/?username=kaelvalen&label=Profile%20views&color=e53e3e&style=for-the-badge" />
  </p>

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

I'm interested in the intersection of **model architecture** and **inference efficiency** — specifically, why modern sequence models are designed the way they are, where they fail, and whether simpler alternatives can close the gap.

Right now I'm building [**PULSE**](https://github.com/kaelvalen/beyond_transformer) — an experimental O(n) architecture that replaces the standard SSM + Attention + State stack with a single uniform block. It's not finished. It's a research project where I'm learning by building from scratch.

**Current focus areas:**
- Linear attention and its approximation trade-offs
- Kernel-based sequence models vs. softmax attention
- Hardware-aware algorithm design (memory hierarchy, tiling, compute efficiency)
- Why Flash Attention works at the kernel level — working through the math

---

## Projects

### [PULSE — Parallel Unified Linear State Engine](https://github.com/kaelvalen/beyond_transformer)
`PyTorch` `Python` `Research`

An experimental sequence architecture exploring whether a single O(n) primitive (local convolution + linear attention + gated fusion) can replace the complexity of transformer-style stacks. Active development — see the repo for current status and known issues.

---

### [SentinelFS](https://github.com/kaelvalen/SentinelFS)
`C++17` `P2P` `Distributed Systems` · **Archived**

Distributed peer-to-peer file sync with ML-based anomaly detection, delta-sync algorithms, and self-healing network topology. No longer maintained — kept for reference.

---

## Tech Stack

<table>
  <tr>
    <td><strong>ML / Research</strong></td>
    <td>
      <img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=flat-square&logo=pytorch&logoColor=white" />
      <img src="https://img.shields.io/badge/CUDA-76B900?style=flat-square&logo=nvidia&logoColor=white" />
      <img src="https://img.shields.io/badge/JAX-00599C?style=flat-square&logo=google&logoColor=white" />
      <img src="https://img.shields.io/badge/HuggingFace-FFD21E?style=flat-square&logo=huggingface&logoColor=black" />
    </td>
  </tr>
  <tr>
    <td><strong>Languages</strong></td>
    <td>
      <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" />
      <img src="https://img.shields.io/badge/C++-00599C?style=flat-square&logo=cplusplus&logoColor=white" />
      <img src="https://img.shields.io/badge/Rust-000000?style=flat-square&logo=rust&logoColor=white" />
      <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
    </td>
  </tr>
  <tr>
    <td><strong>Web</strong></td>
    <td>
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

---

<div align="center">
  <sub>Open to research collaboration, architecture discussions, and code review. Not interested in wrapper apps or hype-driven projects.</sub>
</div>