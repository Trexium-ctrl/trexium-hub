import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mlmnqkgolophpgnogeeb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ZTEpSnpyGF3gPhVj2U4M7A_zPW69wMg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tableMap = {
  Lead: 'leads',
  Customer: 'customers',
  Project: 'projects',
  Payment: 'payments',
  Task: 'tasks',
  CalendarEvent: 'calendar_events',
  Questionnaire: 'questionnaires',
  ClientFile: 'client_files',
};

function createEntityHandler(tableName) {
  return {
    async list(sort, limit, skip) {
      let q = supabase.from(tableName).select('*');
      if (sort) {
        const desc = sort.startsWith('-');
        const field = desc ? sort.slice(1) : sort;
        q = q.order(field, { ascending: !desc });
      }
      if (limit) q = q.limit(limit);
      if (skip) q = q.range(skip, skip + (limit || 200) - 1);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    async filter(queryObj, sort, limit, skip) {
      let q = supabase.from(tableName).select('*');
      if (queryObj) {
        for (const [key, value] of Object.entries(queryObj)) {
          q = q.eq(key, value);
        }
      }
      if (sort) {
        const desc = sort.startsWith('-');
        const field = desc ? sort.slice(1) : sort;
        q = q.order(field, { ascending: !desc });
      }
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
    async get(id) {
      const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    async create(recordData) {
      const { data: { user } } = await supabase.auth.getUser();
      const payload = { ...recordData };
      if (user) payload.created_by_id = user.email;
      const { data, error } = await supabase.from(tableName).insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    async update(id, recordData) {
      const { data, error } = await supabase.from(tableName).update(recordData).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    async delete(id) {
      const { error } = await supabase.from(tableName).delete().eq('id', id);
      if (error) throw error;
    },
  };
}

const entitiesProxy = new Proxy({}, {
  get(_, entityName) {
    if (typeof entityName !== 'string' || entityName.startsWith('_') || entityName === 'then') return undefined;
    const tableName = tableMap[entityName];
    if (!tableName) return undefined;
    return createEntityHandler(tableName);
  },
});

async function uploadFile({ file }) {
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('files').upload(fileName, file);
  if (error) throw error;
  const { data } = supabase.storage.from('files').getPublicUrl(fileName);
  return { file_url: data.publicUrl };
}

export const base44 = {
  entities: entitiesProxy,
  auth: {
    async me() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      return { id: user.id, email: user.email, full_name: user.user_metadata?.full_name || user.email };
    },
    async isAuthenticated() {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session;
    },
    async logout(redirectUrl) {
      await supabase.auth.signOut();
      if (redirectUrl) window.location.href = redirectUrl;
    },
    async redirectToLogin() {
      window.location.href = '/login';
    },
  },
  integrations: {
    Core: { UploadFile: uploadFile },
  },
};