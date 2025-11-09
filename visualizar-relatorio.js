// ====================================================================
// ====== FUNÇÕES AUXILIARES DE RENDERIZAÇÃO E FORMATAÇÃO ======
// ====================================================================

// Chave para obter o nome do responsável logado
const RESPONSAVEL_NOME_KEY = "responsavelNome";

/**
 * Retorna o Badge de status formatado (igual ao relatorio-produtor-logic.js para consistência).
 * @param {string} status Status do relatório.
 * @returns {string} HTML do badge.
 */
function getStatusBadge(status) {
    let badgeClass = 'bg-secondary';
    let icon = '❓';

    switch (status) {
        case 'Concluída':
            badgeClass = 'bg-success';
            icon = '✅';
            break;
        case 'Em andamento':
            badgeClass = 'bg-warning text-dark';
            icon = '⏳';
            break;
        case 'Pendente':
            badgeClass = 'bg-info';
            icon = '📅';
            break;
        case 'Cancelada':
            badgeClass = 'bg-danger';
            icon = '❌';
            break;
    }
    return `<span class="badge ${badgeClass} status-badge">${icon} ${status}</span>`;
}

/**
 * Formata strings de data ISO para o formato local (DD/MM/AAAA HH:mm:ss).
 * @param {string} isoString Data em formato ISO.
 * @returns {string} Data formatada ou string vazia.
 */
function formatarData(isoString) {
    if (!isoString) return '';
    try {
        // Verifica se a string já está em formato DD/MM/AAAA (seu formato persistente)
        if (isoString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
            // Se for apenas data (DD/MM/AAAA), retorna sem hora
            return isoString;
        }

        return new Date(isoString).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
    } catch {
        return '';
    }
}

/**
 * Preenche o DOM com os dados do relatório.
 * @param {object} relatorio Objeto do relatório.
 */
function renderizarRelatorio(relatorio) {
    document.getElementById('loadingMessage').classList.add('d-none');
    document.getElementById('relatorioContent').classList.remove('d-none');

    // Cabeçalho
    document.getElementById('reportIdDisplay').textContent = `#${relatorio.id.split('_')[1]}`;
    document.title = `Detalhes do Relatório | #${relatorio.id.split('_')[1]}`;

    // Detalhes Gerais
    document.getElementById('produtorNome').textContent = relatorio.produtor;
    document.getElementById('areaNome').textContent = relatorio.areaNome;
    document.getElementById('areaTamanho').textContent = relatorio.areaTamanho;
    document.getElementById('dataPrevista').textContent = relatorio.dataPrevista;
    document.getElementById('pulverizadorModelo').textContent = relatorio.pulverizadorModelo || 'N/A';
    document.getElementById('pulverizadorCapacidade').textContent = relatorio.pulverizadorCapacidade || 'N/A';
    document.getElementById('vazaoLha').textContent = relatorio.vazaoLha || 'N/A';

    // NOVO: Exibe o responsável salvo no relatório (se houver) ou o logado
    // Prioriza o nome salvo no relatório, se existir (para rastreabilidade)
    const responsavelDoRelatorio = relatorio.responsavelAplicacao || localStorage.getItem(RESPONSAVEL_NOME_KEY) || 'Não informado';
    document.getElementById('aplicadorResponsavel').textContent = responsavelDoRelatorio;


    // Formulário de Atualização
    document.getElementById('selectStatus').value = relatorio.status || 'Pendente';
    if (relatorio.dataAplicacaoReal) {
        // Converte DD/MM/AAAA para YYYY-MM-DD para o input type="date"
        const [day, month, year] = relatorio.dataAplicacaoReal.split('/');
        document.getElementById('dataAplicacaoRealInput').value = `${year}-${month}-${day}`;
    }

    // Resultados do Cálculo
    document.getElementById('haPorTanqueDisplay').textContent = relatorio.haPorTanque;
    document.getElementById('tanquesInfoDisplay').textContent = relatorio.tanquesInfo;

    const produtosBody = document.getElementById('produtosResultadoTableBody');
    produtosBody.innerHTML = '';

    if (relatorio.resultados && relatorio.resultados.length > 0) {
        relatorio.resultados.forEach(res => {
            const dosagem = relatorio.produtos.find(p => p.nome === res.produto)?.dosagem || 'N/A';
            const row = produtosBody.insertRow();
            row.innerHTML = `
                <td>${res.produto}</td>
                <td>${dosagem} ${res.unidade || 'L/kg'} por ha</td>
                <td>${res.porTanque.toFixed(2)} ${res.unidade || 'L/kg'}</td>
                <td><strong>${res.totalArea.toFixed(2)} ${res.unidade || 'L/kg'}</strong></td>
            `;
        });
    } else {
        produtosBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Resultados de cálculo não disponíveis.</td></tr>';
    }

    // Sobressalente
    const sobressalenteSection = document.getElementById('sobressalenteSection');
    const sobressalenteArea = document.getElementById('sobressalenteArea');
    const sobressalenteProdutosList = document.getElementById('sobressalenteProdutosList');

    if (relatorio.sobressalente && relatorio.sobressalente.length > 0) {
        sobressalenteSection.classList.remove('d-none');

        // Extrai a área sobressalente do texto do sobressalenteHTML
        const areaMatch = relatorio.sobressalenteHTML?.match(/🌾 Área sobressalente:\s*([\d.,]+)\s*ha/);
        sobressalenteArea.innerHTML = `
            <p class="fw-bold mb-1">Área remanescente para aplicação:</p>
            <p class="text-info">${areaMatch ? areaMatch[1] : 'N/A'} ha</p>
            <p class="fw-bold">Produtos Adicionais Necessários:</p>
        `;

        sobressalenteProdutosList.innerHTML = '';
        relatorio.sobressalente.forEach(item => {
            sobressalenteProdutosList.innerHTML += `
                <li><i class="fas fa-hand-point-right text-warning"></i> ${item.produto}: <strong>${item.quantidade.toFixed(2)} ${item.unidade}</strong></li>
            `;
        });
    } else {
        sobressalenteSection.classList.add('d-none');
    }

    // Datas de Log
    document.getElementById('_geradoEm').textContent = formatarData(relatorio._salvoEm);
    document.getElementById('_atualizadoEm').textContent = formatarData(relatorio._atualizadoEm || relatorio._salvoEm);
}


// ====================================================================
// ====== LÓGICA PRINCIPAL ======
// ====================================================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Obtém o ID da URL
    const params = new URLSearchParams(window.location.search);
    const relatorioId = params.get('id');

    const relatorioContent = document.getElementById('relatorioContent');
    const errorMessage = document.getElementById('errorMessage');

    if (!relatorioId) {
        document.getElementById('loadingMessage').classList.add('d-none');
        errorMessage.textContent = 'Erro: ID do relatório não fornecido na URL.';
        errorMessage.classList.remove('d-none');
        return;
    }

    // 2. Busca o relatório no Backend Simulado
    const relatorio = BackendSimulado.obterRelatorioPorId(relatorioId);

    if (!relatorio) {
        document.getElementById('loadingMessage').classList.add('d-none');
        errorMessage.textContent = `Relatório com ID "${relatorioId}" não foi encontrado.`;
        errorMessage.classList.remove('d-none');
        return;
    }

    // 3. Renderiza os dados
    renderizarRelatorio(relatorio);

    // 4. Configura o Listener do Formulário de Atualização
    document.getElementById('statusUpdateForm').addEventListener('submit', function (e) {
        e.preventDefault();

        const selectStatus = document.getElementById('selectStatus').value;
        const dataAplicacaoReal = document.getElementById('dataAplicacaoRealInput').value;
        const updateMessage = document.getElementById('updateMessage');

        // NOVO: Obtém o nome do usuário logado e a data/hora atual
        const nomeResponsavel = localStorage.getItem(RESPONSAVEL_NOME_KEY);
        const dataHoraAtual = new Date().toISOString();

        let patch = {
            status: selectStatus,
            dataAplicacaoReal: null, // Limpa se não for preenchido
            responsavelAplicacao: nomeResponsavel || relatorio.responsavelAplicacao, // Salva o nome do logado
            _atualizadoEm: dataHoraAtual, // Atualiza o timestamp de log
        };

        if (dataAplicacaoReal) {
            // Converte YYYY-MM-DD para DD/MM/AAAA para salvar no formato persistente
            const [year, month, day] = dataAplicacaoReal.split('-');
            patch.dataAplicacaoReal = `${day}/${month}/${year}`;
        }

        // Se o status mudou para Concluída, a data real deve ser a de hoje se não foi preenchida
        if (selectStatus === 'Concluída' && !patch.dataAplicacaoReal) {
            const today = new Date();
            const day = String(today.getDate()).padStart(2, '0');
            const month = String(today.getMonth() + 1).padStart(2, '0'); // Mês é 0-baseado
            const year = today.getFullYear();
            patch.dataAplicacaoReal = `${day}/${month}/${year}`;
        }


        // Atualiza no Backend
        const relatorioAtualizado = BackendSimulado.atualizarRelatorioPorId(relatorioId, patch);

        if (relatorioAtualizado) {
            // Atualiza a visualização com os novos dados
            renderizarRelatorio(relatorioAtualizado);

            updateMessage.textContent = 'Status atualizado com sucesso!';
            updateMessage.classList.remove('d-none', 'text-danger');
            updateMessage.classList.add('text-success');

            setTimeout(() => updateMessage.classList.add('d-none'), 3000);
        } else {
            updateMessage.textContent = 'Erro ao salvar a atualização.';
            updateMessage.classList.remove('d-none', 'text-success');
            updateMessage.classList.add('text-danger');
        }
    });

});