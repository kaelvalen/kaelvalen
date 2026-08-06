# Mehmet Arda Hakbilen (kael valen)

I work on efficient sequence architectures and the infrastructure they run on. Ankara, Türkiye.

[email](mailto:mehmetardahakbilen2005@gmail.com) · [linkedin](https://www.linkedin.com/in/mehmet-arda-hakbilen-12aba6269/) · [kaelvalen.vercel.app](https://kaelvalen.vercel.app)

## Now

My main project right now is [trainscope](https://pypi.org/project/trainscope/), a post-mortem debugger for LLM training loss spikes. It started as a tool I needed during PRISM runs and has since become the focus: a CUSUM-based change-point detector catches gradual loss drift 5-20 steps before it turns into a full spike, validated with false-positive rate testing across 280+ held-out noise scenarios (0.0%) and sensitivity testing across drift magnitudes from 0.10σ to 0.50σ (100% detection). When a spike hits, the UI reconstructs the chronological failure cascade — which layer moved first, whether it was a distributional shift or a gradient explosion, and how many steps of warning were available before collapse.

Before this, I closed out [NOESIS](https://github.com/kaelvalen/noesis), a continual-learning system that tried to inject retrieved memory (via a Titans-style associative matrix + test-time training) directly into a frozen LLM's hidden states. The result was negative and I think worth stating plainly: a frozen backbone's hidden manifold cannot be given new semantic content by an untrained vector injection, no matter how carefully the geometry is aligned — verified across KV-cache-purge controls, negative controls, and a 50-fact automated benchmark (0% recall). Full writeup in [FINDINGS.md](https://github.com/kaelvalen/noesis/blob/main/FINDINGS.md).

## Projects

- [trainscope](https://pypi.org/project/trainscope/) — see above. Post-mortem debugger for LLM training loss spikes. FastAPI + React, CUSUM change-point detection, WandB auto-attach, on PyPI.
- [noesis](https://github.com/kaelvalen/noesis) — continual-learning experiment with frozen backbone + vector memory injection. Concluded negative result, documented in FINDINGS.md.
- [prism](https://github.com/kaelvalen/prism) — hybrid linear-recurrent backbone: Mamba-2-style SSD blocks interleaved with Gated Delta Rule blocks, applied to 12-lead ECG (PTB-XL), Speech Commands, and sequential CIFAR-10. Paused — the pipeline is validated end-to-end but the full paper matrix was never run. Kept public as-is.
- [connor](https://github.com/kaelvalen/connor) — terminal-native CI/CD runner in Rust. TOML config, DAG-parallel execution, no server.
- [latch-lang](https://github.com/kaelvalen/latch-lang) — my own programming language. Rust, on crates.io. Paused.
- [weave](https://github.com/kaelvalen/weave) — local-first, plugin-based productivity app. Tauri + React + Rust.
- [nanonet](https://github.com/kaelvalen/nanonet) — monitoring platform for distributed services: Go backend, Rust agents, React frontend, ~70k lines, built solo. Archived.
- [beyond_transformer](https://github.com/kaelvalen/beyond_transformer) — PULSE, the predecessor to PRISM. Kept public as a record of the design choices that led to the current one.

## Stack

PyTorch for the ML work, with Triton when there's no way around it. Rust and Go for systems, TypeScript/React for frontends. My laptop runs NixOS, so a couple of repos here are just dotfiles.

<p align="center">
  <img src="https://github.com/kaelvalen/kaelvalen/blob/metrics/github-metrics.svg" width="85%" alt="GitHub metrics" />
</p>
