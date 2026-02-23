import React from 'react';
import SignIn from './sign-in';
import SignUp from './sign-up';
import ForgotPassword from './forgot-password';
import ResetPassword from './reset-password';

export default async function AuthPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const params = await searchParams;
  const view = params?.view || 'sign-in';

  return (
    <>
      {view === 'sign-in' && <SignIn />}
      {view === 'sign-up' && <SignUp />}
      {view === 'forgot-password' && <ForgotPassword />}
      {view === 'reset-password' && <ResetPassword />}
    </>
  );
}
