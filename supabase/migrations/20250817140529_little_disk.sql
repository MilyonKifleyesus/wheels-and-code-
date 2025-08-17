/*
  # Create content_sections table and fix profiles policy recursion

  1. New Tables
    - `content_sections`
      - `id` (uuid, primary key)
      - `section_type` (text, not null)
      - `title` (text, not null) 
      - `visible` (boolean, default true)
      - `sort_order` (integer, default 0)
      - `content` (jsonb, default {})
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `content_sections` table
    - Add policies for public read access
    - Fix infinite recursion in profiles policies

  3. Data
    - Insert default content sections for website