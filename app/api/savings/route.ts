import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyToken } from '../../../lib/auth';
import type { Saving } from '../../../types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getSupabaseClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getUserFromRequest(request: NextRequest): { userId: string; username: string } | null {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  if (!token) return null;
  return verifyToken(token);
}

// GET all savings for authenticated user
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'لطفاً وارد شوید' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');

    const supabase = getSupabaseClient();

    let query = supabase
      .from('savings')
      .select('*')
      .eq('user_id', user.userId)
      .order('created_at', { ascending: false });

    if (month) {
      query = query.eq('month', month);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    const savings: Saving[] = (data || []).map((item) => ({
      id: item.id,
      amount: Number(item.amount),
      hours: Number(item.hours),
      month: item.month,
      createdAt: item.created_at,
    }));

    return NextResponse.json({ success: true, data: savings });
  } catch (error) {
    console.error('Get savings error:', error);
    return NextResponse.json(
      { success: false, error: 'خطای سرور' },
      { status: 500 }
    );
  }
}

// POST create new saving
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'لطفاً وارد شوید' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { saving } = body as {
      saving: Omit<Saving, 'id' | 'createdAt'>;
    };

    if (!saving) {
      return NextResponse.json(
        { success: false, error: 'اطلاعات ناقص است' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('savings')
      .insert({
        user_id: user.userId,
        amount: saving.amount,
        hours: saving.hours,
        month: saving.month,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving to Supabase:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Create saving error:', error);
    return NextResponse.json(
      { success: false, error: 'خطای سرور' },
      { status: 500 }
    );
  }
}