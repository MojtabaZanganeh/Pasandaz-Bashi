import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { comparePassword, generateToken } from '../../../../lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'نام کاربری و رمز عبور الزامی است' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Find user by username
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, password_hash, created_at')
      .eq('username', username.toLowerCase())
      .single();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'نام کاربری یا رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await comparePassword(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'نام کاربری یا رمز عبور اشتباه است' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken(user.id, user.username);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'خطای سرور' },
      { status: 500 }
    );
  }
}