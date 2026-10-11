# Ghosty no Netlify

## O que funciona
- Site completo, bônus de destaques, quiz, teste dos 3 segundos.
- Diagnóstico com IA (função `claude`), limitado a 20 análises por hora por pessoa.
- Pagamento pelos seus links do Mercado Pago + códigos de acesso enviados no Direct.
- Leads da assessoria pelo Netlify Forms (aparecem no painel e podem ir para o seu e-mail).
- Contador público de visitas (função `visitas`, guardado no Netlify Blobs).

## Publicar (precisa ser pelo GitHub, não pelo arrasta e solta)
1. Crie uma conta em github.com e um repositório `ghosty`. Envie TODOS os arquivos desta pasta
   (netlify.toml, package.json, pasta public e pasta netlify).
2. Em app.netlify.com: Add new project → Import from Git → escolha o repositório `ghosty`. As configurações vêm do netlify.toml.
3. Em Project configuration → Environment variables, crie:
   - `ANTHROPIC_API_KEY` = sua chave de console.anthropic.com (é cobrada por uso).
4. Deploy. Depois, em Domain management, conecte seu domínio.

## Leads da assessoria
- Em Forms, ative "Form detection" e faça um novo deploy.
- Em Forms → Form notifications, adicione seu e-mail para receber cada lead.

## Opcional: Pix automático (sem código)
- Cadastre `MP_ACCESS_TOKEN` (Access Token do Mercado Pago) nas variáveis.
- No `public/index.html`, troque `window.GHOSTY_AUTOPIX=false` por `true`.
- Teste antes com o token de teste do Mercado Pago.
