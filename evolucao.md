
































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

FASE 4
A Fase 4 implementou a gestão de identidade e reputação dos hospitais no programa Anchor contribution-registry. O contrato foi compilado, implantado na Solana Devnet e validado via testes automatizados executando todas as instruções on-chain.

Modelagem de Estado (state.rs)
Foi criada a estrutura da conta PDA HospitalProfile, derivada das seeds [b"hospital", authority], contendo:

authority: Pubkey do hospital.

contributions_count: Contador de contribuições enviadas (u64).

is_flagged_saboteur: Flag booleana indicando se o hospital foi marcado por comportamento malicioso.

bump: Ponto de derivação da PDA.

Instruções e Regras de Negócio (instructions/)

register_hospital: Cria a PDA do hospital zerando o contador e a flag de sabotador.

record_contribution: Recebe um hash de 32 bytes (contribution_hash), valida que o hospital não está marcado como sabotador e incrementa o contador em modo saturating_add.

flag_saboteur: Altera a flag is_flagged_saboteur para true, impedindo novas contribuições do perfil.

Deploy e Validação na Devnet

Configuração do projeto para a rede Devnet (solana config set --url devnet).

Implantação da versão compilada (contribution_registry.so) sob o Program ID B5ACaF9VKaz4m5r1ZZuaysztfkf9Ptun4apgARyPzdUQ.

Execução do fluxo completo de testes em tests/src/test_initialize.rs com cargo test -p tests, confirmando as 4 transações (Initialize, RegisterHospital, RecordContribution, FlagSaboteur) diretamente no cluster.

Fase 5 estabeleceu a ponte de integração entre a camada de Machine Learning (Python) e o programa Anchor na Solana Devnet. O script ml/bridge/solana_bridge.py calcula o hash SHA256 dos pesos do modelo federado e envia a transação de registro on-chain via AnchorPy.

Cálculo de Hash dos Pesos (hash_weights)
Serializa a lista de arrays numpy com os parâmetros do modelo e gera um digest SHA256 de 32 bytes, garantindo a prova de contribuição sem expor os dados brutos ou a arquitetura interna do hospital.

Tratamento de IDL em Tempo de Execução (fix_idl_for_anchorpy)
Ajusta o IDL gerado pelo Anchor 0.30 para ser compatível com as estruturas de serialização da biblioteca solders/anchorpy:

Converte a especificação do tipo pubkey para publicKey.

Normaliza a estrutura das listas de contas (isMut, isSigner) e mapeia os tipos estruturados associados.

Integração RPC e Manipulação de Contexto (record_contribution_async)

Deriva as PDAs registry_config (b"config") e hospital_profile (b"hospital", authority).

Constrói e envia a transação usando o objeto Context nativo do AnchorPy conectado ao RPC da Devnet ([https://api.devnet.solana.com](https://api.devnet.solana.com)).

Validação Executada On-Chain
O teste do módulo foi executado com sucesso gerando uma conta de teste isolada, registrando a PDA do hospital e enviando a instrução de contribuição. A transação foi gravada e confirmada na Devnet sob a assinatura 4qEEb2CQLSgcgHa23QGJRU5uQAhuXpkVkBbYF3kH2phvkBSxDRd5VWbMNHnuvdznzXadvnVo1VUVK5FGwLCFrKZJ


fase atual: 6


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



ARQUIVO: sinapse-protocol/ml/bridge/solana_bridge.py (já existe com
TODO)

O IDL do programa fica em
sinapse-protocol/target/idl/contribution_registry.json depois de rodar
"anchor build" (fase 4). Se esse arquivo não existir ainda, rode
"anchor build" primeiro, não peça pro Gemini inventar o IDL.

TAREFA DESTA FASE:
Depois de cada rodada de treino do Flower, calcular hash da
contribuição de cada hospital e enviar pro programa Anchor registrar em
devnet, usando AnchorPy.

NÃO FAÇA:
- Não mude a lógica de treino da fase 3.
- Não mude a estrutura do programa Anchor da fase 4, só chame ele.

PRONTO QUANDO:
Depois de uma rodada, dá pra ver no Solana Explorer (devnet) que o hash
foi registrado.

FORMATO OBRIGATÓRIO DA RESPOSTA:
cat > ml/bridge/solana_bridge.py << 'EOF'
(arquivo inteiro)
EOF
Sem explicação longa antes.

