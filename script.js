// --- CONFIGURAÇÃO DOS PRESENTES ---
const CONFIG_PRESENTES = {
    1: {
        senha: "26", 
        titulo: "A Touca dos presentes",
        mensagem: "Eu sou o seu Papai Noel esse ano! Essa touca representa o início de tudo. Coloque-a e prepare-se, pois tenho muito amor e surpresas para você. É um presente extremamente simples eu sei... Mas vamos lá, tem muito te esperando ainda, continue antenada para o que mais tem por vir! Te amo <3",
        imagem: "images/foto-touca.jpg" 
    },
    2: {
        senha: "natal",
        titulo: "Dia 2: O Mistério",
        mensagem: "Aqui vai a mensagem linda do dia 2...",
        imagem: "images/foto-dia2.jpg"
    }
    // ... Adicione até o dia 11 ...
};

// Variáveis de Controle
let diaAtualAberto = null;
let cliquesNaCaixa = 0;
const CLIQUES_PARA_ABRIR = 5;

// --- 1. LÓGICA DO TIMER (SEU CÓDIGO ORIGINAL OTIMIZADO) ---
const dataNatal = new Date("December 25, 2025 00:00:00").getTime();

function atualizarContadorNatal() {
    const agora = new Date().getTime();
    const distancia = dataNatal - agora;
    
    // Evita numeros negativos se passar do natal
    if(distancia < 0) {
        document.getElementById("countdown-natal").innerHTML = "🎅 FELIZ NOSSO PRIMEIRO NATAL! 🎅";
        return;
    }

    const dias = Math.floor(distancia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((distancia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((distancia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((distancia % (1000 * 60)) / 1000);

    document.getElementById("countdown-natal").innerHTML = `🎁 Natal em: ${dias}d ${horas}h ${minutos}m ${segundos}s`;
}
setInterval(atualizarContadorNatal, 1000);
atualizarContadorNatal();


// --- 2. LÓGICA DOS CARDS (Bloqueio/Desbloqueio) ---
(function () {
    function getTargetDateLocal(day) {
        const now = new Date();
        const year = now.getFullYear();
        // Cuidado: Mês 11 é Dezembro em JS
        return new Date(year, 11, Number(day), 0, 0, 0, 0);
    }

    function unlockCard(card, id) {
        card.classList.remove('locked');
        card.classList.add('unlocked');
        
        // Remove timer visual
        const lockTimer = card.querySelector('.lock-timer');
        if (lockTimer) lockTimer.style.display = 'none';

        // Atualiza ícone
        const icon = card.querySelector('i.fas');
        if (icon) {
            icon.classList.remove('fa-lock');
            icon.classList.add('fa-gift');
        }

        // Atualiza status e Botão
        const pStatus = Array.from(card.querySelectorAll('p')).find(p => p.textContent?.includes('Status'));
        if (pStatus) pStatus.textContent = 'Status: DISPONÍVEL!';

        // Injeta ou habilita o botão de abrir
        let btnContainer = card.querySelector('div > button')?.parentNode;
        
        // Se não tiver botão (dias 2 a 11), cria um
        if (!btnContainer) {
            const divBtn = document.createElement('div');
            divBtn.innerHTML = `<button class="reveal-button" onclick="iniciarAbertura(${id})">Abrir Presente</button>`;
            card.appendChild(divBtn);
        } else {
            // Se já tem (dia 1), só atualiza o onclick
            const btn = card.querySelector('.reveal-button');
            btn.setAttribute('onclick', `iniciarAbertura(${id})`);
            btn.removeAttribute('disabled');
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
        }
    }

    function checkTimers() {
        const cards = document.querySelectorAll('.present-card');
        const now = new Date();

        cards.forEach(card => {
            const dateStr = card.getAttribute('data-date');
            const id = parseInt(card.id.split('-')[1]);
            const target = getTargetDateLocal(dateStr);
            const diff = target - now;
            const timerSpan = card.querySelector(`#timer-${id}`);

            if (diff <= 0) {
                // Já passou da data
                unlockCard(card, id);
            } else {
                // Ainda bloqueado
                if (timerSpan) {
                    // Formatação simples do tempo
                    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const s = Math.floor((diff % (1000 * 60)) / 1000);
                    timerSpan.textContent = `${h}h ${m}m ${s}s`;
                }
            }
        });
        atualizarContadorPresentesAbertos();
    }

    setInterval(checkTimers, 1000);
    checkTimers(); // Roda ao iniciar
})();


// --- 3. LÓGICA DO MODAL E ABERTURA (CLASH ROYALE STYLE) ---

// Função chamada pelo botão "Abrir Presente"
function iniciarAbertura(id) {
    diaAtualAberto = id;
    const modal = document.getElementById('modal-presente');
    const inputSenha = document.getElementById('input-senha');
    const erroSenha = document.getElementById('erro-senha');
    
    modal.classList.remove('hidden');
    inputSenha.value = '';
    erroSenha.textContent = '';

    // Verifica se já foi aberto antes no LocalStorage
    const jaAberto = localStorage.getItem(`presente_${id}_aberto`);
    
    if (jaAberto) {
        // Se já abriu, pula direto para o conteúdo final
        mostrarConteudoFinal(id);
    } else {
        // Se não, vai para a fase da senha
        alternarFase('fase-senha');
    }
}

function fecharModal() {
    document.getElementById('modal-presente').classList.add('hidden');
}

function alternarFase(faseId) {
    // Esconde todas as fases
    document.querySelectorAll('.fase').forEach(el => el.classList.add('hidden'));
    // Mostra a desejada
    document.getElementById(faseId).classList.remove('hidden');
}

// Verifica a senha digitada
function verificarSenha() {
    const input = document.getElementById('input-senha').value.toLowerCase().trim();
    const config = CONFIG_PRESENTES[diaAtualAberto];
    
    // Se não tiver config (ex: dia que vc esqueceu de cadastrar), libera direto para teste
    if (!config || input === config.senha.toLowerCase()) {
        prepararFaseAbrir();
    } else {
        document.getElementById('erro-senha').textContent = "Senha incorreta! Tente novamente.";
        // Efeito de erro (tremida)
        const inputEl = document.getElementById('input-senha');
        inputEl.style.borderColor = 'red';
        setTimeout(() => inputEl.style.borderColor = '#ccc', 1000);
    }
}

// Prepara a caixa para ser clicada
function prepararFaseAbrir() {
    alternarFase('fase-abrir');
    cliquesNaCaixa = 0;
    const imgGift = document.getElementById('img-gift-box');
    imgGift.classList.remove('shaking');
    // Dica visual: adiciona uma classe shaking leve
    setTimeout(() => imgGift.classList.add('shaking'), 500);
    new Audio('audios/presente-balancando.mp3').play().catch(() => {});
}

// Efeito ao clicar na caixa de presente
function clicarPresente() {
    const imgGift = document.getElementById('img-gift-box');
    cliquesNaCaixa++;
    
    // Animação de "espremer" (Scale)
    imgGift.classList.remove('shaking'); // Para a tremedeira suave
    imgGift.style.transform = "scale(0.85)"; // Diminui
    
    // Toca som se quiser (precisa do arquivo)
    new Audio('audios/pop.mp3').play().catch(() => {});

    setTimeout(() => {
        imgGift.style.transform = "scale(1.1)"; // Aumenta (elastico)
        setTimeout(() => imgGift.style.transform = "scale(1)", 100);
    }, 100);

    // Se atingiu os cliques necessários
    if (cliquesNaCaixa >= CLIQUES_PARA_ABRIR) {
        abrirDeVerdade();
    }
}

// O Grande Momento: Abre e mostra o conteúdo
function abrirDeVerdade() {
// Solta confetes!
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 2000 
    });

    // Salva no LocalStorage que esse dia foi vencido
    localStorage.setItem(`presente_${diaAtualAberto}_aberto`, "true");
    atualizarContadorPresentesAbertos();

    new Audio('audios/abrido.mp3').play().catch(() => {});
    // Mostra o conteúdo final
    mostrarConteudoFinal(diaAtualAberto);
}

function mostrarConteudoFinal(id) {
    const config = CONFIG_PRESENTES[id];
    
    if (config) {
        document.getElementById('titulo-final').textContent = config.titulo;
        document.getElementById('conteudo-final-body').innerHTML = `
            <p style="font-size: 1.1em; line-height: 1.6;">${config.mensagem}</p>
            ${config.imagem ? `<img src="${config.imagem}" alt="Presente">` : ''}
        `;
    } else {
        document.getElementById('titulo-final').textContent = "Presente Aberto!";
        document.getElementById('conteudo-final-body').innerHTML = "<p>O conteúdo deste dia ainda está sendo preparado pelo Noel...</p>";
    }

    alternarFase('fase-conteudo');
}

// Atualiza o contador lá no rodapé da página (X / 11)
function atualizarContadorPresentesAbertos() {
    let abertos = 0;
    for (let i = 1; i <= 11; i++) {
        if (localStorage.getItem(`presente_${i}_aberto`)) {
            abertos++;
        }
    }
    const contadorEl = document.getElementById('countdown-presents');
    if (contadorEl) {
        contadorEl.textContent = `${abertos} / 11 🎁`;
    }
}