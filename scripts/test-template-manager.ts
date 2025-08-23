import dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const testTemplateManager = async () => {
  console.log('🧪 Testing Template Manager...');

  console.log('Fetching templates...');
  const { data, error } = await supabase.from('templates').select('*');

  if (error) {
    console.error('❌ Error fetching templates:', error);
    process.exit(1);
  }

  console.log('✅ Successfully fetched templates:');
  console.log(data);

  if (data.length >= 0) { // Can be empty
      console.log('✅ Test Passed: Templates table is readable.');
  }
};

testTemplateManager();
