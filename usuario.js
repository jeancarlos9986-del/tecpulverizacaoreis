// usuario.js — Versão 5.5 (Com Imagem + Observação do Admin Integradas)

const LAST_SAVED_ID_KEY = "last_saved_report_id";
const MAIN_STORAGE_KEY = "relatorios_simulados_v2";

// ====================================================================
// ====== FUNÇÕES GLOBAIS (RENDERIZAÇÃO E CARREGAMENTO) ======
// ====================================================================

/**
 * Monta o HTML dos cards de relatório.
 * @param {Array<Object>} relatorios Lista de relatórios.
 * @param {HTMLElement} container O container onde os cards serão injetados.
 */
function renderizarRelatorios(relatorios, container) {
    if (!relatorios || relatorios.length === 0) return;

    const alerta = document.getElementById("alertaSemDados");
    if (alerta) alerta.classList.add("d-none");
    container.innerHTML = ""; // Limpa o container

    relatorios.forEach(r => {
        const card = document.createElement("div");
        // Adicionando uma classe que facilita a identificação de status para o Aplicador
        const statusClass = r.status === "Concluída" ? "border-success" :
            r.status === "Em andamento" ? "border-warning" : "border-primary";

        card.className = `card shadow p-4 mb-4 border-2 ${statusClass}`;

        // --- TABELA DE PRODUTOS ---
        // (Lógica mantida)
        const produtosTabela = r.resultados?.length
            ? `<table class="table table-sm table-bordered mt-3">
                <thead class="table-light">
                    <tr><th>Produto</th><th>Por Tanque</th><th>Total Área</th></tr>
                </thead>
                <tbody>
                    ${r.resultados.map(item => `
                    <tr>
                        <td>${item.produto}</td>
                        <td>${item.porTanque.toFixed(2)} ${item.unidade}</td>
                        <td>${item.totalArea.toFixed(2)} ${item.unidade}</td>
                    </tr>`).join("")}
                </tbody>
            </table>`
            : "<p class='text-muted fst-italic'>Nenhum produto listado.</p>";

        // --- TABELA DE BOMBA PICADA ---
        // (Lógica mantida)
        const bombaTabela = r.sobressalente?.length
            ? `<div class="mt-2">
                <h6 class="fw-semibold text-secondary">🟩 Bomba Picada</h6>
                <table class="table table-sm table-bordered mt-2 table-bomba-picada">
                    <thead class="table-warning">
                        <tr><th>Produto</th><th>Quantidade</th><th>Unidade</th></tr>
                    </thead>
                    <tbody>
                        ${r.sobressalente.map(s => `
                        <tr>
                            <td>${s.produto}</td>
                            <td>${s.quantidade.toFixed(2)}</td>
                            <td>${s.unidade}</td>
                        </tr>`).join("")}
                    </tbody>
                </table>
            </div>`
            : "";

        // --- BLOCO DE IMAGEM E OBSERVAÇÃO (CORRIGIDO) ---
        // 🎯 Uso das chaves corretas: r.imagemBase64 e r.observacao (do Admin/Técnico)
        let imagemObsHTML = "";
        if (r.imagemBase64 || r.observacao) {
            imagemObsHTML = `
                <div class="mt-3 p-3 rounded border bg-light">
                    <h6 class="fw-bold text-primary mb-2"><i class="fa-solid fa-camera"></i> Anexos do Planejamento</h6>
                    ${r.imagemBase64
                    ? `<img src="${r.imagemBase64}" alt="Imagem anexada pelo Técnico" class="img-fluid rounded mb-2" style="max-width:300px;">`
                    : "<p class='text-muted fst-italic'>Nenhuma imagem anexada.</p>"}
                    
                    ${r.observacao
                    ? `<p class="mb-0 mt-2"><strong>📝 Observação do Técnico:</strong> ${r.observacao}</p>`
                    : "<p class='text-muted fst-italic'>Nenhuma observação do planejamento.</p>"}
                </div>
            `;
        }

        // --- MONTA O CARD COMPLETO ---
        card.innerHTML = `
            <h5 class="text-success fw-bold mb-2"><i class="fas fa-user"></i> Produtor: ${r.produtor}</h5>
            <p><strong>Área:</strong> ${r.areaNome} (${r.areaTamanho} ha)</p>
            <p><strong>Pulverizador:</strong> ${r.pulverizadorModelo || 'N/I'}</p>
            <p><strong>Data prevista:</strong> ${r.dataAplicacao}</p>
            <p><strong>${r.haPorTanque || ""}</strong></p>
            <p><strong>${r.tanquesInfo || ""}</strong></p>
            <h6 class="fw-bold mt-3 text-primary">Detalhamento de Produtos:</h6>
            ${produtosTabela}
            ${bombaTabela}
            ${imagemObsHTML} 
            <hr>
            <div class="no-print"> 
                <h6 class="text-danger fw-bold"><i class="fas fa-pencil"></i> Reporte de Campo</h6>
                <div class="row g-2">
                    <div class="col-md-3">
                        <label class="form-label">Data Aplicação:</label>
                        <input type="date" class="form-control campoData" data-id="${r.id}" value="${r.dataAplicacaoReal || ""}">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Temperatura (°C):</label>
                        <input type="number" class="form-control campoTemp" data-id="${r.id}" placeholder="Ex: 28" value="${r.temperatura || ""}">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Umidade (%):</label>
                        <input type="number" class="form-control campoUmidade" data-id="${r.id}" placeholder="Ex: 60" value="${r.umidade || ""}">
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Vento (km/h):</label>
                        <input type="number" class="form-control campoVento" data-id="${r.id}" placeholder="Ex: 12" value="${r.vento || ""}">
                    </div>
                </div>
                <div class="mt-3">
                    <label class="form-label">Status da Aplicação:</label>
                    <select class="form-select campoStatus" data-id="${r.id}">
                        <option value="">Selecione...</option>
                        <option value="Concluída" ${r.status === "Concluída" ? "selected" : ""}>✅ Concluída</option>
                        <option value="Em andamento" ${r.status === "Em andamento" ? "selected" : ""}>⏳ Em andamento</option>
                        <option value="Cancelada" ${r.status === "Cancelada" ? "selected" : ""}>❌ Cancelada</option>
                    </select>
                </div>
            </div>
            <div class="mt-3 text-end">
                 <button class="btn btn-sm btn-info relatorio-update-btn" data-id="${r.id}">
                    <i class="fas fa-save"></i> Salvar Campo
                 </button>
            </div>
        `;
        container.appendChild(card);
    });

    // 🎯 Adiciona listener de atualização aos novos botões gerados
    adicionarListenersDeAtualizacao();
}

/**
 * Adiciona listeners para os botões de salvar campo gerados dinamicamente.
 */
function adicionarListenersDeAtualizacao() {
    const updateButtons = document.querySelectorAll(".relatorio-update-btn");
    const responsavelInput = document.getElementById('responsavelInput');
    const responsavelNome = responsavelInput ? responsavelInput.value : "Aplicador Não Identificado";

    updateButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const sel = document.querySelector(`.campoStatus[data-id="${id}"]`);

            if (typeof BackendSimulado === "undefined" || !BackendSimulado.obterRelatorioPorId(id)) return;

            const patch = {
                status: sel.value || "",
                dataAplicacaoReal: document.querySelector(`.campoData[data-id="${id}"]`)?.value || "",
                temperatura: document.querySelector(`.campoTemp[data-id="${id}"]`)?.value || "",
                umidade: document.querySelector(`.campoUmidade[data-id="${id}"]`)?.value || "",
                vento: document.querySelector(`.campoVento[data-id="${id}"]`)?.value || "",
                responsavelAplicacao: responsavelNome // Salva quem atualizou
            };

            if (BackendSimulado.atualizarRelatorioPorId(id, patch)) {
                alert("✅ Condições de campo salvas com sucesso!");
                carregarRelatorios(null, false); // Recarrega para mostrar status atualizado
            } else {
                alert("⚠️ Erro ao salvar as alterações.");
            }
        });
    });
}

/**
 * Função principal de carregamento.
 * NOTA: Esta função foi ajustada para carregar apenas o último relatório salvo se houver um ID,
 * o que é a lógica original de Application Report View.
 */
function carregarRelatorios(filterId = null, clearFilter = true) {
    const relatoriosContainer = document.getElementById("relatoriosContainer");
    const alerta = document.getElementById("alertaSemDados");

    if (!alerta || !relatoriosContainer) return;

    const idParaBuscar = filterId || localStorage.getItem(LAST_SAVED_ID_KEY);
    let relatorios = [];

    if (idParaBuscar && typeof BackendSimulado !== "undefined" && BackendSimulado.obterRelatorioPorId) {
        const unicoRelatorio = BackendSimulado.obterRelatorioPorId(idParaBuscar);
        if (unicoRelatorio) {
            relatorios.push(unicoRelatorio);
        }
    }

    // Mantém a lógica de limpar o filtro após a primeira busca
    if (idParaBuscar && clearFilter) {
        localStorage.removeItem(LAST_SAVED_ID_KEY);
    }

    if (!relatorios || relatorios.length === 0) {
        alerta.classList.remove("d-none");
        alerta.textContent = "⚠️ Nenhum relatório novo pendente de execução.";
        relatoriosContainer.innerHTML = "";
        return;
    }

    alerta.classList.add("d-none");
    renderizarRelatorios(relatorios, relatoriosContainer);
}

// ====================================================================
// ====== DOMContentLoaded (Inicialização e Eventos) ======
// ====================================================================
document.addEventListener("DOMContentLoaded", () => {
    const btnSalvarCondicoesClimaticas = document.getElementById("salvarCondicoes");
    const logoutBtn = document.getElementById('logoutBtn');
    const responsavelInput = document.getElementById('responsavelInput');

    // Preenche o nome do responsável se o HTML já não o fez (redundância de segurança)
    if (responsavelInput && !responsavelInput.value) {
        responsavelInput.value = localStorage.getItem(window.RESPONSAVEL_NOME_KEY) || "Aplicador Não Identificado";
    }

    if (logoutBtn && typeof window.logout === 'function') {
        logoutBtn.addEventListener('click', window.logout);
    }

    // Carrega relatórios na inicialização
    carregarRelatorios(localStorage.getItem(LAST_SAVED_ID_KEY));

    // A lógica original do botão "Salvar Condições" foi movida para o DOMContentLoaded do usuario.html
    // Mas vamos manter a chamada para a função de salvar clima (se ela ainda existir) e a lógica de atualização dos campos de campo
    if (btnSalvarCondicoesClimaticas) {
        // Remove o antigo listener (se houver) e foca na atualização dos campos de campo do relatório
        btnSalvarCondicoesClimaticas.addEventListener("click", () => {
            alert("A função 'Salvar Condições de Campo' agora salva apenas os dados de clima no localStorage. Use os botões 'Salvar Campo' em cada relatório para atualizar status e dados de aplicação.");
        });
    }

    // Listener para detectar novos relatórios de outras páginas
    window.addEventListener("storage", (event) => {
        if (event.key === LAST_SAVED_ID_KEY && event.newValue) {
            const newFilterId = event.newValue;
            console.log(`📢 Novo relatório detectado. ID: ${newFilterId}`);
            // Carrega o novo relatório. clearFilter=true garante que o ID seja removido depois.
            carregarRelatorios(newFilterId);
        } else if (event.key === MAIN_STORAGE_KEY) {
            // Recarrega se a lista principal for alterada (ex: Admin atualizou um relatório)
            carregarRelatorios(null, false);
        }
    });
});