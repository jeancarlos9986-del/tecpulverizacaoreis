/*
    backend-simulado.js — versão limpa e sincronizada (v2.3.2)
    🔹 Simula um backend real usando localStorage
    🔹 NOVO: Suporte para campos 'observacao' e 'imagemBase64' no relatório.
*/

(function () {
    const STORAGE_KEY = "relatorios_simulados_v2";
    const VERSION_KEY = "backend_version";
    // 🚨 CHAVE CRÍTICA: Usada pelo usuario.js para filtrar o último relatório.
    const LAST_SAVED_ID_KEY = "last_saved_report_id";

    // 🧹 Remove dados antigos e versões anteriores
    const oldKeys = [
        "relatoriosPulverizacao",
        "relatorios_simulados_v1",
        "relatorios_simulados",
    ];
    oldKeys.forEach(k => localStorage.removeItem(k));

    // ⚙️ Versão atual — força reset se for nova
    const CURRENT_VERSION = "v2.3.2"; // ⬆️ Versão atualizada para forçar reset e inclusão dos novos campos.
    const lastVersion = localStorage.getItem(VERSION_KEY);
    if (lastVersion !== CURRENT_VERSION) {
        console.log("🧩 Nova versão do backend detectada — limpando dados antigos...");
        localStorage.removeItem(STORAGE_KEY);
        // Não apagar a chave de usuário, pois ela é necessária para o login simulado
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    }

    // 🔹 Usuários fictícios (sem login real)
    const usuariosFicticios = [
        { nome: "Jean", produtores: ["Carlos Souza"] },
        { nome: "Mariana", produtores: ["João Silva"] },
        { nome: "Paulo", produtores: ["Maria Oliveira"] },
        { nome: "Ana", produtores: ["Agropecuária Horizonte"] }
    ];

    // 🔹 Leitura segura
    function _read() {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            return Array.isArray(data) ? data : [];
        } catch {
            console.warn("⚠️ Dados corrompidos no localStorage — limpando...");
            localStorage.removeItem(STORAGE_KEY);
            return [];
        }
    }

    // 🔹 Escrita segura
    function _write(list) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    // ====================================================================
    // ====== FUNÇÕES DE SIMULAÇÃO (STATUS e CLIMA) ======
    // ====================================================================

    /**
     * Simula a obtenção do status de pulverização em campo.
     * @param {string} areaNome Nome da área.
     * @param {string} [currentStatus] Status já salvo no relatório.
     * @returns {{ status: 'Em andamento' | 'Concluída' | 'Pendente', progressoReal: number }}
     */
    function obterStatusPulverizacao(areaNome, currentStatus) {
        let status = currentStatus || 'Pendente'; // Usa o status salvo como base
        let progressoReal = 0;

        // Se já está CONCLUÍDA no dado salvo, mantém 100% e CONCLUÍDA
        if (status === 'Concluída') {
            progressoReal = 100;
            return { status, progressoReal: progressoReal };
        }

        // Lógica de Simulação para status Pendente/Em Andamento:
        if (areaNome.toLowerCase().includes('jatobá') || areaNome.toLowerCase().includes('horizonte')) {
            status = 'Em andamento';
            progressoReal = 50 + (Math.floor(Math.random() * 40)); // Entre 50% e 90%
        } else if (areaNome.toLowerCase().includes('primavera') || areaNome.toLowerCase().includes('são jorge')) {
            // Se o relatório original não marcou como concluída, simulamos que está quase lá.
            status = 'Em andamento';
            progressoReal = 90 + (Math.floor(Math.random() * 9)); // Entre 90% e 99%
        } else {
            // Demais áreas, simula como Pendente ou com pouco progresso
            status = 'Pendente';
            progressoReal = Math.floor(Math.random() * 20); // Entre 0% e 20%
        }

        // Se o status salvo for Pendente e a simulação indicar progresso, atualiza para Em andamento
        if (status === 'Pendente' && progressoReal > 20) {
            status = 'Em andamento';
        }

        return { status, progressoReal: progressoReal };
    }

    /**
     * Simula a obtenção de dados climáticos para um dia específico.
     */
    function obterDadosClimaticos(dataString) {
        // Assume dataString está em YYYY-MM-DD para criar um objeto Date
        const dataObj = new Date(dataString + 'T00:00:00');
        const hash = dataObj.getDate() + dataObj.getMonth();
        const base = hash % 5; // Variação de 0 a 4

        const temperatura = 25 + base; // 25°C a 29°C
        const umidade = 60 - base * 2; // 52% a 60%
        const vento = 8 + base; // 8 km/h a 12 km/h
        let recomendacao;
        let condicao;

        if (umidade >= 55 && vento <= 12 && temperatura <= 30) {
            recomendacao = 'Ótima';
            condicao = 'Céu limpo e estável';
        } else if (umidade >= 45 && vento <= 15) {
            recomendacao = 'Boa';
            condicao = 'Parcialmente nublado';
        } else if (vento > 15 || umidade < 40) {
            recomendacao = 'Atenção';
            condicao = 'Ventos fortes ou baixa umidade';
        } else {
            recomendacao = 'Ruim';
            condicao = 'Chuvas ou condições extremas';
        }

        return {
            temperatura: temperatura.toFixed(1),
            umidade: umidade.toFixed(1),
            vento: vento.toFixed(1),
            condicao,
            recomendacao,
        };
    }

    // ====================================================================
    // ====== FUNÇÕES DE PERSISTÊNCIA E FILTRO (AJUSTADAS) ======
    // ====================================================================

    /**
     * Mapeia um relatório adicionando o status de simulação, respeitando o status salvo.
     */
    function _mapRelatorioComStatus(rel) {
        // Passa o status salvo (rel.status) para a função de simulação
        const statusSimulado = obterStatusPulverizacao(rel.areaNome, rel.status);

        return {
            ...rel,
            // Prioriza o status salvo se ele for 'Concluída', caso contrário usa o simulado
            status: rel.status === 'Concluída' ? 'Concluída' : statusSimulado.status,
            progressoReal: rel.status === 'Concluída' ? 100 : statusSimulado.progressoReal
        };
    }

    // 🔹 Listar relatórios (Usa o novo mapper)
    function listarRelatorios() {
        return _read().map(_mapRelatorioComStatus);
    }

    // 🔹 Filtrar por produtor (Usa o novo mapper)
    function listarRelatoriosPorProdutor(produtor) {
        return _read()
            .filter(r => r.produtor === produtor)
            .map(_mapRelatorioComStatus);
    }

    // 🔹 Adicionar ou atualizar relatório
    function adicionarRelatorio(relatorio) {
        const lista = _read();
        let idRetorno = null;

        // Tenta encontrar um relatório existente para a mesma área
        const existente = lista.find(
            r =>
                r.produtor === relatorio.produtor &&
                r.areaNome === relatorio.areaNome
        );

        // Se o status não for fornecido pelo formulário, define como Pendente
        if (!relatorio.status) {
            relatorio.status = 'Pendente';
        }

        if (existente) {
            const idx = lista.indexOf(existente);

            lista[idx] = {
                ...existente,
                ...relatorio,
                id: existente.id,
                _atualizadoEm: new Date().toISOString(),
                responsavelAplicacao: relatorio.responsavelAplicacao || existente.responsavelAplicacao || null,
                // Os campos 'observacao' e 'imagemBase64' são atualizados pelo spread '...relatorio'
            };
            idRetorno = existente.id;
            console.log(`♻️ Relatório atualizado: ${relatorio.produtor} - ${relatorio.areaNome}`);
        } else {
            relatorio.id = `r_${Date.now()}_${Math.floor(Math.random() * 9999)}`;
            idRetorno = relatorio.id;
            relatorio._salvoEm = new Date().toISOString();

            // Garante que todos os novos campos existam, mesmo que null/vazio no momento da criação
            relatorio.responsavelAplicacao = relatorio.responsavelAplicacao || null;
            relatorio.observacao = relatorio.observacao || "";       // 🎯 Novo Campo Inicializado
            relatorio.imagemBase64 = relatorio.imagemBase64 || "";   // 🎯 Novo Campo Inicializado

            lista.push(relatorio);
            console.log(`✅ Novo relatório salvo: ${relatorio.produtor} - ${relatorio.areaNome}`);
        }

        _write(lista);

        // 🏆 CRÍTICO: Sinaliza o ID do último relatório salvo para o usuario.js.
        localStorage.setItem(LAST_SAVED_ID_KEY, idRetorno);

        // 🔔 Emite evento (opcional)
        window.dispatchEvent(
            new StorageEvent("storage", { key: STORAGE_KEY, newValue: Date.now().toString() })
        );

        return idRetorno;
    }

    // 🔹 Obter por ID
    function obterRelatorioPorId(id) {
        // Usa o mapper para garantir que o relatório retornado inclua progresso simulado
        const rel = _read().find(r => r.id === id) || null;
        return rel ? _mapRelatorioComStatus(rel) : null;
    }

    // 🔹 Atualizar um relatório por ID (condições do usuário)
    function atualizarRelatorioPorId(id, patch) {
        const lista = _read();
        const idx = lista.findIndex(r => r.id === id);
        if (idx === -1) return null;

        lista[idx] = {
            ...lista[idx],
            ...patch, // Isso aceitará 'responsavelAplicacao', 'observacao' e 'imagemBase64' do patch
            _atualizadoEm: new Date().toISOString(),
        };

        _write(lista);
        // Retorna o objeto mapeado para ter o status de campo simulado
        return _mapRelatorioComStatus(lista[idx]);
    }

    // 🔹 Listar usuários (simulados)
    function listarUsuarios() {
        return usuariosFicticios.slice();
    }

    // 🔹 Captura dados diretamente do index.html
    function montarRelatorioAPartirDoDOM() {
        try {
            // Requisita o produtor do script.js
            const produtor = window.produtorSelecionado?.nome || document.getElementById("produtorSelect")?.value || "Produtor não informado";

            const areaNome = window.areaSelecionada?.nome || localStorage.getItem("areaSelecionadaNome") || "";
            // Tenta obter o tamanho da área do objeto global areaSelecionada do script.js
            const areaTamanho = window.areaSelecionada?.tamanho || parseFloat(localStorage.getItem("areaSelecionadaTamanho")) || 0;

            const dataPrevistaElement = document.getElementById("dataAplicacao");
            const dataAplicacao = dataPrevistaElement?.value || ''; // Mantém no formato YYYY-MM-DD para facilitar cálculos

            // ⭐️ NOVO: Captura o valor do select do pulverizador
            const pulverizadorModelo = document.getElementById("pulverizadorSelect")?.value || "";

            // 🎯 CAPTURA DOS NOVOS CAMPOS DO INDEX.HTML
            const observacao = document.getElementById("observacaoTecnico")?.value || "";
            // Assumimos que o input escondido ou campo de texto onde a imagem Base64 foi salva tem este ID:
            const imagemBase64 = document.getElementById("imagemBase64Data")?.value || "";


            const haPorTanque = document.getElementById("haPorTanqueInfo")?.innerText || "";
            const tanquesInfo = document.getElementById("tanquesInfo")?.innerText || "";
            const resultadoHTML = document.getElementById("resultadoInfo")?.innerHTML || "";
            const sobressalenteHTML = document.getElementById("sobressalenteConteudo")?.innerHTML || "";

            const produtos = [];
            document.querySelectorAll(".produto-item").forEach(item => {
                const nome = item.querySelector("label")?.textContent?.trim() || "";
                const dosagem = parseFloat(item.querySelector(".dosagemInput")?.value || "0") || 0;
                // ... (restante da captura de produtos)
                if (nome && dosagem > 0) produtos.push({ nome, dosagem, unidadeDosagem: item.querySelector(".unidadeDosagem")?.value || "" });
            });

            // ... (restante da captura de resultados e sobressalente)
            const resultados = [];
            resultadoHTML
                .replace(/<\/?strong>/g, "")
                .split("<br>")
                .map(l => l.replace(/<[^>]*>/g, "").trim())
                .filter(Boolean)
                .forEach(line => {
                    if (line.startsWith("🧪")) {
                        const m = line.match(
                            /🧪\s*(.+?):\s*([\d.,]+)\s*(\w+)?\s*por tanque\s*→\s*([\d.,]+)\s*(\w+)?/i
                        );
                        if (m) {
                            resultados.push({
                                produto: m[1].trim(),
                                porTanque: parseFloat(m[2].replace(",", ".")),
                                unidade: m[3] || "",
                                totalArea: parseFloat(m[4].replace(",", ".")),
                            });
                        }
                    }
                });

            const sobressalente = [];
            sobressalenteHTML
                .replace(/<\/?strong>/g, "")
                .split("<br>")
                .map(l => l.replace(/<[^>]*>/g, "").trim())
                .filter(Boolean)
                .forEach(line => {
                    const m = line.match(/•\s*(.+?):\s*([\d.,]+)\s*(\w+)/);
                    if (m) {
                        sobressalente.push({
                            produto: m[1].trim(),
                            quantidade: parseFloat(m[2].replace(",", ".")),
                            unidade: m[3] || "",
                        });
                    }
                });


            return {
                produtor,
                areaNome,
                areaTamanho,
                dataAplicacao,
                // ⭐️ INCLUSÃO NO OBJETO DE RELATÓRIO
                pulverizadorModelo,
                haPorTanque,
                tanquesInfo,
                produtos,
                resultados,
                sobressalente,
                // 🎯 INCLUSÃO DOS NOVOS CAMPOS
                observacao,
                imagemBase64,
                _geradoEm: new Date().toISOString(),
                status: 'Pendente', // Status inicial
                responsavelAplicacao: null, // Novo campo inicializado como null
            };
        } catch (err) {
            console.error("⚠️ Erro ao montar relatório:", err);
            return null;
        }
    }


    // ====================================================================
    // ====== FUNÇÃO DE CÁLCULO GERAL ======
    // ====================================================================

    /**
     * Calcula o progresso total de aplicação de um produtor.
     */
    function calcularProgressoGeralProdutor(nomeProdutor) {
        // Assume que 'window.produtoresData' foi carregado pelo script.js
        const produtoresData = window.produtoresData || [];
        const produtor = produtoresData.find(p => p.nome === nomeProdutor);

        if (!produtor) {
            return { areaTotal: 0, areaConcluida: 0, progressoGeral: "0" };
        }

        // 1. Calcula a área total de todas as áreas do produtor
        const areaTotal = produtor.areas.reduce((total, area) => total + area.tamanho, 0);

        // 2. Obtém os relatórios do produtor, que já incluem o status simulado e progresso
        const relatoriosDoProdutor = listarRelatoriosPorProdutor(nomeProdutor);

        // 3. Soma as áreas concluídas/parciais
        let areaConcluida = 0;
        relatoriosDoProdutor.forEach(rel => {
            // Usa o progressoReal que foi calculado e adicionado pelo _mapRelatorioComStatus
            const progresso = rel.progressoReal || 0;
            areaConcluida += rel.areaTamanho * (progresso / 100);
        });

        // 4. Calcula o progresso geral
        const progressoGeral = areaTotal > 0 ? (areaConcluida / areaTotal) * 100 : 0;

        return {
            areaTotal: areaTotal.toFixed(0),
            areaConcluida: areaConcluida.toFixed(1),
            progressoGeral: progressoGeral.toFixed(0)
        };
    }


    // 🔹 API pública (Incluindo as novas funções)
    window.BackendSimulado = {
        listarRelatorios,
        listarRelatoriosPorProdutor,
        obterRelatorioPorId,
        adicionarRelatorio,
        excluirRelatorio: (id) => { // Adicionando a função de exclusão
            const lista = _read().filter(r => r.id !== id);
            _write(lista);
            console.log(`🗑️ Relatório ID ${id} excluído.`);
            window.dispatchEvent(
                new StorageEvent("storage", { key: STORAGE_KEY, newValue: Date.now().toString() })
            );
        },
        atualizarRelatorioPorId,
        listarUsuarios,
        montarRelatorioAPartirDoDOM,
        // Endpoints simulados de status/clima
        obterStatusPulverizacao,
        obterDadosClimaticos,
        // Novo endpoint de progresso geral
        calcularProgressoGeralProdutor,
    };

    // 🧠 Inicialização
    document.addEventListener("DOMContentLoaded", () => {
        if (!localStorage.getItem(STORAGE_KEY)) localStorage.setItem(STORAGE_KEY, "[]");
        console.log("🧠 Backend simulado pronto (versão " + CURRENT_VERSION + ")");
    });
})();