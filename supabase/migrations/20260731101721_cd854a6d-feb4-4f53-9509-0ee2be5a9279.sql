CREATE POLICY "Users manage own files insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users manage own files select" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users manage own files update" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users manage own files delete" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'study-materials' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Public material files readable" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'study-materials' AND EXISTS (
  SELECT 1 FROM public.materials m WHERE m.file_path = storage.objects.name AND m.visibility = 'public'
));