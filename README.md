
## 📜 Sobre o Projeto
O **Treino Wuju** nasceu como um experimento de lógica de programação e evoluiu para um jogo completo de navegador. O objetivo é sobreviver o máximo de tempo possível contra hordas infinitas de "Capeteemos", testando seus reflexos, precisão de clique e tempo de esquiva. 

O jogo dispensa o uso de motores gráficos pesados ou back-end, rodando 100% no *Client-Side* através de manipulação de DOM e renderização em Canvas.

## 🚀 Funcionalidades e Mecânicas
* **Seleção de Campeões:** Escolha entre Master Yi, Diana ou Sejuani (meus mains na jungle!). Cada campeão possui efeitos visuais únicos e mecânicas de abate exclusivas (ex: Sejuani congela os inimigos antes de estilhaçá-los).
* **Dificuldade Progressiva (Escalonamento):** A cada 25 segundos, o jogo fica mais difícil. Os inimigos ganham mais pontos de vida (HP) e os dardos atirados contra o jogador ficam progressivamente mais rápidos.
* **Mecânica de Esquiva (Dodge):** O jogador possui 5 vidas e precisa usar a barra de `ESPAÇO` no momento exato (dica: aperte enlouquecidamente) para desviar dos ataques inimigos.
* **Sistema de Partículas Dinâmico:** Partículas de fundo que reagem à atração gravitacional do mouse e explosões de partículas ao abater inimigos, baseadas em cálculos de física vetorial e trigonometria.f
* **Feedback Sonoro e Visual:** Textos dinâmicos na tela, overlay de dano/esquiva e o acionamento de um áudio épico de "PENTAKILL" a cada 5 abates consecutivos.
* **Placar Final:** Registro de Nickname na tela inicial e exibição do tempo exato de sobrevivência na tela de Game Over.

## 🛠️ Tecnologias Utilizadas
* **HTML5 (Canvas API):** Para renderização de todos os gráficos, textos e partículas do jogo a 60 FPS.
* **CSS3:** Para a estilização da interface de usuário (UI), tela de seleção de campeões e efeitos de transição/glow.
* **JavaScript (Vanilla/ES6+):** Motor do jogo. Responsável pela Orientação a Objetos (classes de Inimigos, Dardos, Partículas), física, colisões (Teorema de Pitágoras) e temporizadores.

## 🎮 Como Jogar
1. Baixe ou clone este repositório.
2. Abra o arquivo `index.html` em qualquer navegador web moderno.
3. Digite seu Nickname e escolha seu Campeão.
4. **Mouse (Clique Esquerdo):** Ataque os inimigos para reduzir o HP deles.
5. **Teclado (Espaço):** Use para esquivar dos dardos quando eles estiverem prestes a acertar a tela.

## 👨‍💻 Autor
Desenvolvido por **Leonardo Sandes** 🎓 *Estudante de Análise e Desenvolvimento de Sistemas (ADS) na FAETERJ - Rio de Janeiro.*

