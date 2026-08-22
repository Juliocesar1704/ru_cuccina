/**
 * RU CUCCINA - Configuração e Conexão com Supabase
 *
 * Para conectar seu próprio banco Supabase:
 * 1. Crie um projeto gratuito em https://supabase.com
 * 2. Copie a URL do Projeto e a chave pública (anon key) em Project Settings -> API
 * 3. Cole nas constantes SUPABASE_URL e SUPABASE_ANON_KEY abaixo (ou configure pelo painel admin)
 */

const SUPABASE_CONFIG = {
  // Substitua com as credenciais do seu projeto Supabase:
  url: localStorage.getItem('ru_cuccina_supabase_url') || '',
  anonKey: localStorage.getItem('ru_cuccina_supabase_key') || ''
};

let supabaseClient = null;

// Inicialização do cliente Supabase
function initSupabase() {
  if (typeof window.supabase !== 'undefined' && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      console.log('✅ Supabase conectado com sucesso!');
      return supabaseClient;
    } catch (e) {
      console.warn('⚠️ Erro ao inicializar Supabase:', e);
      supabaseClient = null;
    }
  }
  return null;
}

// Salvar novas credenciais do Supabase
function updateSupabaseCredentials(url, key) {
  SUPABASE_CONFIG.url = url.trim();
  SUPABASE_CONFIG.anonKey = key.trim();
  localStorage.setItem('ru_cuccina_supabase_url', SUPABASE_CONFIG.url);
  localStorage.setItem('ru_cuccina_supabase_key', SUPABASE_CONFIG.anonKey);
  return initSupabase();
}
