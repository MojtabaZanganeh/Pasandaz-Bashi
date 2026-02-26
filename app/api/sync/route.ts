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

// Sync pending savings to Supabase
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
    const { savings } = body as {
      savings: Saving[];
    };

    const supabase = getSupabaseClient();

    // فقط savings جدید را اضافه کن
    if (savings && savings.length > 0) {
      const savingsData = savings.map((saving) => ({
        user_id: user.userId,
        amount: saving.amount,
        hours: saving.hours,
        month: saving.month,
      }));

      const { error: savingsError } = await supabase
        .from('savings')
        .insert(savingsData);

      if (savingsError) {
        console.error('Error syncing savings:', savingsError);
        return NextResponse.json(
          { success: false, error: `خطا در ذخیره: ${savingsError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { success: false, error: 'خطای سرور' },
      { status: 500 }
    );
  }
}

// Load savings from Supabase
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'لطفاً وارد شوید' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();

    // Get savings only
    const { data: savingsData, error: savingsError } = await supabase
      .from('savings')
      .select('*')
      .eq('user_id', user.userId);

    if (savingsError) {
      console.error('Error loading savings:', savingsError);
    }

    // Transform data
    const savings: Saving[] = (savingsData || []).map((item) => ({
      id: item.id,
      amount: Number(item.amount),
      hours: Number(item.hours),
      month: item.month,
      createdAt: item.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: { savings },
    });
  } catch (error) {
    console.error('Load data error:', error);
    return NextResponse.json(
      { success: false, error: 'خطای سرور' },
      { status: 500 }
    );
  }
}
