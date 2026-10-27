# Mehmet Arda Hakbilen (kael valen)

I work on ML systems: catching training runs before they fail, and changing what a deployed model knows without retraining it. Ankara, Türkiye. Everything here runs on one 8 GB laptop GPU.

[email](mailto:mehmetardahakbilen2005@gmail.com) · [linkedin](https://www.linkedin.com/in/mehmet-arda-hakbilen-12aba6269/) · [portfolio: kaelvalen.vercel.app](https://kaelvalen.vercel.app)

---

## Now

### [RELIC](https://github.com/kaelvalen/relic): transactional knowledge updates for frozen language models

Knowledge editing writes facts into a model's weights, but then a single fact cannot be removed, the fact behind an answer cannot be named, and an update's effect on unrelated questions is hard to bound. RELIC keeps the base model frozen and stores each new fact as its own entry: a note served in the context and, only when the note is not enough, a rank-16 LoRA adapter trained with a KL penalty toward the base. An adapter is admitted only if its divergence on 40 held-out canary prompts stays below a threshold. A router whose parameters are fixed before any fact is stored applies at most one entry per query, so removal and attribution are exact by construction.

Pre-registered study, Qwen2.5-1.5B-Instruct, 1000 facts per dataset, default configuration:

| | CounterFact | zsRE |
| :-- | --: | --: |
| Edit prompts answered | 99.6% | 98.9% |
| Paraphrases answered | 89.1% | 98.2% |
| Other questions about a stored subject that get a stored answer | 4.3% | not measured |
| Removed facts returning to the base answer (100 removed) | 100% | 100% by content |
| Facts that need an adapter | 16.2% | 20.6% |

Under the same chat template, GRACE answers 2.0% of CounterFact paraphrases and WISE 10.5% (EasyEdit, 200 sequential edits), and neither can remove a single edit. The open problem is leakage into neighboring relations: 11.7% of natural questions about them receive a wrong stored answer. The paper and every pre-registration record are in the repo.

### [trainscope](https://pypi.org/project/trainscope/): a flight recorder for LLM training loss spikes

A CUSUM change-point detector catches gradual loss drift 5 to 20 steps before it turns into a full spike, with 0.0% false positives across 280+ held-out noise scenarios and 100% detection for drift from 0.10σ to 0.50σ. When a spike hits, the UI reconstructs the failure cascade: which layer moved first, whether it was a distributional shift or a gradient explosion, and how many steps of warning there were. It started as a tool I needed during ENGRAM runs.

### Closed: [NOESIS](https://github.com/kaelvalen/noesis)

NOESIS tried to inject retrieved memory (a Titans-style associative matrix with test-time training) directly into a frozen LLM's hidden states. The result was negative and worth stating plainly: a frozen backbone's hidden manifold cannot be given new semantic content by an untrained vector injection, however carefully the geometry is aligned (KV-cache-purge controls, negative controls, 0% recall on a 50-fact benchmark). Writeup in [FINDINGS.md](https://github.com/kaelvalen/noesis/blob/main/FINDINGS.md). RELIC started from this result.

---

## Projects

### Machine learning and research
- [relic](https://github.com/kaelvalen/relic): transactional knowledge updates for frozen LMs. Notes and KL-gated LoRA adapters, parameter-free routing, exact removal and attribution. PyTorch, PEFT.
- [trainscope](https://pypi.org/project/trainscope/): post-mortem flight recorder for LLM training loss spikes. FastAPI and React, CUSUM change-point detection, WandB auto-attach, on PyPI.
- [noesis](https://github.com/kaelvalen/noesis): continual learning with a frozen backbone and vector memory injection. Closed with a documented negative result.
- [engram](https://github.com/kaelvalen/engram): hybrid linear-recurrent backbone, Mamba-2 SSD blocks interleaved 3:1 with Gated Delta Rule blocks, applied to PTB-XL, Speech Commands and sCIFAR-10 (312 tests).
- [beyond_transformer](https://github.com/kaelvalen/beyond_transformer): PULSE, the predecessor to ENGRAM. Kept public as a design record.

### Systems and tools
- [connor](https://github.com/kaelvalen/connor): terminal-native CI/CD runner in Rust. TOML config, DAG-parallel execution, no server.
- [latch-lang](https://github.com/kaelvalen/latch-lang): a programming language written in Rust. On crates.io.
- [weave](https://github.com/kaelvalen/weave): local-first, plugin-based productivity app. Tauri, React, Rust.
- [nanonet](https://github.com/kaelvalen/nanonet): distributed service monitoring. Go backend, Rust agents, React frontend (~70k lines). Archived.

---

## Stack

PyTorch for ML work, with Hugging Face Transformers and PEFT for the language-model experiments and Triton when there is no way around it. Rust and Go for systems, TypeScript and React for frontends. The laptop runs NixOS with an RTX 5060 (8 GB): if an experiment does not fit, the experiment changes.

<p align="center">
  <img src="https://github.com/kaelvalen/kaelvalen/blob/metrics/github-metrics.svg" width="85%" alt="GitHub metrics" />
</p>
