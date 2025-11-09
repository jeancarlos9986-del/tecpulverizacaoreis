// relatorio-produtor-logic.js

document.addEventListener("DOMContentLoaded", () => {
    // 1. Acessa os dados globais e as chaves
    const produtoresData = window.produtoresData || [];
    const RESPONSAVEL_NOME_KEY = 'responsavelNome'; // Chave para o nome do usuário logado

    // 2. Obtém os elementos DOM
    const produtorFilterSelect = document.getElementById('produtorFilterSelect');
    const totalReportsCount = document.getElementById('totalReportsCount');
    const contentArea = document.getElementById('content-area');
    const progressoGeralDiv = document.getElementById('progressoGeralInfo');
    const responsavelInput = document.getElementById('responsavelInput'); // Novo elemento


    // ====================================================================
    // ====== LÓGICA DE PREENCHIMENTO DO RESPONSÁVEL TÉCNICO (NOVO) ======
    // ====================================================================

    /**
     * Preenche o campo Responsável Técnico com o nome do usuário logado.
     */
    function preencherResponsavelTecnico() {
        const responsavelNome = localStorage.getItem(RESPONSAVEL_NOME_KEY);

        if (responsavelInput) {
            if (responsavelNome) {
                responsavelInput.value = responsavelNome;
            } else {
                responsavelInput.value = "Usuário não identificado. Faça login.";
                responsavelInput.classList.add('is-invalid');
            }
        }
    }

    // ====================================================================
    // ====== FUNÇÕES AUXILIARES DE RENDERIZAÇÃO E FORMATAÇÃO ======
    // ====================================================================

    /**
     * Retorna o Badge de status formatado (Consistente com visualizar-relatorio.js).
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
     * Calcula e renderiza o progresso geral da área total do produtor.
     * @param {string} nomeProdutor - O nome do produtor selecionado.
     */
    function renderProgressoGeral(nomeProdutor) {
        if (!window.BackendSimulado || !window.BackendSimulado.calcularProgressoGeralProdutor) {
            progressoGeralDiv.innerHTML = `<p class="text-danger">Erro: Módulo de progresso geral não carregado.</p>`;
            return;
        }

        const { areaTotal, areaConcluida, progressoGeral } = window.BackendSimulado.calcularProgressoGeralProdutor(nomeProdutor);

        // Define a cor da barra de progresso com base no valor
        let progressClass = 'bg-info';
        if (progressoGeral >= 90) progressClass = 'bg-success';
        else if (progressoGeral >= 50) progressClass = 'bg-warning text-dark';


        progressoGeralDiv.innerHTML = `
            <h5 class="card-title mb-3">Progresso Total da Aplicação</h5>
            <p class="mb-1"><strong>Total de Áreas:</strong> ${areaTotal} ha</p>
            <p class="mb-3"><strong>Áreas Concluídas/Parciais:</strong> ${areaConcluida} ha</p>

            <div class="progress" style="height: 20px;">
                <div class="progress-bar ${progressClass}" role="progressbar" style="width: ${progressoGeral}%;" aria-valuenow="${progressoGeral}" aria-valuemin="0" aria-valuemax="100">
                    ${progressoGeral}% da Área Total
                </div>
            </div>
            <p class="small text-muted mt-2">O progresso é calculado com base nas áreas concluídas/em andamento.</p>
        `;
    }

    /**
     * Renderiza o card de Clima, usando o Backend Simulado.
     * @param {string} dataAplicacao Data no formato YYYY-MM-DD.
     */
    function renderClimaCard(dataAplicacao) {
        const climaInfoContent = document.getElementById('climaInfoContent');

        if (!dataAplicacao) {
            climaInfoContent.innerHTML = `<p class="text-muted fst-italic">Selecione um relatório para ver a previsão climática.</p>`;
            return;
        }

        if (!window.BackendSimulado || !window.BackendSimulado.obterDadosClimaticos) {
            climaInfoContent.innerHTML = `<p class="text-danger">Erro: Módulo de simulação de clima não carregado.</p>`;
            return;
        }

        // Chama a função do Backend com a data do relatório (YYYY-MM-DD)
        const clima = window.BackendSimulado.obterDadosClimaticos(dataAplicacao);

        // Formata a data de YYYY-MM-DD para DD/MM/AAAA para exibição
        const dataFormatada = new Date(dataAplicacao + 'T00:00:00').toLocaleDateString('pt-BR');

        // Define a classe da recomendação
        let icon = '✅';
        let recomendacaoClass = 'text-success';
        if (clima.recomendacao === 'Boa') { recomendacaoClass = 'text-info'; icon = '👍'; }
        else if (clima.recomendacao === 'Atenção') { recomendacaoClass = 'text-warning'; icon = '⚠️'; }
        else if (clima.recomendacao === 'Ruim') { recomendacaoClass = 'text-danger'; icon = '❌'; }


        climaInfoContent.innerHTML = `
            <div class="d-flex align-items-center mb-2">
                <i class="fas fa-cloud-sun fa-2x text-warning me-3"></i>
                <div>
                    <p class="mb-0"><strong>Data Prevista:</strong> ${dataFormatada}</p>
                    <p class="mb-0"><strong>Condição:</strong> ${clima.condicao}</p>
                </div>
            </div>
            <hr class="my-2">
            <p class="mb-0 small">🌡️ Temp: ${clima.temperatura}°C | 💧 Umid: ${clima.umidade}% | 💨 Vento: ${clima.vento} km/h</p>
            <p class="mb-0 mt-1 fw-bold ${recomendacaoClass}">
                ${icon} Recomendação: ${clima.recomendacao} para Aplicação
            </p>
        `;
    }

    // Função Principal para renderizar a tabela de relatórios
    function renderRelatoriosTable(relatorios) {
        const tbody = document.getElementById('relatoriosTableBody');
        const noReportsMessage = document.getElementById('noReportsMessage');
        tbody.innerHTML = ''; // Limpa a tabela

        if (relatorios.length === 0) {
            noReportsMessage.classList.remove('d-none');
            totalReportsCount.textContent = `0 relatórios encontrados.`;
            renderClimaCard('');
            return;
        }

        noReportsMessage.classList.add('d-none');
        totalReportsCount.textContent = `${relatorios.length} relatórios encontrados.`;

        // Ordena os relatórios pela data prevista (mais recente primeiro)
        relatorios.sort((a, b) => new Date(b.dataAplicacao) - new Date(a.dataAplicacao));

        relatorios.forEach(rel => {
            const row = tbody.insertRow();

            // Tratamento do ID para mostrar apenas a parte numérica (ex: r_1700..._123 -> 123)
            const displayId = rel.id.split('_').pop();
            const pulverizadorNome = rel.pulverizadorModelo || 'N/A';
            // Formata a data (de YYYY-MM-DD para DD/MM/AAAA)
            const dataFormatada = new Date(rel.dataAplicacao + 'T00:00:00').toLocaleDateString('pt-BR');

            row.innerHTML = `
                <td>#${displayId}</td>
                <td>${rel.areaNome} (${rel.areaTamanho} ha)</td>
                <td>${pulverizadorNome}</td> 
                <td>${dataFormatada}</td>
                <td>${getStatusBadge(rel.status)}</td>
                <td>
                    <a href="visualizar-relatorio.html?id=${rel.id}" class="btn btn-sm btn-info text-white view-btn">
                        <i class="fas fa-eye"></i> Ver
                    </a>
                    <button class="btn btn-sm btn-danger delete-btn" data-id="${rel.id}" title="Excluir Relatório">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;

            // Adiciona listener para o botão "Ver" para atualizar apenas o card de clima (o link acima já navega)
            row.querySelector('.view-btn').addEventListener('click', (e) => {
                const relatorioId = rel.id;
                // Busca o relatório novamente para garantir que a data do clima é a correta
                const relatorioCompleto = window.BackendSimulado.obterRelatorioPorId(relatorioId);
                if (relatorioCompleto) {
                    renderClimaCard(relatorioCompleto.dataAplicacao);
                }
            });

            // Adiciona listener para o botão "Excluir"
            row.querySelector('.delete-btn').addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (confirm(`Tem certeza que deseja excluir o relatório #${id.split('_').pop()}?`)) {
                    if (window.BackendSimulado && window.BackendSimulado.excluirRelatorio) {
                        window.BackendSimulado.excluirRelatorio(id);
                        // Recarrega a tabela e o progresso geral
                        // Nota: Dispara o evento change para re-filtrar e renderizar
                        produtorFilterSelect.dispatchEvent(new Event('change'));
                    } else {
                        console.error("BackendSimulado.excluirRelatorio não encontrado.");
                    }
                }
            });
        });

        // Exibe o primeiro relatório por padrão no card de clima (o mais recente)
        if (relatorios.length > 0) {
            renderClimaCard(relatorios[0].dataAplicacao);
        }
    }

    // 3. PREENCHE O DROPDOWN DE PRODUTORES
    if (produtoresData.length > 0) {
        // Ordena os produtores por nome
        produtoresData.sort((a, b) => a.nome.localeCompare(b.nome));

        produtoresData.forEach(p => {
            const option = document.createElement('option');
            option.value = p.nome;
            option.textContent = p.nome;
            produtorFilterSelect.appendChild(option);
        });
    } else {
        console.error("ERRO CRÍTICO: produtoresData está vazio. Verifique script.js e a ordem de carregamento.");
        produtorFilterSelect.innerHTML = '<option selected disabled>Erro ao carregar produtores</option>';
    }

    // 4. LISTENERS
    produtorFilterSelect.addEventListener('change', (e) => {
        const nomeProdutor = e.target.value;

        if (nomeProdutor) {
            contentArea.classList.remove('d-none');
            const responsavelInput = document.getElementById('responsavelInput'); // Novo elemento


            // ====================================================================
            // ====== LÓGICA DE PREENCHIMENTO DO RESPONSÁVEL TÉCNICO (NOVO) ======
            // ====================================================================

            /**
             * Preenche o campo Responsável Técnico com o nome do usuário logado.
             */
            function preencherResponsavelTecnico() {
                const responsavelNome = localStorage.getItem(RESPONSAVEL_NOME_KEY);

                if (responsavelInput) {
                    if (responsavelNome) {
                        responsavelInput.value = responsavelNome;
                    } else {
                        responsavelInput.value = "Usuário não identificado. Faça login.";
                        responsavelInput.classList.add('is-invalid');
                    }
                }
            }


            // 1. Renderiza o progresso GERAL do produtor
            renderProgressoGeral(nomeProdutor);

            // 2. Busca e Renderiza os Relatórios
            if (window.BackendSimulado && window.BackendSimulado.listarRelatoriosPorProdutor) {
                const relatorios = window.BackendSimulado.listarRelatoriosPorProdutor(nomeProdutor);
                renderRelatoriosTable(relatorios);
            } else {
                console.error("BackendSimulado.listarRelatoriosPorProdutor não encontrado.");
                totalReportsCount.textContent = "Erro: Módulo de dados não carregado.";
            }
        } else {
            contentArea.classList.add('d-none');
            totalReportsCount.textContent = "Nenhum produtor selecionado.";
            progressoGeralDiv.innerHTML = `<p class="text-muted fst-italic">Selecione um produtor para ver o progresso.</p>`;
            renderClimaCard(''); // Limpa o card de clima
        }
    });

    // 5. INICIALIZAÇÃO
    preencherResponsavelTecnico(); // Preenche o nome do técnico logo no carregamento
    renderClimaCard(''); // Limpa o card de clima ao carregar a página
});