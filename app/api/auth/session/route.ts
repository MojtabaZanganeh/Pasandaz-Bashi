import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../../lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ success: false, authenticated: false });
    }

    // Get user profile
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    return NextResponse.json({
      success: true,
      authenticated: true,
      data: {
        user: userData || {
          id: session.user.id,
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
          email: session.user.email,
        },
        session,
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { success: false, error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
