// exportPDF.js — CORREÇÃO FINAL COM EXCLUSÃO DA SEÇÃO 'no-print'

window.addEventListener("load", async () => {
    // 1. Prioriza o ID do botão do Aplicador (exportPdfBtn)
    const exportBtn = document.getElementById("exportPdfBtn") || document.getElementById("exportarPDF");

    if (!exportBtn) return console.warn("⚠️ Botão de exportar ('exportPdfBtn' ou 'exportarPDF') não encontrado.");

    // Se estamos na tela do Usuário (Aplicador)
    const isUsuario = !!document.getElementById("relatoriosContainer");

    // ===========================================
    // ====== LÓGICA DE DEFINIÇÃO DE FUNÇÕES ======
    // ===========================================

    // MANTIDA A SUA LÓGICA ORIGINAL PARA ADMIN
    function gerarPDFAdmin() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });

        const produtor = document.getElementById("produtorSelect")?.value || "Produtor não informado";
        const area = localStorage.getItem("areaSelecionadaNome") || "Área não informada";
        const tamanho = localStorage.getItem("areaSelecionadaTamanho") || "-";
        const dataPrevista = document.getElementById("dataAplicacao")?.value
            ? new Date(document.getElementById("dataAplicacao").value).toLocaleDateString("pt-BR")
            : "Não informada";

        const haPorTanque = document.getElementById("haPorTanqueInfo")?.innerText || "";
        const tanquesInfo = document.getElementById("tanquesInfo")?.innerText || "";
        const resultadoHTML = document.getElementById("resultadoInfo")?.innerText || "";
        const bombaPicada = document.getElementById("sobressalenteConteudo")?.innerText || "";

        if (!resultadoHTML) {
            alert("Gere as informações antes de exportar o PDF.");
            return;
        }

        let y = 60;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(18);
        doc.setTextColor(0, 100, 0);
        doc.text("RELATÓRIO DE PULVERIZAÇÃO - ADMIN", 300, y, { align: "center" });
        y += 25;

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Produtor: ${produtor}`, 50, y);
        y += 15;
        doc.text(`Área: ${area} (${tamanho} ha)`, 50, y);
        y += 15;
        doc.text(`Data prevista: ${dataPrevista}`, 50, y);
        y += 20;

        // Informações de aplicação
        doc.setFontSize(13);
        doc.setTextColor(0, 60, 120);
        doc.text("INFORMAÇÕES DE APLICAÇÃO", 50, y);
        y += 18;
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(haPorTanque, 50, y);
        y += 14;
        doc.text(tanquesInfo, 50, y);
        y += 20;

        // Resultados por produto
        doc.setFontSize(13);
        doc.setTextColor(0, 60, 120);
        doc.text("RESULTADOS POR PRODUTO", 50, y);
        y += 15;

        const linhas = resultadoHTML.split("\n").filter(l => l.trim());
        const dados = [];

        linhas.forEach(l => {
            const match = l.match(/🧪 (.+?): ([\d.,]+) (\w+) por tanque → ([\d.,]+) (\w+)/i);
            if (match) dados.push([match[1], `${match[2]} ${match[3]}`, `${match[4]} ${match[5]}`]);
        });

        if (dados.length > 0) {
            doc.autoTable({
                head: [["Produto", "Por Tanque", "Total na Área"]],
                body: dados,
                startY: y,
                theme: "grid",
                styles: { fontSize: 10, cellPadding: 4 },
                headStyles: { fillColor: [0, 100, 0], textColor: 255 },
                columnStyles: { 0: { halign: "left" } }
            });
            y = doc.lastAutoTable.finalY + 20;
        }

        // Bomba Picada
        if (bombaPicada.trim()) {
            doc.setFontSize(13);
            doc.setTextColor(0, 100, 0);
            doc.text("BOMBA PICADA", 50, y);
            y += 18;
            doc.setFontSize(11);
            doc.setTextColor(50, 50, 50);
            doc.text(doc.splitTextToSize(bombaPicada, 480), 50, y);
        }

        const nomeArquivo = `Relatorio_Admin_${produtor}_${area}.pdf`;
        doc.save(nomeArquivo);
    }

    // ===========================================
    // ====== LÓGICA DE INICIALIZAÇÃO E EVENTOS ======
    // ===========================================

    if (isUsuario) {
        // Lógica do APLICADOR (USUARIO.HTML)
        if (typeof window.html2pdf === "undefined") {
            console.error("Erro: A biblioteca html2pdf.js não foi carregada no usuario.html.");
            return;
        }

        exportBtn.addEventListener("click", () => {
            try {
                // Tenta exportar o próprio container dos relatórios
                const element = document.getElementById("relatoriosContainer");

                if (!element || element.children.length === 0) {
                    return alert("⚠️ Não há relatório ativo para exportar.");
                }

                const nomeArquivo = `Relatorio_Aplicador_${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`;

                // Configuração html2pdf
                const options = {
                    margin: 10,
                    filename: nomeArquivo,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: {
                        scale: 2,
                        // ESTA LINHA IGNORA QUALQUER ELEMENTO COM A CLASSE 'no-print'
                        ignoreElements: (element) => {
                            return element.classList.contains('no-print');
                        }
                    },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                };

                // Geração do PDF
                html2pdf().set(options).from(element).save()
                    .catch(err => {
                        console.error("Erro na execução do html2pdf:", err);
                        alert("⚠️ Ocorreu um erro na exportação. Verifique o Console (F12).");
                    });

            } catch (err) {
                console.error("Erro ao gerar PDF do Aplicador:", err);
                alert("⚠️ Ocorreu um erro ao gerar o PDF. Veja o console (F12).");
            }
        });

    } else {
        // Lógica do ADMIN (INDEX.HTML)

        // Carrega plugin jsPDF-AutoTable
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.1/jspdf.plugin.autotable.min.js";
        document.head.appendChild(script);
        await new Promise(resolve => (script.onload = resolve));

        // Usa a função definida acima
        exportBtn.addEventListener("click", gerarPDFAdmin);
    }
});