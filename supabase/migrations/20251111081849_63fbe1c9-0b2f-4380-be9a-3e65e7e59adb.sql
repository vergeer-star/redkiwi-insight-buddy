-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'employee');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is Redkiwi employee
CREATE OR REPLACE FUNCTION public.is_redkiwi_employee(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND email LIKE '%@redkiwi.nl'
  )
$$;

-- Trigger function to create profile and assign role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Assign 'employee' role if email is @redkiwi.nl
  IF NEW.email LIKE '%@redkiwi.nl' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'employee');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Update RLS policies for interviews
DROP POLICY IF EXISTS "Anyone can view interviews" ON public.interviews;
DROP POLICY IF EXISTS "Anyone can insert interviews" ON public.interviews;
DROP POLICY IF EXISTS "Anyone can update interviews" ON public.interviews;

CREATE POLICY "Redkiwi employees can view interviews"
  ON public.interviews
  FOR SELECT
  TO authenticated
  USING (public.is_redkiwi_employee(auth.uid()));

CREATE POLICY "Anonymous users can insert interviews"
  ON public.interviews
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "System can update interviews"
  ON public.interviews
  FOR UPDATE
  TO authenticated
  USING (true);

-- Update RLS policies for interview_messages
DROP POLICY IF EXISTS "Anyone can view interview messages" ON public.interview_messages;
DROP POLICY IF EXISTS "Anyone can insert interview messages" ON public.interview_messages;
DROP POLICY IF EXISTS "Anyone can update interview messages" ON public.interview_messages;

CREATE POLICY "Redkiwi employees can view messages"
  ON public.interview_messages
  FOR SELECT
  TO authenticated
  USING (public.is_redkiwi_employee(auth.uid()));

CREATE POLICY "Anonymous users can insert messages"
  ON public.interview_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "System can update messages"
  ON public.interview_messages
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();