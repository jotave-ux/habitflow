# 🌱 HabitFlow

Um painel kanban para criar, acompanhar e manter hábitos diários — construído com **HTML, CSS e JavaScript puros**, sem frameworks e sem back-end. Todos os dados ficam salvos no `localStorage` do próprio navegador.

A ideia central é tratar cada hábito como uma planta que cresce ao longo do dia:

-  **Semente** — o hábito ainda não foi feito hoje
-  **Brotando** — está em andamento
-  **Florescendo** — foi concluído hoje

## ✨ Funcionalidades

- Criar hábitos com nome e categoria (Saúde, Estudo, Trabalho, Pessoal)
- Mover hábitos entre colunas por **drag and drop** ou pelos botões `◀ ▶`
- Contagem de **sequência (streak)** por hábito, com recorde salvo
- Resumo do dia: total de hábitos, quantos floresceram hoje e a maior sequência
- Botão **"Começar novo dia"**, que reinicia o quadro e zera a sequência de quem não concluiu
- Persistência automática no `localStorage` — feche a aba e os dados continuam lá
- Layout responsivo (o quadro empilha em telas pequenas)
- Acessibilidade básica: navegação por teclado, `aria-label`s e respeito a `prefers-reduced-motion`

## 🛠️ Tecnologias

- HTML5 semântico
- CSS3 (variáveis, grid e flexbox, sem frameworks)
- JavaScript (Vanilla JS, API de Drag and Drop nativa, `localStorage`)
- Fonte [Fraunces](https://fonts.google.com/specimen/Fraunces) para títulos e [Inter](https://fonts.google.com/specimen/Inter) para a interface

## 📁 Estrutura do projeto

```
habitflow/
├── index.html      # estrutura da página
├── style.css        # design system e estilos
├── script.js         # lógica: estado, persistência, drag and drop
└── README.md
```

## Como rodar 

 Basta abrir o arquivo `index.html` no navegador, ou usar um servidor local simples:

```bash
# clone o repositório
git clone https://github.com/seu-usuario/habitflow.git
cd habitflow

# opção 1: abra o index.html direto no navegador

# opção 2: sirva com um servidor local (evita restrições de alguns navegadores)
npx serve .
# ou
python3 -m http.server 8080
```

## 🧠 Decisões de projeto

- **Sem framework de propósito:** o objetivo do projeto é mostrar domínio de HTML/CSS/JS puros — manipulação de DOM, eventos, drag and drop nativo e persistência local sem depender de bibliotecas.
- **Estado em um único array de objetos** (`habits`), salvo inteiro no `localStorage` a cada alteração — simples de entender e de estender no futuro.
- **Streak calculado por data:** cada hábito guarda `lastCompletedDate`; a sequência só aumenta uma vez por dia, mesmo que o card seja movido várias vezes.

## 🚀 Possíveis melhorias 

- Editar o nome/categoria de um hábito já criado
- Gráfico simples de histórico de conclusões 
- Modo escuro
- Exportar/importar os dados em JSON
- Migrar a persistência para uma API própria (back-end separado), reaproveitando essa mesma interface

## 📄 Licença

Este projeto está sob a licença MIT — sinta-se livre para usar, estudar e adaptar.

---

Projeto feito para fins de estudo e portfólio, como parte da minha formação em desenvolvimento fullstack.
