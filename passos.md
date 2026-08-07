# Sinapse Protocol — Prompts prontos pra usar com o Gemini (versão travada)

## Antes de tudo: roda o setup.sh

Baixa o arquivo `sinapse-setup.sh`, coloca numa pasta onde você quer criar
o projeto, e roda:

```bash
chmod +x sinapse-setup.sh
./sinapse-setup.sh
```

Isso cria a pasta `sinapse-protocol/` inteira: o programa Anchor em
`programs/contribution-registry/`, o frontend Next.js em `web/`, e a
pasta `ml/` com todos os arquivos Python já existindo (com `TODO`
marcado dentro de cada um). O Gemini nunca precisa inventar pasta.

## As duas regras que resolvem o "ele cospe lixo e eu fico perdido"

**Regra 1 — toda fase agora EXIGE que ele devolva comando de terminal
pronto, não código solto.** Isso está escrito em todo bloco de prompt
abaixo, no fim. Se ele responder com só código, sem o comando `cat >`
em volta, cole de novo: *"me devolve isso no formato de comando de
terminal que eu pedi, com cat > caminho/arquivo << EOF"*.

**Regra 2 — você cola o comando inteiro no terminal, de uma vez, e ele
já cria/sobrescreve o arquivo certo sozinho.** Não precisa abrir editor,
não precisa procurar pasta.

**Regra 3 — antes de colar qualquer fase, mostra pra ele a árvore real
de arquivos, não confia só no que eu escrevi.** Roda isso na raiz do
projeto e cola o resultado junto com o `ESTADO.md` em toda fase:

```bash
find sinapse-protocol -type f | grep -v -E 'node_modules|\.git|target|ml-venv|\.next|__pycache__' | sort
```

Isso mostra exatamente o que já existe de verdade no seu computador. Com
isso na conversa, ele não tem como criar arquivo duplicado — ele vê que
já existe e edita, em vez de inventar um novo.

## Como usar (resto das regras)

- **Um chat novo a cada fase.** Nunca continue a mesma conversa de uma fase pra outra.
- **Cola só o bloco da fase atual**, nunca o documento inteiro.
- **No fim de cada chat**, cola: `"Resuma em até 5 bullets o que você decidiu e construiu nessa fase, pra eu colar no início da próxima conversa."` — guarda essa resposta.
- **Atualiza o `ESTADO.md`** com esse resumo antes de abrir a próxima fase.
- **Se algo já aparece na árvore de arquivos que você colou, ele tem que editar aquilo — nunca criar um segundo arquivo parecido do lado.** Se ele criar `dashboard-page.tsx` do lado de um `dashboard/page.tsx` que já existe, por exemplo, é erro dele, não aceita.

### O que fazer quando der erro

1. Depois de **2 tentativas** de correção sem resolver, para. Não fica no mesmo chat pela 3ª vez.
2. Abre **chat novo**.
3. Cola: o `ESTADO.md`, o caminho exato do arquivo, o **conteúdo atual completo** desse arquivo (roda `cat caminho/do/arquivo` no terminal e cola o resultado), e o **erro completo**.
4. Peça: "me devolva o comando cat > (mesmo caminho) << EOF com o arquivo INTEIRO corrigido dentro, não só a parte que mudou."

---

## Arquivo ESTADO.md (você mantém isso, cola em toda fase)

```
PROJETO: Sinapse Protocol
RESUMO: protocolo de aprendizado federado (Flower) pra treinar IA de diagnóstico
entre "hospitais" simulados sem compartilhar dado, coordenado por programas
Solana/Anchor, com agregação confidencial via Arcium. Tudo em DEVNET, zero gasto real.
DATASET: MedMNIST (pneumoniamnist) — uso de pesquisa, não clínico.
ESTRUTURA: já criada pelo setup.sh — programs/contribution-registry/,
web/ (Next.js), ml/ (Python), não recrie nenhuma pasta.

REGRA DE DESIGN (aplicar em toda tela, desde a primeira):
Estilo brutalista. Fontes grossas (bold/black), bordas grossas, sombra
deslocada tipo cartão colado. Variáveis de cor exatas, em Tailwind:
--color-base: #fae8f2       (fundo — SEMPRE esse, nunca preto, nunca branco puro)
--color-identity: #9286fa   (elementos estruturais: card, header, nav)
--color-shock: #FF4500      (destaque, botão de ação, alerta)
--color-support: #0e0d0d    (texto e borda grossa — nunca usado como fundo)

JÁ CONSTRUÍDO ATÉ AGORA:
(cole aqui o resumo que o Gemini devolveu no fim de cada fase concluída)

FASE ATUAL: [número]

REGRA FIXA: não altere nada de fases já concluídas, não invente
biblioteca/arquivo/decisão que não esteja escrito aqui. Se faltar
informação, pergunte antes de inventar.
```

---

## FASE 1 — Testar o dataset

Você nem precisa do Gemini aqui. O arquivo já existe e já funciona:

```bash
cd sinapse-protocol
. ml-venv/bin/activate
python3 ml/scripts/test_dataset.py
```

Se der erro, aí sim, chat novo:

```
[cole o ESTADO.md]
[cole aqui o resultado do comando find — a arvore real de arquivos]

ARQUIVO: sinapse-protocol/ml/scripts/test_dataset.py

Rodei "python3 ml/scripts/test_dataset.py" com o ml-venv ativado e deu
esse erro:
[cole o erro completo]

TAREFA: corrija esse arquivo específico.

FORMATO OBRIGATÓRIO DA RESPOSTA: me devolva só um comando de terminal
Ubuntu no formato:
cat > ml/scripts/test_dataset.py << 'EOF'
(arquivo inteiro corrigido aqui)
EOF
Sem explicação longa antes. Se precisar rodar algo pra testar, me dê o
comando de teste depois do cat.
```

---

## FASE 2 — Treinar 1 hospital sozinho (sem federado ainda)

```
[cole o ESTADO.md atualizado]
[cole aqui o resultado do comando find — a arvore real de arquivos]

ARQUIVO: sinapse-protocol/ml/scripts/train_single.py (já existe com um
TODO dentro)

TAREFA DESTA FASE:
Usando PyTorch e o dataset pneumoniamnist já testado na fase anterior,
treinar um classificador simples (pneumonia ou não) com todo o dataset
de uma vez, sem dividir entre hospitais ainda. Mostrar a acurácia no
final.

NÃO FAÇA:
- Não implemente Flower ainda.
- Não crie múltiplos hospitais ainda.
- Não mexa em nada de blockchain.

PRONTO QUANDO:
O modelo treina até o fim e mostra acurácia.

FORMATO OBRIGATÓRIO DA RESPOSTA: um comando de terminal Ubuntu:
cat > ml/scripts/train_single.py << 'EOF'
(arquivo completo aqui, substituindo o conteúdo atual inteiro)
EOF
Depois do comando, me dê a linha pra eu rodar e testar (ex:
"python3 ml/scripts/train_single.py"). Sem explicação longa antes do
comando.
```

---

## FASE 3 — 3 hospitais treinando juntos com Flower

```
[cole o ESTADO.md atualizado]
[cole aqui o resultado do comando find — a arvore real de arquivos]

ARQUIVOS (já existem com TODO dentro):
- sinapse-protocol/ml/client/dataset_loader.py
- sinapse-protocol/ml/client/hospital_client.py
- sinapse-protocol/ml/server/run_server.py

TAREFA DESTA FASE:
Usando a biblioteca Flower (flwr), dividir o dataset pneumoniamnist em
3 partes iguais (3 hospitais simulados), cada hospital treina a parte
dele, o Flower agrega tudo num modelo final. Ainda sem blockchain.

NÃO FAÇA:
- Não mexa em Solana/Anchor ainda.
- Não use biblioteca diferente de Flower.

PRONTO QUANDO:
As rodadas de treino federado rodam e a acurácia do modelo final
agregado aparece.

FORMATO OBRIGATÓRIO DA RESPOSTA: um comando de terminal por arquivo,
nessa ordem:
cat > ml/client/dataset_loader.py << 'EOF'
(arquivo completo)
EOF
cat > ml/client/hospital_client.py << 'EOF'
(arquivo completo)
EOF
cat > ml/server/run_server.py << 'EOF'
(arquivo completo)
EOF
Depois, a linha de comando pra eu rodar a simulação inteira. Sem
explicação longa antes de cada comando, só uma linha curta dizendo o
que aquele arquivo faz.
```

---

## FASE 4 — Programa Anchor: o "cartório" de contribuição

```
[cole o ESTADO.md atualizado]
[cole aqui o resultado do comando find — a arvore real de arquivos]

ARQUIVO: sinapse-protocol/programs/contribution-registry/src/lib.rs
(já existe com o esqueleto padrão do "anchor new" — edite ele)

TAREFA DESTA FASE:
Escrever o programa Anchor que guarda: quem é cada hospital (endereço
da carteira), quanto cada um já contribuiu, e uma flag se algum foi
identificado tentando sabotar. DEVNET, nunca mainnet.

NÃO FAÇA:
- Não mexa no código Python nessa fase.
- Não use mainnet em nenhuma hipótese.

PRONTO QUANDO:
"anchor build" compila sem erro e "anchor test" passa.

FORMATO OBRIGATÓRIO DA RESPOSTA:
cat > programs/contribution-registry/src/lib.rs << 'EOF'
(arquivo INTEIRO, substituindo o esqueleto atual)
EOF
Depois, as duas linhas de comando pra eu rodar: "anchor build" e
"anchor test". Sem explicação longa antes.
```

---

## FASE 5 — Ligar Python e Solana (a ponte)

```
[cole o ESTADO.md atualizado]
[cole aqui o resultado do comando find — a arvore real de arquivos]

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
```

---

## FASE 6 — Recompensa automática

```
[cole o ESTADO.md atualizado]
[cole aqui o resultado do comando find — a arvore real de arquivos]

ARQUIVO: sinapse-protocol/programs/contribution-registry/src/lib.rs
(o MESMO arquivo da fase 4 — adicione a instrução nova nele)

TAREFA DESTA FASE:
Adicionar uma instrução que distribui recompensa (token de teste,
devnet) proporcional à contribuição de cada hospital, automaticamente.

NÃO FAÇA:
- Nada de token/valor real, só devnet.

PRONTO QUANDO:
Um hospital com contribuição registrada recebe a recompensa
automaticamente, testado em devnet.

FORMATO OBRIGATÓRIO DA RESPOSTA:
cat > programs/contribution-registry/src/lib.rs << 'EOF'
(arquivo INTEIRO atualizado — inclua tudo que já existia da fase 4 MAIS
a instrução nova, porque esse comando substitui o arquivo inteiro)
EOF
Sem explicação longa antes.
```

---

## FASE 7 — Agregação confidencial via Arcium

```
[cole o ESTADO.md atualizado]
[cole aqui o resultado do comando find — a arvore real de arquivos]

ARQUIVOS:
- O circuito Arcis vai em sinapse-protocol/arcium/. ANTES de pedir
  código, rode "arcium init" dentro dessa pasta pra gerar a estrutura
  oficial — não peça pro Gemini inventar a estrutura de pasta do
  Arcium, só peça o conteúdo do circuito depois que a pasta existir.
- sinapse-protocol/ml/bridge/arcium_bridge.py (já existe com TODO)

TAREFA DESTA FASE:
Circuito que agrega, de forma confidencial, o placar de contribuição
de cada hospital (um número, não o modelo inteiro) — nem o servidor vê
a contribuição individual.

NÃO FAÇA:
- Não tente agregar o modelo inteiro, só o placar (um número).

PRONTO QUANDO:
Rodar com 3 valores de teste e o resultado agregado sai certo, sem
nenhum valor individual aparecer em log nenhum.

FORMATO OBRIGATÓRIO DA RESPOSTA: primeiro me diga o comando "arcium
init" e onde rodar. Depois disso, comando(s) cat > caminho << EOF pro
conteúdo do circuito e pro ml/bridge/arcium_bridge.py, um bloco por
arquivo. Sem explicação longa antes.
```

---

## FASE 8 — Detectar hospital sabotando

```
[cole o ESTADO.md atualizado]
[cole aqui o resultado do comando find — a arvore real de arquivos]

ARQUIVO: sinapse-protocol/programs/contribution-registry/src/lib.rs
(o mesmo arquivo das fases 4 e 6)

TAREFA DESTA FASE:
Simular um hospital enviando contribuição ruim de propósito (valores
aleatórios) e adicionar lógica que identifica isso e recusa a
recompensa pra esse hospital.

PRONTO QUANDO:
Teste de sabotagem mostra que aquele hospital não recebe recompensa,
os honestos recebem normal.

FORMATO OBRIGATÓRIO DA RESPOSTA:
cat > programs/contribution-registry/src/lib.rs << 'EOF'
(arquivo INTEIRO atualizado, incluindo tudo das fases 4 e 6 mais essa
checagem nova)
EOF
Sem explicação longa antes.
```

---

## FASE 9 — Painel do hospital (frontend)

```
[cole o ESTADO.md atualizado — a REGRA DE DESIGN dele vale aqui]
[cole aqui o resultado do comando find — a arvore real de arquivos]

ARQUIVO: sinapse-protocol/web/app/dashboard/page.tsx (essa pasta
"dashboard" ainda não existe, crie exatamente nesse caminho, dentro da
pasta "web")

TAREFA DESTA FASE:
Página que mostra, pra um hospital conectado com carteira devnet:
quanto já contribuiu, quanto já recebeu de recompensa, histórico de
rodadas. Usar @solana/kit pra ler os dados do programa Anchor. Aplicar
a paleta de cor da REGRA DE DESIGN do ESTADO.md.

NÃO FAÇA:
- Não mexa em nada do backend/programas.
- Fundo nunca preto, sempre --color-base.

PRONTO QUANDO:
Página mostra dado real da devnet.

FORMATO OBRIGATÓRIO DA RESPOSTA:
cat > web/app/dashboard/page.tsx << 'EOF'
(arquivo completo)
EOF
Se precisar de componente novo, um bloco cat > separado por arquivo.
Sem explicação longa antes.
```

---

## FASE 10 — Painel público (Explorer)

```
[cole o ESTADO.md atualizado — a REGRA DE DESIGN dele vale aqui]
[cole aqui o resultado do comando find — a arvore real de arquivos]

ARQUIVO: sinapse-protocol/web/app/explorer/page.tsx (ainda não existe,
crie nesse caminho)

TAREFA DESTA FASE:
Página pública, sem carteira, mostrando: quantos hospitais na rede,
acurácia atual, quantas rodadas já rolaram. Nenhuma informação
individual de hospital aqui. Aplicar a paleta de cor do ESTADO.md.

PRONTO QUANDO:
Qualquer pessoa sem carteira abre e vê o estado geral da rede.

FORMATO OBRIGATÓRIO DA RESPOSTA:
cat > web/app/explorer/page.tsx << 'EOF'
(arquivo completo)
EOF
Sem explicação longa antes.
```

---

## FASE 11 — Prova visível (link pro Solana Explorer)

```
[cole o ESTADO.md atualizado]
[cole aqui o resultado do comando find — a arvore real de arquivos]

ARQUIVOS: sinapse-protocol/web/app/dashboard/page.tsx e
sinapse-protocol/web/app/explorer/page.tsx (os dois já existem)

TAREFA DESTA FASE:
Em cada rodada mostrada, adicionar link direto pro Solana Explorer
(devnet) apontando pro hash registrado on-chain de verdade.

PRONTO QUANDO:
Clicar no link abre o Solana Explorer com a transação real em devnet.

FORMATO OBRIGATÓRIO DA RESPOSTA: dois comandos cat >, um por arquivo,
cada um com o ARQUIVO INTEIRO atualizado (o que já existia das fases 9
e 10, mais o link novo):
cat > web/app/dashboard/page.tsx << 'EOF'
(arquivo inteiro)
EOF
cat > web/app/explorer/page.tsx << 'EOF'
(arquivo inteiro)
EOF
Sem explicação longa antes.
```

---

## FASE 12 — Teste de ponta a ponta

```
[cole o ESTADO.md atualizado]
[cole aqui o resultado do comando find — a arvore real de arquivos]

ARQUIVO: nenhum arquivo novo. Só rodar o que já existe.

TAREFA DESTA FASE:
Rodar o processo inteiro: hospital treina → manda contribuição →
cartório registra → recompensa cai → painel atualiza → link do
Explorer aparece. Anotar o que quebrar.

FORMATO OBRIGATÓRIO DA RESPOSTA: me devolva a sequência de comandos de
terminal pra rodar cada etapa em ordem, com um comentário curto antes
de cada comando dizendo o que ele testa. Sem explicação longa.
```

---

## FASE 13 — Interface pronta pra alguém de fora usar sozinho

```
[cole o ESTADO.md atualizado — a REGRA DE DESIGN dele vale aqui, com
[cole aqui o resultado do comando find — a arvore real de arquivos]
mais atenção ainda: fontes grossas, bordas grossas, sombra deslocada,
--color-base #fae8f2 de fundo (nunca preto), --color-support #0e0d0d
só em texto/borda, --color-identity #9286fa nos blocos estruturais,
--color-shock #FF4500 só em destaque/ação]

ARQUIVOS: sinapse-protocol/web/app/dashboard/page.tsx e
sinapse-protocol/web/app/explorer/page.tsx (os mesmos de sempre)

TAREFA DESTA FASE:
Revisar pra garantir que alguém que nunca viu o projeto entenda só
olhando, sem instrução. Sem termo técnico sem explicação na tela.

NÃO FAÇA:
- Não mude lógica funcional, só visual e clareza.

PRONTO QUANDO:
Pessoa de fora consegue navegar e entender sozinha.

FORMATO OBRIGATÓRIO DA RESPOSTA: comandos cat > com o arquivo inteiro
atualizado, um por arquivo. Sem explicação longa antes.
```

---

## FASE 14 — Publicar no ar

```
[cole o ESTADO.md atualizado]
[cole aqui o resultado do comando find — a arvore real de arquivos]

ARQUIVO: nenhum arquivo de código novo — comandos de deploy, dentro da
pasta sinapse-protocol/web/ pro frontend.

TAREFA DESTA FASE:
Publicar o frontend no Vercel (gratuito), confirmar que os programas
Anchor estão deployados em devnet e acessíveis publicamente.

NÃO FAÇA:
- Nada de mainnet.

PRONTO QUANDO:
Um link público abre o projeto funcionando, sem instalar nada.

FORMATO OBRIGATÓRIO DA RESPOSTA: sequência de comandos de terminal, um
comentário curto antes de cada um dizendo o que faz. Sem explicação
longa.
```