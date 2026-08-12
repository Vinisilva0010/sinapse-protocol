
































PROJETO: Sinapse Protocol

RESUMO: protocolo de aprendizado federado (Flower) pra treinar IA de diagnóstico

entre "hospitais" simulados sem compartilhar dado, coordenado por programas

Solana/Anchor, com agregação confidencial via Arcium. Tudo em DEVNET, zero gasto real.

DATASET: MedMNIST (pneumoniamnist) — uso de pesquisa, não clínico.

ESTRUTURA: já criada — programs/contribution-registry/, web/ (Next.js),

ml/ (Python). Não recrie nenhuma pasta.



REGRA DE DESIGN (aplicar em toda tela, desde a primeira):

Estilo brutalista. Fontes grossas (bold/black), bordas grossas, sombra

deslocada tipo cartão colado. Variáveis de cor exatas, em Tailwind:

--color-base: #fae8f2       (fundo — SEMPRE esse, nunca preto, nunca branco puro)

--color-identity: #9286fa   (elementos estruturais: card, header, nav)

--color-shock: #FF4500      (destaque, botão de ação, alerta)

--color-support: #0e0d0d    (texto e borda grossa — nunca usado como fundo)



JÁ CONSTRUÍDO ATÉ AGORA:

Fase 1 completa — ambiente Python funcionando, dataset pneumoniamnist

carregando certo (torch + torchvision instalados juntos, do mesmo índice

CPU, pra evitar incompatibilidade).

Fase 2 completa — baseline solo treinado com train_single.py, 1 modelo

com todo o dataset de uma vez, prints em inglês.

Fase 3 completa — 3 hospitais treinando via Flower (run_server.py),

rodado com "python3 -m ml.server.run_server" (não com o caminho direto

.py, senão dá ModuleNotFoundError — todo pacote dentro de ml/ tem

__init__.py agora). client_fn usa Context (API nova do Flower, não o cid

antigo) e converte pra int antes de indexar a lista de partições.

Acurácia federada final: 85.42%, subindo rodada a rodada, batendo o

baseline solo. Vídeo da semana 1 já gravado e enviado.

JÁ CONSTRUÍDO ATÉ AGORA:
Fase 1 completa — ambiente Python funcionando, dataset pneumoniamnist
carregando certo (torch + torchvision instalados juntos, do mesmo
índice CPU).
Fase 2 completa — baseline solo treinado (train_single.py), prints em
inglês.
Fase 3 completa — 3 hospitais treinando via Flower (run_server.py, com
"python3 -m ml.server.run_server"). Acurácia federada final: 85.42%,
batendo o baseline solo.
Fase 4 completa — programa Anchor contribution-registry no ar em
DEVNET (Program ID B5ACaF9VKaz4m5r1ZZuaysztfkf9Ptun4apgARyPzdUQ), via
RPC da Helius no Anchor.toml (a RPC pública da devnet falha em deploy
por congestionamento). Conta HospitalProfile (authority,
contributions_count, rewarded_count, is_flagged_saboteur, bump) e
RegistryConfig (admin, bump). RBAC real: só o admin (has_one = admin)
pode chamar record_contribution, flag_saboteur e distribute_reward —
só register_hospital é auto-registrado pelo próprio hospital, de
propósito. Nenhuma instrução aceita auto-atestação de contribuição.
Fase 5 completa — ml/bridge/solana_bridge.py fazendo a ponte
Python↔Solana via AnchorPy: calcula hash SHA256 real dos pesos do
modelo, corrige o IDL do Anchor 0.30 pra compatibilidade com
solders/anchorpy, e grava a contribuição on-chain de verdade
(transação confirmada na devnet). Rodar com
"python3 -m ml.bridge.solana_bridge".
Fase 6 completa — distribute_reward paga só a diferença entre
contributions_count e rewarded_count (não a contagem inteira de novo),
evitando pagamento duplicado pela mesma contribuição — bug real
encontrado e corrigido antes de ir pra produção. Transferência via CPI
ao system_program.
Vídeo da semana 1 (Fases 1-3) e semana 2 (Fases 4-6) gravados e
enviados.

Fase 7 completa — agregação confidencial via Arcium funcionando de
verdade em cluster MPC local (Docker), projeto separado em
~/confidential_aggregation (fora do sinapse-protocol, porque Anchor
não aceita workspace dentro de workspace).

Circuito (encrypted-ixs/src/lib.rs): soma 3 placares de hospital
criptografados (u8 cada), devolve só o total (u16) — nenhum valor
individual é visível em nenhum momento, nem pro servidor.

Fluxo real de 2 instruções: init_aggregate_scores_comp_def (registra o
circuito on-chain, roda uma vez) e aggregate_scores (invoca a
computação, aguarda callback do cluster MPC via
awaitComputationFinalization). Testado com placares reais
(85+90+88=263), resultado bateu certo, assinaturas de transação reais
na devnet local.

Peça-chave: a resolução de conta (mxeAccount, compDefAccount,
addressLookupTable) não é automática pelo Anchor client padrão — essas
contas usam macro própria da Arcium (derive_mxe_pda!, etc), não seeds
padrão. Por isso existe uma função helper (initAggregateScoresCompDef)
dentro do próprio arquivo de teste que resolve isso na mão antes de
chamar a instrução.









FASE ATUAL: 8





REGRA FIXA: não altere nada de fases já concluídas, não invente

biblioteca/arquivo/decisão que não esteja escrito aqui. Se faltar

informação, pergunte antes de inventar.



REGRA DE COMO RODAR SCRIPT PYTHON: qualquer arquivo dentro de ml/ que

importe de outro lugar do próprio projeto tem que ser rodado com

"python3 -m ml.pasta.arquivo" (ponto, sem .py), nunca com barra e .py.

Sempre da raiz de sinapse-protocol.



ÁRVORE REAL DE ARQUIVOS:

./.prettierignore

./Anchor.toml

./Cargo.toml

./commits.md

./docs/dataset-disclaimer.md

./migrations/deploy.ts

./ml/__init__.py

./ml/bridge/__init__.py

./ml/bridge/arcium_bridge.py

./ml/bridge/solana_bridge.py

./ml/client/__init__.py

./ml/client/dataset_loader.py

./ml/client/hospital_client.py

./ml/requirements.txt

./ml/scripts/__init__.py

./ml/scripts/test_dataset.py

./ml/scripts/train_single.py

./ml/server/__init__.py

./ml/server/run_server.py

./package.json

./passos.md

./programs/contribution-registry/Cargo.toml

./programs/contribution-registry/src/constants.rs

./programs/contribution-registry/src/error.rs

./programs/contribution-registry/src/instructions.rs

./programs/contribution-registry/src/instructions/initialize.rs

./programs/contribution-registry/src/lib.rs

./programs/contribution-registry/src/state.rs

./rust-toolchain.toml

./tests/Cargo.toml

./tests/src/lib.rs

./tests/src/test_initialize.rs

./tsconfig.json

./web/AGENTS.md

./web/CLAUDE.md

./web/README.md

./web/app/favicon.ico

./web/app/globals.css

./web/app/layout.tsx

./web/app/page.tsx

./web/eslint.config.mjs

./web/next-env.d.ts

./web/next.config.ts

./web/package.json

./web/pnpm-lock.yaml

./web/pnpm-workspace.yaml

./web/postcss.config.mjs

./web/public/file.svg

./web/public/globe.svg

./web/public/next.svg

./web/public/vercel.svg

./web/public/window.svg

./web/tsconfig.json

./yarn.lock



---



ARQUITETURA DESTA FASE (siga exatamente, não invente estrutura
diferente):
- O circuito Arcis (linguagem da Arcium, parecida com Rust) fica na
  pasta encrypted-ixs/ que o "arcium init" já criou.
- O circuito recebe os placares de 3 hospitais criptografados numa
  struct só, soma os três, devolve só o total criptografado — nenhum
  valor individual é exposto em nenhum momento, nem pro servidor.
- A chamada pro circuito é feita por um script TypeScript/Node.js
  dentro da pasta arcium/, usando o SDK oficial da Arcium
  (@arcium-hq/client ou equivalente que o "arcium init" já deixou no
  package.json gerado).
- ml/bridge/arcium_bridge.py vira um wrapper Python que chama esse
  script Node.js via subprocess e lê o resultado.

EXEMPLO OFICIAL DE CIRCUITO (adapte este padrão exato, não invente
sintaxe diferente — isso é o "Hello World" real da documentação da
Arcium, adaptado pra somar 3 valores em vez de 2):

use arcis::*;

#[encrypted]
mod circuits {
    use arcis::*;

    pub struct HospitalScores {
        score_1: u32,
        score_2: u32,
        score_3: u32,
    }

    #[instruction]
    pub fn aggregate_scores(input_ctxt: Enc<Shared, HospitalScores>) -> Enc<Shared, u32> {
        let input = input_ctxt.to_arcis();
        let total = input.score_1 + input.score_2 + input.score_3;
        input_ctxt.owner.from_arcis(total)
    }
}

TAREFA DESTA FASE:
1. Adaptar o circuito acima dentro de encrypted-ixs/, ajustando pro
   nome de arquivo que o "arcium init" gerou.
2. Escrever o script TypeScript que chama esse circuito (init da
   computation definition + invocação), seguindo o padrão do guia
   oficial linkado acima — se você (Gemini) não tiver certeza da
   derivação exata de alguma PDA/conta, AVISE explicitamente em vez de
   inventar um endereço, porque conta errada aqui não dá erro de
   compilação, dá erro silencioso ou trava em execução.
3. ml/bridge/arcium_bridge.py chamando esse script via subprocess.

NÃO FAÇA:
- Não tente agregar o modelo inteiro, só os 3 placares (números).
- Não invente nome de pacote npm — usa o que já estiver no
  package.json que o "arcium init" gerou.
- Se travar em algo muito específico da Arcium que o guia oficial não
  cobre claramente, PARE e me avise em vez de inventar — essa é a parte
  mais nova/menos madura do stack inteiro do projeto.

PRONTO QUANDO:
Rodar com os 3 placares de teste e o resultado agregado (a soma) sai
certo, sem nenhum valor individual aparecer em nenhum log.

FORMATO OBRIGATÓRIO DA RESPOSTA: um comando cat > por arquivo (circuito
Arcis, script TypeScript, arcium_bridge.py), cada um com o conteúdo
completo. Antes de cada comando, uma linha curta dizendo o que aquele
arquivo faz. Se tiver alguma incerteza real sobre uma conta/PDA
específica da Arcium, declare isso explicitamente ANTES do comando, não
depois.