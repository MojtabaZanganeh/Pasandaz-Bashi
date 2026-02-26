import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashPassword, generateToken } from '../../../../lib/auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, error: 'نام کاربری باید حداقل ۳ کاراکتر باشد' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'رمز عبور باید حداقل ۶ کاراکتر باشد' },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'این نام کاربری قبلاً استفاده شده است' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate UUID for new user
    const userId = generateUUID();

    // Create user in database
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: userId,
        username: username.toLowerCase(),
        password_hash: passwordHash,
      })
      .select('id, username, created_at')
      .single();

    if (insertError || !newUser) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { success: false, error: 'خطا در ایجاد کاربر' },
        { status: 500 }
      );
    }

    // Generate token
    const token = generateToken(newUser.id, newUser.username);

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          username: newUser.username,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
