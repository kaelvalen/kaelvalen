# Mehmet Arda Hakbilen (kael valen)

I work on efficient sequence architectures and the infrastructure they run on. Ankara, Türkiye.

[email](mailto:mehmetardahakbilen2005@gmail.com) · [linkedin](https://www.linkedin.com/in/mehmet-arda-hakbilen-12aba6269/) · [kaelvalen.vercel.app](https://kaelvalen.vercel.app)

## Now

My main project is [PRISM](https://github.com/kaelvalen/prism), a hybrid linear-recurrent backbone: Mamba-2-style SSD blocks interleaved with Gated Delta Rule blocks at 3:1, applied with identical hyperparameters to 12-lead ECG (PTB-XL), Speech Commands, and sequential CIFAR-10. The bet is that a single backbone, without language-specific design choices, can get within bootstrap CI of xresnet1d101 (~0.928 macro AUROC) on clinical time series.

Both mixers are written from scratch, with numerical-equivalence tests against `torch.associative_scan` and the FLA Triton kernels. 270+ tests in total (equivalence, fp64 gradcheck, streaming state-passing, property-based). The pipeline is validated end-to-end on an RTX 5060 laptop; the full paper matrix hasn't been run yet. The draft is aimed at the ICML 2026 ES-FoMo IV or NeurIPS 2026 ENLSP-VI workshops.

The current sub-project is MoM, in the same repo: rather than fixing the SSD:GDR ratio by hand, a per-token router chooses which memory primitive handles each token. The first spike gate failed. Routing doesn't collapse, but recall lags the GDR-only baseline, so I'm working through the mitigations. Everything has to fit in 8 GB of VRAM, which is a constraint I've come to appreciate.

## Projects

- [prism](https://github.com/kaelvalen/prism) — see above. PyTorch, active.
- [trainscope](https://pypi.org/project/trainscope/) — flight recorder for LLM training loss spikes. FastAPI + React, Welford z-score detection, on PyPI. Wrote it because I needed it during PRISM runs.
- [connor](https://github.com/kaelvalen/connor) — terminal-native CI/CD runner in Rust. TOML config, DAG-parallel execution, no server.
- [latch-lang](https://github.com/kaelvalen/latch-lang) — my own programming language. Rust, on crates.io.
- [weave](https://github.com/kaelvalen/weave) — local-first, plugin-based productivity app. Tauri + React + Rust.
- [open-glyph](https://github.com/kaelvalen/open-glyph) — pixel-art editor for the Nothing Phone glyph matrix. Kotlin.
- [nanonet](https://github.com/kaelvalen/nanonet) — monitoring platform for distributed services: Go backend, Rust agents, React frontend, ~70k lines, built solo. Mostly an exercise in shipping the boring parts too. Archived.
- [beyond_transformer](https://github.com/kaelvalen/beyond_transformer) — PULSE, the predecessor to PRISM. Kept public as a record of the design choices that led to the current one.

## Stack

PyTorch for the ML work, with Triton when there's no way around it. Rust and Go for systems, TypeScript/React for frontends. My laptop runs NixOS, so a couple of repos here are just dotfiles.

<p align="center">
  <img src="https://github.com/kaelvalen/kaelvalen/blob/metrics/github-metrics.svg" width="85%" alt="GitHub metrics" />
</p>
