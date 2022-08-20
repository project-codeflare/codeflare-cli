# Profiles for Kind-based Tests

## Variants

- gpu1: Uses tests/kind/inputs/ray-tune-tutorial. GPU: yes
- non-gpu1: Uses tests/kind/inputs/qiskit with a requirements.txt. GPU: no
- non-gpu2: Ibid, but with a runtime-env.yaml that specifies pips. GPU: no
- non-gpu3: Ibid, but with a runtime-env.yaml that specifies conda pip dependencies. GPU: no
