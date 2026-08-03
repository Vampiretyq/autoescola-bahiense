// Configuração de conexão com o banco de dados (Supabase)
// A ANON_KEY é pública por design — pode ficar exposta no código do site.
// NUNCA coloque a "service_role key" aqui.
const SUPABASE_URL = 'https://ocziffpwtokrfsekwhef.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jemlmZnB3dG9rcmZzZWt3aGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3MDM3NjIsImV4cCI6MjEwMTI3OTc2Mn0.IiilafI1c7vSFkE3yqzOOk0Gx1lICY7-_s7HYnzC6yc';

// Código de acesso do painel admin — usado tanto na tela de login quanto nas
// chamadas ao banco, que agora exigem esse código pra ler ou alterar dados.
const ADMIN_CODE = 'bahiense2026';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
