# Neon Finance

Dashboard pessoal de finanças em arquivo único (`index.html`), sem build, sem servidor e sem backend. Ele lê os dados diretamente de uma planilha do Google Sheets (compartilhada como "qualquer pessoa com o link pode ver").

## Como usar

1. Abra o `index.html` no navegador (ou hospede em qualquer lugar estático).
2. Na primeira vez, a tela **Criar acesso** pede um usuário e uma senha — defina-os e clique em **Criar acesso**.
3. Nas próximas visitas, entre com usuário e senha para desbloquear o painel.
4. Cole o link da sua planilha no campo **"Cole o link da sua planilha"** e clique em **Conectar**.

Também dá para abrir já conectado passando a planilha na URL (após desbloquear):

```
index.html?sheet=URL_DA_PLANILHA
```

### Instalar como app no Android (PWA)

O painel é uma **PWA** (manifest + service worker). Para instalá-lo no celular como app:

1. Hospede a pasta `neon-finance-site` em qualquer servidor HTTPS (GitHub Pages, Netlify, Vercel, etc.).
2. No celular Android, abra o endereço no **Chrome**.
3. Toque no menu ⋮ → **"Adicionar à tela inicial"** (ou **"Instalar app"**).
4. Pronto: abre em tela cheia, com ícone próprio, como um app nativo.

O service worker pré-carrega a página, o manifest e os ícones — o app abre offline. Os dados da planilha continuam vindo do Google Sheets (precisam de internet), mas o painel usa a última cópia salva no cache do navegador quando offline.

> Em `file://` a PWA não registra o service worker (exige HTTPS), mas o painel funciona normalmente no navegador.

**Como publicar no GitHub Pages (grátis):**
1. Crie um repositório no GitHub e suba todo o conteúdo desta pasta (o `index.html` na raiz).
2. Repositório → **Settings → Pages** → em *Source* escolha **Deploy from a branch** → `main` + `/ (root)` → **Save**.
3. Aguarde alguns minutos e acesse `https://SEU_USUARIO.github.io/REPOSITORIO/` — é só abrir no Chrome do celular e instalar.

### Tela de acesso (login local)

- A senha é verificada **neste navegador** (hash SHA-256 + salt no `localStorage`); não há servidor.
- É um **bloqueio de tela**, não uma autenticação real: quem tiver acesso ao arquivo/página consegue ver o código. Serve para impedir que outra pessoa do mesmo dispositivo abra o painel.
- Botão **Trancar** (no cabeçalho) bloqueia o painel a qualquer momento.
- Em **"Esqueci a senha"**: apague os dados do site no navegador (Privacidade → Apagar dados do site) e recarregue para redefinir o acesso.
- A tela de acesso também tem o botão **Entrar com Google** (para planilhas privadas) — ele destrava o painel e conecta sua conta. O botão não aparece mais no dashboard.

### Login com Google (planilhas privadas)

Para ler **planilhas privadas**, o painel usa a sua conta Google via OAuth. É preciso criar um **ID do cliente OAuth** no Google Cloud e colá-lo no `index.html`:

1. Acesse **console.cloud.google.com** e crie/selecione um projeto.
2. Menu ☰ → **APIs e serviços → Tela de consentimento OAuth**. Escolha **Externo**, preencha o nome do app e adicione seu e-mail em *Usuários de teste* → **Salvar**.
3. Menu ☰ → **APIs e serviços → Credenciais → + Criar credenciais → ID do cliente OAuth**.
   - Tipo: **Aplicativo da Web**.
   - Em **Origens de JavaScript autorizadas**, adicione a URL base do seu site (ex.: `https://SEU_USUARIO.github.io`).
   - Em **URIs de redirecionamento autorizados**, adicione a mesma URL base.
   - Clique em **Criar** e copie o **ID do cliente** (formato `xxxx.apps.googleusercontent.com`).
4. No arquivo `index.html`, no topo do script, substitua o valor de `APP_CONFIG.CLIENT_ID` (o placeholder `'SEU_CLIENT_ID.apps.googleusercontent.com'`) pelo ID copiado.
5. Suba a alteração (commit + push) e pronto.

> Enquanto o app estiver no status **"Testando"**, o login só funciona para os e-mails adicionados como *usuários de teste* — suficiente para uso pessoal. Para liberar a qualquer pessoa, publique o app na tela de consentimento.

## Formato da planilha

Uma única aba chamada **Lançamentos** com cabeçalho na primeira linha e estas colunas:

| Coluna | Conteúdo |
| --- | --- |
| A | Data (`DD/MM/AAAA` ou `AAAA-MM-DD`) |
| B | Descrição |
| C | Tipo — `Receita`, `Gasto` ou `Investimento` |
| D | Grupo/classificação (para Gastos: `Essencial` ou `Não essencial`) |
| E | Categoria |
| F | Forma de pagamento |
| G | Valor (número, ou em formato moeda `R$ 1.234,56`) |

Se a primeira aba não se chamar `Lançamentos`, ela é detectada automaticamente (procura a aba com os cabeçalhos esperados).

## Funcionalidades

- **Tela de acesso**: bloqueio local com usuário e senha antes do painel, com troca de senha, e **Entrar com Google** na mesma tela.
- **Visão geral**: receita, despesa, investimento, saldo e "saúde financeira" (0–100), com médias e destaques do período.
- **Filtros**: por mês e por ano (cabeçalho do painel).
- **Temas**: botão no cabeçalho com Neon (padrão), Claro e Escuro — a escolha fica salva no navegador.
- **Evolução mensal**: receita × despesa em eixos independentes + saldo em barras.
- **Comparativo anual**: ano atual × ano anterior, mês a mês, com seletor de métrica (Receita, Despesa, Saldo ou ambos). Usa o ano filtrado, ou o último ano com dados.
- **Análises**: ranking por grupo e categoria, donut por grupo, despesas por forma de pagamento, canais de receita.
- **Metas**: poupança (%), aporte mensal e reserva de emergência, com medidor de progresso e barras de atingimento; metas por categoria de gasto.
- **Leituras (insights)**: cards automáticos com destaques do período (melhor/menor mês, categorias mais pesadas, folga de caixa, etc.).
- **Cache local**: os dados ficam salvos no navegador; se a planilha não for alcançável, o painel usa a última cópia conhecida.
- **Login opcional (Google)**: salva seu último vínculo (planilha + filtros) entre dispositivos, para planilhas privadas. Sem login, tudo continua funcionando para planilhas públicas.

## Dependências

- [Chart.js](https://www.chartjs.org/) via CDN (JSZip para exportação, se usado).
- Google Identity Services (GIS) para o login opcional.
- Acesso à API do Google Sheets via fetch direto (CORS aberto pela própria Google).

## Limitações

- Necessita acesso à internet para buscar dados (o cache funciona offline).
- Planilhas privadas exigem o login do Google (opcional).
- Recomenda-se que o arquivo seja servido por HTTP(S) para o login funcionar; em `file://` o login é desativado.
