# Vídeo semana 3 — roteiro de gravação (passo a passo literal)

Mesmo processo dos vídeos 1 e 2: `Shift+PrtScn` pra printar, terminal
ou browser maximizado, `clear` antes de cada comando, espera a última
linha (ou o dado carregar na tela) antes de printar.

---

## BLOCO 1 — Diagrama atualizado

1. Print do diagrama atualizado (repara que os blocos de detecção de
   sabotador, dashboard e explorer já ficaram roxo/"Done", junto do
   registry da semana passada).
2. Renomeia pra `s3-bloco1-diagrama.png`.

**Fala:**
Last week was the on-chain registry. This week: making the network
actually trustworthy and visible — a malicious hospital can't get
through, and anyone can see what's happening on the network in real
time.

---

## BLOCO 2 — Sabotador bloqueado

1. `clear`
2. `anchor test` (ou o comando específico do teste de sabotador, se
   você isolou ele)
3. Espera aparecer `test test_saboteur_blocked ... ok` e o resumo
   final `test result: ok.`
4. `Shift+PrtScn`, terminal inteiro.
5. Renomeia pra `s3-bloco2-sabotador.png`.

**Fala:**
A hospital flagged as a saboteur tries to record a contribution — and
the on-chain program rejects it. This isn't a claim, it's an
automated test proving the rule is enforced on-chain, not just
suggested in a doc.

---

## BLOCO 3 — Dashboard do hospital

1. Abre `/dashboard` no browser, com uma wallet de hospital de teste
   já conectada e com histórico real (confere isso ANTES de gravar —
   se tiver vazio, roda uma contribuição de teste primeiro).
2. Espera os KPIs e o gráfico carregarem de verdade.
3. `Shift+PrtScn`, janela do browser inteira.
4. Renomeia pra `s3-bloco3-dashboard.png`.

**Fala:**
Each hospital gets a dashboard with real on-chain data — contribution
per round, reward history, every transaction linked straight to
Solana Explorer. No mock numbers, no self-reporting.

---

## BLOCO 4 — Explorer público

1. Abre `/explorer` no browser, **sem** carteira conectada.
2. Espera o leaderboard e o feed de atividade carregarem.
3. `Shift+PrtScn`, janela do browser inteira.
4. Renomeia pra `s3-bloco4-explorer.png`.

**Fala:**
And this is public — no wallet needed. Anyone, a judge, a hospital
considering joining, can see the whole network's leaderboard and live
activity without trusting a single word from me.

---

## BLOCO 5 — Fechamento

Reusa `s3-bloco1-diagrama.png` de novo.

**Fala:**
Next week: full end-to-end test, final UI polish, and deploy to
Vercel. Then it's pitch time.

---

## Ordem de montagem no DaVinci

`s3-bloco1-diagrama.png` → `s3-bloco2-sabotador.png` →
`s3-bloco3-dashboard.png` → `s3-bloco4-explorer.png` →
`s3-bloco1-diagrama.png` (de novo)

## Checklist antes de exportar

* [ ] Os 4 arquivos de print renomeados certinho
* [ ] O link do Solana Explorer no bloco 3 está legível na imagem
* [ ] Nenhum fundo preto em nenhuma tela
* [ ] Wallet do dashboard tem histórico real antes de printar (não
      grava com estado vazio)
* [ ] Vídeo final com no máximo ~90 segundos