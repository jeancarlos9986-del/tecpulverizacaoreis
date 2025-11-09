// auth.js - Lógica de Autenticação com Perfis para Múltiplos Usuários

const AUTH_TOKEN_KEY = "user_logged_in";
const USER_ROLE_KEY = "user_role";
const RESPONSAVEL_NOME_KEY = "responsavelNome"; // Chave para armazenar o nome do responsável

// 1. ESTRUTURA PARA MÚLTIPLOS USUÁRIOS
// Agora é um ARRAY, permitindo adicionar quantos logins você quiser.
const USER_CREDENTIALS = [
    // --- CADASTRO (Vai para index.html) ---
    {
        user: "cadastro",       // Login
        pass: "111",            // Senha
        role: "cadastro",       // Role (função)
        homepage: "index.html", // Página de destino
        name: "Jean Reis"       // Nome completo
    },
    // --- APLICADOR 1 (Maria Silva, vai para usuario.html) ---
    {
        user: "aplicador",      // Login
        pass: "222",            // Senha
        role: "aplicador",
        homepage: "usuario.html",
        name: "Maria Silva"
    },
    // --- NOVO LOGIN: APLICADOR 2 (João Santos, vai para usuario.html) ---
    {
        user: "douglas.alvim2",    // Login
        pass: "333",            // Senha
        role: "aplicador",
        homepage: "usuario.html",
        name: "Douglas Alvim"
    },
    {
        user: "douglas.alvim",    // Login
        pass: "333",            // Senha
        role: "cadastro",
        homepage: "index.html",
        name: "Douglas Alvim"
    },
    // --- NOVO LOGIN: ADMIN (Super Usuário, vai para index.html) ---
    {
        user: "admin",          // Login
        pass: "999",            // Senha
        role: "admin",
        homepage: "index.html",
        name: "Super Administrador"
    }
    // Adicione mais usuários aqui, seguindo a mesma estrutura!
];

/**
 * Tenta realizar o login, verificando todos os usuários no array.
 * Retorna a URL da página de destino ou false em caso de falha.
 */
function login(username, password) {
    let userProfile = null;

    // 2. LÓGICA DE BUSCA: Percorre todos os usuários no array
    userProfile = USER_CREDENTIALS.find(
        user => user.user === username && user.pass === password
    );

    if (userProfile) {
        // Simulação de login bem-sucedido
        localStorage.setItem(AUTH_TOKEN_KEY, "true");
        localStorage.setItem(USER_ROLE_KEY, userProfile.role);
        localStorage.setItem(RESPONSAVEL_NOME_KEY, userProfile.name); // Salva o nome do usuário

        return userProfile.homepage; // Retorna a string do nome da página (o destino)
    } else {
        return false;
    }
}

/**
 * Verifica se o usuário está logado.
 */
function isUserLoggedIn() {
    return localStorage.getItem(AUTH_TOKEN_KEY) === "true";
}

/**
 * Realiza o logout e redireciona para a página de login.
 */
function logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_ROLE_KEY);
    localStorage.removeItem(RESPONSAVEL_NOME_KEY);
    localStorage.removeItem("last_saved_report_id");

    window.location.href = "login.html";
}

// Expõe as funções globalmente
window.isUserLoggedIn = isUserLoggedIn;
window.logout = logout;
window.login = login;