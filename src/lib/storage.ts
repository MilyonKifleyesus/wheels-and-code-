import { supabase } from './supabase';

export const uploadImage = async (file: File): Promise<string> => {
  if (!supabase) {
    throw new Error("Supabase client is not available.");
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `hero-images/${fileName}`;

  console.log(`Uploading image to: ${filePath}`);

  const { error: uploadError } = await supabase.storage
    .from('public-images') // Assumes a bucket named 'public-images' exists
    .upload(filePath, file);

  if (uploadError) {
    console.error("Error uploading image:", uploadError);
    throw uploadError;
  }

  console.log("Image uploaded successfully. Getting public URL...");

  const { data } = supabase.storage
    .from('public-images')
    .getPublicUrl(filePath);

  if (!data || !data.publicUrl) {
    throw new Error("Could not get public URL for uploaded image.");
  }

  console.log("Public URL:", data.publicUrl);
  return data.publicUrl;
};
