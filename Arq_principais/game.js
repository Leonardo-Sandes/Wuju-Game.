const canvas = document.getElementById('arena');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const somPentakill = new Audio('campeoes/pentakill-lol.mp3');
const imgTeemo = new Image();
imgTeemo.src = 'campeoes/capeteemo_silhouette.svg';

let jogoRodando = false;
let campeaoEscolhido = '';
let playerNick = ''; 
let totalKills = 0;
let comboKills = 0;
let pentakillCooldown = false;
let vidas = 5;
let tempoSobrevivencia = 0;
let isDodging = false;


let globalTeemoHpMax = 3;
let globalDardoSpeed = 0.015;
let nivelDificuldade = 0; 

let timerRelogio = null;
let timerAtaques = null;

let inimigos = [];
let particulas = [];
let cortes = [];
let laminasFundo = [];
let dardos = [];

const mouse = { x: null, y: null, radius: 150 };
let isClicking = false;

window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
window.addEventListener('mouseout', () => { mouse.x = undefined; mouse.y = undefined; });
window.addEventListener('mousedown', () => isClicking = true);
window.addEventListener('mouseup', () => isClicking = false);

window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && jogoRodando && !isDodging) {
        isDodging = true;
        const overlay = document.getElementById('esquiva-overlay');
        overlay.style.opacity = '0.3';
        
        setTimeout(() => {
            isDodging = false;
            overlay.style.opacity = '0';
        }, 500);
    }
});

function iniciarJogo(campeao) {
    const inputNick = document.getElementById('player-nick').value.trim();
    playerNick = inputNick !== '' ? inputNick.toUpperCase() : 'INVOCADOR DESCONHECIDO';

    campeaoEscolhido = campeao;
    resetarAtributos();
    
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('ui-layer').style.display = 'block';
    canvas.style.display = 'block';
    
    const uiLayer = document.getElementById('ui-layer');
    const btnVoltar = document.getElementById('btn-voltar');
    if(campeao === 'yi') { uiLayer.style.color = '#e6d870'; btnVoltar.style.borderColor = '#e6d870'; }
    if(campeao === 'diana') { uiLayer.style.color = '#ffffff'; btnVoltar.style.borderColor = '#ffffff'; }
    if(campeao === 'sejuani') { uiLayer.style.color = '#00ffff'; btnVoltar.style.borderColor = '#00ffff'; }

    jogoRodando = true;
    
    timerRelogio = setInterval(() => {
        tempoSobrevivencia++;
        let min = String(Math.floor(tempoSobrevivencia / 60)).padStart(2, '0');
        let sec = String(tempoSobrevivencia % 60).padStart(2, '0');
        document.getElementById('time-count').innerText = `${min}:${sec}`;

        
        if (tempoSobrevivencia > 0 && tempoSobrevivencia % 25 === 0) {
            aumentarDificuldade();
        }

    }, 1000);

    timerAtaques = setInterval(dispararAtaqueInimigo, 2500);

    if (laminasFundo.length === 0) {
        for (let i = 0; i < 500; i++) laminasFundo.push(new Lamina(Math.random() * canvas.width, Math.random() * canvas.height));
    }
    
    animar();
}

function aumentarDificuldade() {
    nivelDificuldade++;
    
    globalTeemoHpMax += 2;
    inimigos.forEach(ini => {
        ini.hpMax += 2;
        ini.hp += 2; 
    });

    let multiplicadorVelocidade = 1.03; 
    if (nivelDificuldade === 1) multiplicadorVelocidade = 1.17;
    else if (nivelDificuldade === 2) multiplicadorVelocidade = 1.10; 
    
    globalDardoSpeed *= multiplicadorVelocidade;

    mostrarAviso("OS TEEMOS FICARAM MAIS FORTES!", "#ff0055");
}

function mostrarAviso(texto, cor) {
    let aviso = document.createElement('div');
    aviso.innerText = texto;
    aviso.style.position = "absolute"; aviso.style.top = "30%"; aviso.style.left = "50%";
    aviso.style.transform = "translate(-50%, -50%)"; aviso.style.color = cor;
    aviso.style.fontWeight = "bold"; aviso.style.fontSize = "35px";
    aviso.style.textShadow = `0 0 15px ${cor}, 0 0 5px #fff`; 
    aviso.style.pointerEvents = "none"; aviso.style.zIndex = "50";
    document.body.appendChild(aviso);
    setTimeout(() => aviso.remove(), 2500);
}

window.voltarSelecao = function() {
    jogoRodando = false;
    clearInterval(timerRelogio);
    clearInterval(timerAtaques);
    
    document.getElementById('start-screen').style.display = 'flex';
    document.getElementById('ui-layer').style.display = 'none';
    canvas.style.display = 'none';
    document.getElementById('gameover-msg').classList.remove('show-msg');
};

function resetarAtributos() {
    totalKills = 0; comboKills = 0; vidas = 5; tempoSobrevivencia = 0;
    globalTeemoHpMax = 3; globalDardoSpeed = 0.015; nivelDificuldade = 0; 

    document.getElementById('kill-count').innerText = totalKills;
    document.getElementById('life-count').innerText = vidas;
    document.getElementById('time-count').innerText = "00:00";
    document.getElementById('vidas-container').classList.remove('vida-perdida');
    
    inimigos = []; particulas = []; cortes = []; dardos = [];
    for (let i = 0; i < 5; i++) inimigos.push(new Inimigo());
}

function sofrerDano() {
    vidas--;
    document.getElementById('life-count').innerText = vidas;
    
    const overlay = document.getElementById('dano-overlay');
    overlay.style.opacity = '0.5';
    setTimeout(() => overlay.style.opacity = '0', 200);

    if (vidas <= 0) {
        document.getElementById('vidas-container').classList.add('vida-perdida');
        gameOver();
    }
}

function gameOver() {
    jogoRodando = false;
    clearInterval(timerRelogio);
    clearInterval(timerAtaques);

    let min = String(Math.floor(tempoSobrevivencia / 60)).padStart(2, '0');
    let sec = String(tempoSobrevivencia % 60).padStart(2, '0');
    
    document.getElementById('final-stats').innerHTML = `<strong>${playerNick}</strong>, você sobreviveu por <span style="color: #e6d870">${min}:${sec}</span>!`;
    document.getElementById('gameover-msg').classList.add('show-msg');
}

class Lamina {
    constructor(x, y) {
        this.x = x; this.y = y;
        this.size = Math.random() * 1.5 + 0.5; 
        this.baseX = this.x; this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        this.color = Math.random() > 0.6 ? '#45f542' : '#e6d870';
    }
    desenhar() {
        let corAtual = this.color;
        if (campeaoEscolhido === 'diana') corAtual = Math.random() > 0.5 ? '#ffffff' : '#a9c6d9';
        if (campeaoEscolhido === 'sejuani') corAtual = Math.random() > 0.5 ? '#00ffff' : '#ffffff';

        ctx.fillStyle = corAtual;
        ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
    }
    atualizar() {
        if (!jogoRodando) return;
        let dx = mouse.x - this.x; let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let forceDirectionX = dx / distance; let forceDirectionY = dy / distance;
        let maxDistance = mouse.radius;
        let force = (maxDistance - distance) / maxDistance;
        
        if (distance < maxDistance) {
            if (isClicking) {
                this.x -= forceDirectionX * force * this.density * 5; 
                this.y -= forceDirectionY * force * this.density * 5;
            } else {
                this.x += forceDirectionX * force * this.density; 
                this.y += forceDirectionY * force * this.density;
            }
        } else {
            if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 15;
            if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 15;
        }
    }
}

class Inimigo {
    constructor() {
        this.x = Math.random() * (canvas.width - 100) + 50;
        this.y = Math.random() * (canvas.height - 100) + 50;
        this.raio = 30; 
        this.vivo = true;
        this.hpMax = globalTeemoHpMax; 
        this.hp = globalTeemoHpMax;
        this.congelado = false; 
        this.angulo = Math.random() * Math.PI * 2;
        this.velocidade = Math.random() * 1.5 + 0.5;
    }
    desenhar() {
        if (!this.vivo && !this.congelado) return;
        
        ctx.shadowBlur = this.congelado ? 30 : 15;
        ctx.shadowColor = this.congelado ? '#00ffff' : '#ff0055';
        
        if (imgTeemo.complete) {
            ctx.drawImage(imgTeemo, this.x - this.raio, this.y - this.raio, this.raio * 2, this.raio * 2);
        }

        if (this.congelado) {
            ctx.fillStyle = 'rgba(0, 255, 255, 0.5)';
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.raio - 10);
            ctx.lineTo(this.x + this.raio + 10, this.y);
            ctx.lineTo(this.x, this.y + this.raio + 10);
            ctx.lineTo(this.x - this.raio - 10, this.y);
            ctx.closePath(); ctx.fill();
        }
        
        ctx.shadowBlur = 0; 
        
        if (this.hp > 0) {
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(this.x - 20, this.y - this.raio - 15, 40, 5);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(this.x - 20, this.y - this.raio - 15, 40 * (this.hp / this.hpMax), 5);
        }
    }
    atualizar() {
        if (!this.vivo || this.congelado) return;
        this.x += Math.cos(this.angulo) * this.velocidade;
        this.y += Math.sin(this.angulo) * this.velocidade;
        this.angulo += 0.02;

        if (this.x < 0 || this.x > canvas.width) this.velocidade *= -1;
        if (this.y < 0 || this.y > canvas.height) this.velocidade *= -1;
    }
}

class Dardo {
    constructor(startX, startY) {
        this.startX = startX; this.startY = startY;
        this.alvoX = canvas.width / 2;
        this.alvoY = canvas.height / 2;
        this.progresso = 0; 
        this.velocidade = globalDardoSpeed; 
        this.deveRemover = false;
    }
    desenhar() {
        let x = this.startX + (this.alvoX - this.startX) * this.progresso;
        let y = this.startY + (this.alvoY - this.startY) * this.progresso;
        let raio = 5 + (this.progresso * 30); 

        ctx.shadowBlur = 10; ctx.shadowColor = '#8a2be2';
        ctx.beginPath(); ctx.arc(x, y, raio, 0, Math.PI * 2);
        ctx.fillStyle = '#8a2be2'; 
        ctx.fill();
        
        ctx.beginPath(); ctx.arc(x, y, raio * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#45f542'; 
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    atualizar() {
        this.progresso += this.velocidade;
        if (this.progresso >= 1) {
            this.deveRemover = true;
            if (!isDodging) {
                sofrerDano();
            } else {
                mostrarAviso("ESQUIVOU!", "#45f542");
            }
        }
    }
}

class Particula {
    constructor(x, y, cor) {
        this.x = x; this.y = y; this.raio = Math.random() * 4 + 1;
        let anguloExplosao = Math.random() * Math.PI * 2; let forca = Math.random() * 8 + 2;
        this.vx = Math.cos(anguloExplosao) * forca; this.vy = Math.sin(anguloExplosao) * forca;
        this.opacidade = 1; this.cor = cor;
    }
    desenhar() {
        ctx.globalAlpha = this.opacidade; ctx.beginPath();
        ctx.arc(this.x, this.y, this.raio, 0, Math.PI * 2);
        ctx.fillStyle = this.cor; ctx.fill(); ctx.globalAlpha = 1.0;
    }
    atualizar() { this.x += this.vx; this.y += this.vy; this.opacidade -= 0.02; }
}

class CorteAlpha {
    constructor(x, y) { this.x = x; this.y = y; this.vida = 1.0; this.angulo = Math.random() * Math.PI; this.tamanho = 150; }
    desenhar() {
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.angulo);
        ctx.beginPath(); ctx.moveTo(-this.tamanho / 2, 0); ctx.lineTo(this.tamanho / 2, 0);
        ctx.lineWidth = this.vida * 8; ctx.strokeStyle = `green`;
        ctx.shadowBlur = 20; ctx.shadowColor = 'green'; ctx.stroke(); ctx.restore();
    }
    atualizar() { this.vida -= 0.08; this.tamanho += 10; }
}

class CorteCrescente {
    constructor(x, y) { this.x = x; this.y = y; this.vida = 1.0; this.angulo = Math.random() * Math.PI * 2; this.raio = 20; }
    desenhar() {
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.angulo);
        ctx.beginPath(); ctx.arc(0, 0, this.raio, -Math.PI/2, Math.PI/2);
        ctx.lineWidth = this.vida * 12; ctx.strokeStyle = `rgba(255, 255, 255, ${this.vida})`;
        ctx.shadowBlur = 20; ctx.shadowColor = '#ffffff'; ctx.stroke(); ctx.restore();
    }
    atualizar() { this.vida -= 0.06; this.raio += 15; }
}

function dispararAtaqueInimigo() {
    if (!jogoRodando) return;
    let atacantes = inimigos.filter(ini => ini.vivo && !ini.congelado);
    if (atacantes.length > 0) {
        let atirador = atacantes[Math.floor(Math.random() * atacantes.length)];
        dardos.push(new Dardo(atirador.x, atirador.y));
    }
}

function processarKill(iniX, iniY) {
    totalKills++;
    document.getElementById('kill-count').innerText = totalKills;

    if (!pentakillCooldown) {
        comboKills++;
        if (comboKills >= 5) {
            dispararPentakill();
            comboKills = 0; pentakillCooldown = true;
            document.getElementById('cooldown-msg').style.display = 'block';
            setTimeout(() => { pentakillCooldown = false; document.getElementById('cooldown-msg').style.display = 'none'; }, 120000);
        }
    }
}

window.addEventListener('mousedown', (event) => {
    if (!jogoRodando) return;

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    for (let i = 0; i < inimigos.length; i++) {
        let ini = inimigos[i];
        if (ini.vivo && !ini.congelado) {
            let dist = Math.hypot(mouseX - ini.x, mouseY - ini.y);
            
            if (dist < ini.raio * 1.5) {
                
                ini.hp--; 

                if (campeaoEscolhido === 'yi' || campeaoEscolhido === 'diana') {
                    
                    if (campeaoEscolhido === 'yi') {
                        cortes.push(new CorteAlpha(ini.x, ini.y));
                        for(let p=0; p<15; p++) particulas.push(new Particula(ini.x, ini.y, '#e6d870'));
                    } else {
                        cortes.push(new CorteCrescente(ini.x, ini.y));
                        for(let p=0; p<15; p++) particulas.push(new Particula(ini.x, ini.y, '#ffffff'));
                    }

                    if (ini.hp <= 0) {
                        ini.vivo = false;
                        processarKill(ini.x, ini.y);
                        
                        setTimeout(() => {
                            ini.x = Math.random() * (canvas.width - 100) + 50;
                            ini.y = Math.random() * (canvas.height - 100) + 50;
                            ini.hpMax = globalTeemoHpMax; 
                            ini.hp = globalTeemoHpMax; 
                            ini.vivo = true;
                        }, 1000);
                    }
                
                } else if (campeaoEscolhido === 'sejuani') {
                    ini.congelado = true;
                    for(let p=0; p<10; p++) particulas.push(new Particula(ini.x, ini.y, '#00ffff'));

                    if (ini.hp > 0) {
                        setTimeout(() => { ini.congelado = false; }, 500);
                    } else {
                        setTimeout(() => {
                            ini.congelado = false; ini.vivo = false;
                            for(let p=0; p<40; p++) particulas.push(new Particula(ini.x, ini.y, Math.random() > 0.5 ? '#00ffff' : '#ffffff'));
                            
                            processarKill(ini.x, ini.y);

                            setTimeout(() => {
                                ini.x = Math.random() * (canvas.width - 100) + 50;
                                ini.y = Math.random() * (canvas.height - 100) + 50;
                                ini.hpMax = globalTeemoHpMax; 
                                ini.hp = globalTeemoHpMax;
                                ini.vivo = true;
                            }, 1000);
                        }, 500);
                    }
                }
                break; 
            }
        }
    }
});

window.iniciarJogo = iniciarJogo;

function dispararPentakill() {
    somPentakill.currentTime = 0; somPentakill.play();
    
    const msgPenta = document.getElementById('pentakill-msg');
    msgPenta.classList.add('show-msg');
    msgPenta.classList.add('anim-shake');

    let corPenta1 = '#ff0055'; let corPenta2 = '#e6d870';
    if (campeaoEscolhido === 'diana') { corPenta1 = '#ffffff'; corPenta2 = '#a9c6d9'; }
    if (campeaoEscolhido === 'sejuani') { corPenta1 = '#00ffff'; corPenta2 = '#ffffff'; }

    for (let p = 0; p < 150; p++) {
        particulas.push(new Particula(canvas.width/2, canvas.height/2, corPenta1));
        particulas.push(new Particula(canvas.width/2, canvas.height/2, corPenta2));
    }

    setTimeout(() => { 
        msgPenta.classList.remove('show-msg'); 
        msgPenta.classList.remove('anim-shake');
    }, 4000);
}

function animar() {
    if (!jogoRodando) return; 

    ctx.fillStyle = 'rgba(9, 10, 15, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    laminasFundo.forEach(lamina => { lamina.atualizar(); lamina.desenhar(); });
    inimigos.forEach(ini => { ini.atualizar(); ini.desenhar(); });

    for (let i = dardos.length - 1; i >= 0; i--) {
        dardos[i].atualizar(); dardos[i].desenhar();
        if (dardos[i].deveRemover) dardos.splice(i, 1);
    }

    for (let i = cortes.length - 1; i >= 0; i--) {
        cortes[i].atualizar(); cortes[i].desenhar();
        if (cortes[i].vida <= 0) cortes.splice(i, 1);
    }

    for (let i = particulas.length - 1; i >= 0; i--) {
        particulas[i].atualizar(); particulas[i].desenhar();
        if (particulas[i].opacidade <= 0) particulas.splice(i, 1);
    }

    requestAnimationFrame(animar);
}

window.addEventListener('resize', () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; });
