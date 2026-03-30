require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testFeedback() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('--- TESTING STORAGE BUCKET ---');
  const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
  
  if (bucketError) {
    console.error('Failed to list buckets:', bucketError);
  } else {
    console.log('Available buckets:', buckets.map(b => b.name));
    if (!buckets.find(b => b.name === 'feedback-images')) {
      console.error('❌ FATAL: feedback-images bucket DOES NOT EXIST! Uploads will fail.');
    } else {
      console.log('✅ feedback-images bucket exists!');
    }
  }

  console.log('\n--- TESTING DATABASE FEEDBACKS ---');
  const { data: feedback, error: fbError } = await supabase
    .from('user_feedback')
    .select('id, content, image_url, created_at')
    .order('created_at', { ascending: false })
    .limit(3);

  if (fbError) {
    console.error('Failed to fetch feedback:', fbError);
  } else {
    console.log('Latest 3 feedbacks:');
    feedback.forEach(f => {
      console.log(`- Date: ${new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(f.created_at))}`);
      console.log(`- RAW DATE VALUE: ${f.created_at}`);
      console.log(`- Content length: ${f.content.length}`);
      console.log(`- Image URL field:`, f.image_url);
      console.log('---');
    });
  }
}

testFeedback();
