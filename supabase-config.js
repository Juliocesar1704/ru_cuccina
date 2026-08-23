/**
 * RU CUCCINA - Configuração Automática do Banco de Dados Supabase
 */

const SUPABASE_CONFIG = {
  url: 'https://untnvfmxpikczfaymgpu.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVudG52Zm14cGlrY3pmYXltZ3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0NDg0MzQsImV4cCI6MjEwMzAyNDQzNH0.yFpgU9XZWQ0p1pPaVAQYsGEN-7koob7XB51yxbBVtHs'
};

let supabaseClient = null;

// Inicialização automática do cliente Supabase
function initSupabase() {
  if (typeof window.supabase !== 'undefined' && SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
    try {
      supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      console.log('✅ Supabase conectado automaticamente!');
      return supabaseClient;
    } catch (e) {
      console.warn('⚠️ Erro ao inicializar Supabase:', e);
      supabaseClient = null;
    }
  }
  return null;
}
