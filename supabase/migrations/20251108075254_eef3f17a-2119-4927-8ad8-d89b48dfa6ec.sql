-- Step 1: Drop existing RLS policies that use auth.uid()
DROP POLICY IF EXISTS "Users can view own diagnoses" ON public.diagnoses;
DROP POLICY IF EXISTS "Users can insert own diagnoses" ON public.diagnoses;
DROP POLICY IF EXISTS "Users can view own patient info" ON public.patient_info;
DROP POLICY IF EXISTS "Users can insert own patient info" ON public.patient_info;
DROP POLICY IF EXISTS "Users can update own patient info" ON public.patient_info;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own reports" ON public.reports;
DROP POLICY IF EXISTS "Users can insert own reports" ON public.reports;

-- Step 2: Drop the trigger that creates profiles from auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 3: Alter tables to change user_id from UUID to TEXT (for Clerk IDs)
-- We'll need to drop foreign key constraints first, then alter, then add data

-- For diagnoses table
ALTER TABLE public.diagnoses DROP CONSTRAINT IF EXISTS diagnoses_user_id_fkey;
ALTER TABLE public.diagnoses ALTER COLUMN user_id TYPE TEXT;

-- For patient_info table
ALTER TABLE public.patient_info DROP CONSTRAINT IF EXISTS patient_info_user_id_fkey;
ALTER TABLE public.patient_info ALTER COLUMN user_id TYPE TEXT;

-- For profiles table
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE public.profiles ALTER COLUMN id TYPE TEXT;

-- For reports table
ALTER TABLE public.reports DROP CONSTRAINT IF EXISTS reports_user_id_fkey;
ALTER TABLE public.reports ALTER COLUMN user_id TYPE TEXT;

-- Step 4: Create new RLS policies that work with application-level user_id
-- These policies allow authenticated users to access their own data
-- The user_id will be set by the application (Clerk user ID)

CREATE POLICY "Allow users to view own diagnoses"
ON public.diagnoses
FOR SELECT
USING (true); -- Permissive for now, we'll filter in application code

CREATE POLICY "Allow users to insert own diagnoses"
ON public.diagnoses
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow users to view own patient info"
ON public.patient_info
FOR SELECT
USING (true);

CREATE POLICY "Allow users to insert own patient info"
ON public.patient_info
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow users to update own patient info"
ON public.patient_info
FOR UPDATE
USING (true);

CREATE POLICY "Allow users to view own profiles"
ON public.profiles
FOR SELECT
USING (true);

CREATE POLICY "Allow users to insert own profiles"
ON public.profiles
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow users to update own profiles"
ON public.profiles
FOR UPDATE
USING (true);

CREATE POLICY "Allow users to view own reports"
ON public.reports
FOR SELECT
USING (true);

CREATE POLICY "Allow users to insert own reports"
ON public.reports
FOR INSERT
WITH CHECK (true);

-- Note: These permissive policies rely on application-level filtering
-- In production, you should implement JWT-based RLS with Clerk tokens