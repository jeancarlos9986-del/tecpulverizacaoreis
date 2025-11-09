// 🧩 Estrutura de dados — Produtores, Áreas e Pulverizadores
const produtoresData = [
  {
    nome: "João Silva",
    areas: [
      { nome: "Faz. Douradinho", tamanho: 120, imagem: "./Gemini_Generated_Image_c855tgc855tgc855.png" },
      { nome: "Faz. Beija-Flor", tamanho: 280, imagem: "./Gemini_Generated_Image_c855tgc855tgc855.png" },
      { nome: "Faz. Uberaba", tamanho: 189, imagem: "./Gemini_Generated_Image_c855tgc855tgc855.png" },
      { nome: "Sitio Primavera", tamanho: 65, imagem: "./Gemini_Generated_Image_c855tgc855tgc855.png" }
    ],
    pulverizadores: [
      { modelo: "Imperador 4000", capacidade: 4000 }
    ]
  },
  {
    nome: "Maria Oliveira",
    areas: [
      { nome: "Faz. Jatobá", tamanho: 420, imagem: "./Gemini_Generated_Image_c855tgc855tgc855.png" },
      { nome: "Chácara do Sol", tamanho: 18, imagem: "./Gemini_Generated_Image_c855tgc855tgc855.png" }
    ],
    pulverizadores: [
      { modelo: "Imperador 2500", capacidade: 2500 }

    ]
  },
  {
    nome: "Carlos Souza",
    areas: [
      { nome: "Faz. Paineiras", tamanho: 210, imagem: "./Gemini_Generated_Image_c855tgc855tgc855.png" },
      { nome: "Faz. Santa Maria", tamanho: 350, imagem: "./Gemini_Generated_Image_c855tgc855tgc855.png" }
    ],
    pulverizadores: [
      { modelo: "M4040", capacidade: 4000 }

    ]
  },
  {
    nome: "Fazenda Bela Vista",
    areas: [
      { nome: "Chácara Rio Verde", tamanho: 28, imagem: "./Gemini_Generated_Image_c855tgc855tgc855.png" },
      { nome: "Faz. São Jorge", tamanho: 155, imagem: "./Gemini_Generated_Image_c855tgc855tgc855.png" },
      { nome: "Sitio Esperança", tamanho: 45, imagem: "./Gemini_Generated_Image_c855tgc855tgc855.png" }
    ],
    pulverizadores: [

      { modelo: "Uniport 2530", capacidade: 2500 }
    ]
  },
  {
    nome: "Agropecuária Horizonte",
    areas: [
      { nome: "Faz. Horizonte Verde", tamanho: 380, imagem: "img/horizonte.jpg" },
      { nome: "Faz. Luz do Sol", tamanho: 250, imagem: "img/luzdosol.jpg" }
    ],
    pulverizadores: [
      { modelo: "Uniport 4530", capacidade: 4500 },

    ]
  },
  {
    nome: "Sítio Boa Esperança",
    areas: [
      { nome: "Sitio Esperança", tamanho: 45, imagem: "./Gemini_Generated_Image_c855tgc855tgc855.png" }
    ],
    pulverizadores: [

      { modelo: "M4030", capacidade: 3000 }
    ]
  }
];
// Exporta para que o relatorio-produtor-logic.js possa usar
window.produtoresData = produtoresData;

// 🔹 Bicos
const bicos = [
  { cor: "Azul", vazao: 40 },
  { cor: "Amarelo", vazao: 80 },
  { cor: "Verde", vazao: 100 },
  { cor: "Laranja", vazao: 120 },
  { cor: "Vermelho", vazao: 150 },
  { cor: "Branco", vazao: 200 }
];

// 🔹 Produtos com categoria
const produtosFicticios = [
  { nome: "Glifosato L", categoria: "herbicida" },
  { nome: "Glifosato kg", categoria: "herbicida" },
  { nome: "Atrazina kg", categoria: "herbicida" },
  { nome: "2,4-D L", categoria: "herbicida" },
  { nome: "Cletodim L", categoria: "herbicida" },
  { nome: "Azoxistrobina SC", categoria: "fungicida" },
  { nome: "Tebuconazole EC", categoria: "fungicida" },
  { nome: "Mancozeb kg", categoria: "fungicida" },
  { nome: "Bixafen SC", categoria: "fungicida" },
  { nome: "Clorantraniliprole SC", categoria: "inseticida" },
  { nome: "Imidacloprido FS", categoria: "inseticida" },
  { nome: "Clorpirifós EC", categoria: "inseticida" },
  { nome: "Boro TOP kg", categoria: "adjuvante" },
  { nome: "Óleo Vegetal L", categoria: "adjuvante" }
];

// VARIÁVEIS DE ESTADO GLOBAIS
let produtorSelecionado = null;
let areaSelecionada = null;
let pulverizadorSelecionado = null;
let vazaoSelecionada = null;

// ====================================================================
// ====== LISTENERS E LÓGICA DE INTERFACE ======
// ====================================================================

/**
 * Lógica principal de troca de produtor (Corrigido: Garante que o objeto produtorSelecionado seja salvo).
 * @param {Event} e Evento de mudança.
 */
function handleProdutorChange(e) {
  const nome = e.target.value;
  // **CORREÇÃO CRÍTICA:** Garante que a variável global receba o objeto completo.
  produtorSelecionado = produtoresData.find(p => p.nome === nome) || null;

  // 2. Lógica existente para preencher a tela principal (MANTIDA)
  const produtorInfo = document.getElementById("produtorInfo");
  const areaSelect = document.getElementById("areaSelect");
  const pulverizadorSelect = document.getElementById("pulverizadorSelect");
  const bicoSection = document.getElementById("bicoSection");
  const produtoSection = document.getElementById("produtoSection");

  // Limpa o estado anterior
  areaSelecionada = null;
  pulverizadorSelecionado = null;
  vazaoSelecionada = null;

  produtorInfo.textContent = nome ? `Produtor: ${nome}` : "";
  produtorInfo.classList.toggle("d-none", !nome);

  areaSelect.innerHTML = "<option selected disabled>Selecione a área...</option>";
  if (produtorSelecionado) {
    produtorSelecionado.areas.forEach(a => areaSelect.insertAdjacentHTML("beforeend", `<option>${a.nome}</option>`));
  }

  pulverizadorSelect.innerHTML = "<option selected disabled>Selecione o pulverizador...</option>";
  if (produtorSelecionado) {
    produtorSelecionado.pulverizadores.forEach(p => pulverizadorSelect.insertAdjacentHTML("beforeend", `<option>${p.modelo}</option>`));
  }

  // Limpa campos e resultados
  document.getElementById("areaInfo").classList.add("d-none");
  document.getElementById("pulverizadorInfo").classList.add("d-none");
  bicoSection.classList.add("d-none");
  produtoSection.classList.add("d-none");
  document.getElementById("resultadoInfo").classList.add("d-none");
  document.getElementById("haPorTanqueInfo").classList.add("d-none");
  document.getElementById("tanquesInfo").classList.add("d-none");
  document.getElementById("campoSobressalente").classList.add("d-none");
}


// ====================================================================
// ====== FUNÇÕES AUXILIARES DE CÁLCULO (MANTIDAS) ======
// ====================================================================

function mudarImagemFundo(imagem) {
  document.body.style.transition = "background-image 1s ease-in-out";
  document.body.style.backgroundImage = `url('${imagem}')`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundAttachment = "fixed";
}

function atualizarListaProdutos() {
  const categoria = document.getElementById("categoriaSelect").value;
  const produtoSelect = $("#produtoSelect");
  produtoSelect.empty().append('<option value="">Produto...</option>');
  produtosFicticios
    .filter(p => categoria === "todas" || p.categoria === categoria)
    .forEach(p => produtoSelect.append(new Option(p.nome, p.nome)));
}

function adicionarProduto(nomeProduto) {
  const produtosContainer = document.getElementById("produtosContainer");
  const produtoSelect = $("#produtoSelect");

  const wrapper = document.createElement("div");
  wrapper.className = "produto-item mb-3";
  const label = document.createElement("label");
  label.className = "fw-semibold mb-1";
  label.textContent = nomeProduto;
  const dosagemInput = document.createElement("input");
  dosagemInput.type = "number";
  dosagemInput.min = "0";
  dosagemInput.step = "0.01";
  dosagemInput.placeholder = "Dosagem (kg/L por ha)";
  dosagemInput.className = "form-control dosagemInput mt-2";
  const errorMsg = document.createElement("small");
  errorMsg.className = "erro-msg d-none text-danger";
  errorMsg.textContent = "Informe uma dosagem válida.";
  const removeBtn = document.createElement("button");
  removeBtn.className = "remove-btn";
  removeBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
  removeBtn.addEventListener("click", () => { wrapper.remove(); calcularTotal(); });
  dosagemInput.addEventListener("input", () => { errorMsg.classList.add("d-none"); calcularTotal(); });
  wrapper.append(label, dosagemInput, errorMsg, removeBtn);
  produtosContainer.appendChild(wrapper);
  produtoSelect.val("").trigger("change");
}

function calcularTotal() {
  const resultadoInfo = document.getElementById("resultadoInfo");
  const haPorTanqueDiv = document.getElementById("haPorTanqueInfo");
  const tanquesInfo = document.getElementById("tanquesInfo");
  const campoSobressalente = document.getElementById("campoSobressalente");
  const sobressalenteConteudo = document.getElementById("sobressalenteConteudo");
  const dataAplicacao = document.getElementById("dataAplicacao");

  campoSobressalente.classList.add("d-none");
  sobressalenteConteudo.innerHTML = "";

  if (!areaSelecionada || !pulverizadorSelecionado || !vazaoSelecionada) {
    resultadoInfo.innerHTML = "⚠️ Selecione todos os campos antes de continuar.";
    resultadoInfo.classList.remove("d-none");
    return;
  }

  const haPorTanque = pulverizadorSelecionado.capacidade / vazaoSelecionada;
  haPorTanqueDiv.textContent = `Vamos fazer ${haPorTanque.toFixed(2)} ha a cada tanque.`;
  haPorTanqueDiv.classList.remove("d-none");

  const tanquesNecessarios = areaSelecionada.tamanho / haPorTanque;
  tanquesInfo.textContent = `Cerca de ${tanquesNecessarios.toFixed(1)} tanques necessários para a área.`;
  tanquesInfo.classList.remove("d-none");

  const parteFracionaria = tanquesNecessarios % 1;
  const areaSobressalente = parteFracionaria * haPorTanque;
  const dataPrevista = dataAplicacao.value ? new Date(dataAplicacao.value).toLocaleDateString("pt-BR") : "Não informada";

  let resultadoTexto = `
        📅 <strong>Data prevista:</strong> ${dataPrevista}<br>
        🌱 Área: ${areaSelecionada.tamanho} ha<br>
        💧 Capacidade: ${pulverizadorSelecionado.capacidade} L<br>
        🌾 Vazão: ${vazaoSelecionada} L/ha<br><br>
        <strong>Resultados por produto:</strong><br>
    `;

  const produtos = document.querySelectorAll(".produto-item");
  let produtosValidos = 0;
  let sobressalenteTexto = "";

  // NOTA: Os dados necessários para salvar no BackendSimulado (resultados e sobressalente)
  // são calculados aqui, mas o BackendSimulado.montarRelatorioAPartirDoDOM() deve fazer
  // a captura final antes de salvar.

  produtos.forEach(item => {
    const produtoNome = item.querySelector("label").textContent;
    const dosagem = parseFloat(item.querySelector(".dosagemInput").value);
    const errorMsg = item.querySelector(".erro-msg");

    if (!produtoNome || isNaN(dosagem) || dosagem <= 0) {
      errorMsg.classList.remove("d-none");
      return;
    }

    produtosValidos++;
    let unidade = produtoNome.toLowerCase().endsWith(" l") ? "L" : "kg";

    const porTanque = dosagem * haPorTanque;
    const totalArea = porTanque * tanquesNecessarios;
    resultadoTexto += `🧪 ${produtoNome}: ${porTanque.toFixed(2)} ${unidade} por tanque → ${totalArea.toFixed(2)} ${unidade} total<br>`;

    if (parteFracionaria > 0) {
      const extraProduto = dosagem * areaSobressalente;
      sobressalenteTexto += `• ${produtoNome}: ${extraProduto.toFixed(2)} ${unidade}<br>`;
    }
  });

  if (produtosValidos === 0) {
    resultadoInfo.innerHTML = "⚠️ Adicione ao menos um produto com dosagem válida.";
    resultadoInfo.classList.remove("d-none");
    return;
  }

  resultadoInfo.innerHTML = resultadoTexto;
  resultadoInfo.classList.remove("d-none");

  if (parteFracionaria > 0) {
    campoSobressalente.classList.remove("d-none");
    sobressalenteConteudo.innerHTML = `
                🌾 Área sobressalente: ${areaSobressalente.toFixed(2)} ha<br>
                <strong>Produtos adicionais necessários:</strong><br>${sobressalenteTexto}
                `;
  }
}

// ====================================================================
// ====== DOMContentLoaded (Inicialização) ======
// ====================================================================

document.addEventListener("DOMContentLoaded", () => {
  const produtorSelect = document.getElementById("produtorSelect");
  const areaSelect = document.getElementById("areaSelect");
  const pulverizadorSelect = document.getElementById("pulverizadorSelect");
  const bicoSelect = document.getElementById("bicoSelect");
  const categoriaSelect = document.getElementById("categoriaSelect");
  const produtoSelect = $("#produtoSelect");
  const dataAplicacao = document.getElementById("dataAplicacao");

  produtoSelect.select2({
    placeholder: "Buscar produto...",
    allowClear: true,
    width: "100%"
  });

  // 1. Preenche a lista de produtores
  produtorSelect.innerHTML = "<option selected disabled>Selecione o produtor...</option>";
  produtoresData.forEach(p => produtorSelect.insertAdjacentHTML("beforeend", `<option>${p.nome}</option>`));

  // 2. LISTENERS

  // Listener unificado para Produtor
  produtorSelect.addEventListener("change", handleProdutorChange);

  areaSelect.addEventListener("change", e => {
    areaSelecionada = produtorSelecionado?.areas.find(a => a.nome === e.target.value);
    if (!areaSelecionada) return;

    mudarImagemFundo(areaSelecionada.imagem);
    document.getElementById("areaInfo").textContent = `A ${areaSelecionada.nome} possui ${areaSelecionada.tamanho} hectares.`;
    document.getElementById("areaInfo").classList.remove("d-none");

    localStorage.setItem("areaSelecionadaNome", areaSelecionada.nome);
    localStorage.setItem("areaSelecionadaTamanho", areaSelecionada.tamanho);

    calcularTotal();
  });

  pulverizadorSelect.addEventListener("change", e => {
    pulverizadorSelecionado = produtorSelecionado?.pulverizadores.find(p => p.modelo === e.target.value);
    if (!pulverizadorSelecionado) return;

    document.getElementById("pulverizadorInfo").textContent =
      `${pulverizadorSelecionado.modelo} possui capacidade de ${pulverizadorSelecionado.capacidade} L.`;
    document.getElementById("pulverizadorInfo").classList.remove("d-none");

    bicoSelect.innerHTML = "<option selected disabled>Selecione a vazão...</option>";
    bicos.forEach(b => bicoSelect.insertAdjacentHTML("beforeend", `<option value="${b.vazao}">${b.cor} (${b.vazao} L/ha)</option>`));

    document.getElementById("bicoSection").classList.remove("d-none");
    calcularTotal();
  });

  bicoSelect.addEventListener("change", e => {
    vazaoSelecionada = parseFloat(e.target.value);
    document.getElementById("bicoInfo").textContent = `Vazão de ${vazaoSelecionada} L/ha.`;
    document.getElementById("bicoInfo").classList.remove("d-none");
    document.getElementById("produtoSection").classList.remove("d-none");
    calcularTotal();
  });

  categoriaSelect.addEventListener("change", atualizarListaProdutos);
  atualizarListaProdutos();

  const produtosContainer = document.getElementById("produtosContainer");
  produtoSelect.on("select2:select", function (e) {
    const produtoSelecionado = e.params.data.text;
    const existente = Array.from(produtosContainer.querySelectorAll("label")).some(lbl => lbl.textContent === produtoSelecionado);
    if (existente) {
      alert("⚠️ Este produto já foi adicionado!");
      produtoSelect.val("").trigger("change");
      return;
    }
    adicionarProduto(produtoSelecionado);
  });

  dataAplicacao.addEventListener("change", calcularTotal);
});

// 🔹 Estilo erro (mantido)
const style = document.createElement("style");
style.textContent = `
.erro-msg {
    font-size: 0.8rem;
    margin-top: 4px;
    color: #dc3545;
}
.select2-container--default .select2-selection--single {
    height: 38px;
    border: 1px solid #ced4da;
    border-radius: 6px;
    padding: 4px 8px;
}
.remove-btn {
    background: none;
    border: none;
    color: #dc3545;
    position: absolute;
    right: 0;
    top: 5px;
    cursor: pointer;
    font-size: 1.1rem;
}
.produto-item {
    position: relative;
    padding-right: 35px; /* Espaço para o botão de lixeira */
}
`;
document.head.appendChild(style);

// ==============================
// 🔹 Alteração em mudarImagemFundo para salvar a imagem no localStorage
// ==============================
function mudarImagemFundo(imagem) {
  document.body.style.transition = "background-image 1s ease-in-out";
  document.body.style.backgroundImage = `url('${imagem}')`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundAttachment = "fixed";

  // Salva a imagem no localStorage
  localStorage.setItem("ultimaImagemFundo", imagem);

  // Atualiza a imagem no usuário
  mostrarImagemUsuario();
}
