import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthFromRequest, findUserById } from '@/lib/auth';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const auth = getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await findUserById(auth.userId);
    if (!user || !user.studentId) {
      return NextResponse.json({ error: 'User not found or missing student ID' }, { status: 404 });
    }

    const logs = await prisma.logEntry.findMany({
      where: { studentId: user.studentId },
      orderBy: { createdAt: 'desc' },
      take: 50, // Fetch last 50 logs for the activity chart
    });

    // Process data to get daily log counts
    const activity = logs.reduce((acc, log) => {
      const date = log.date.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Failed fetching weekly activity:', error);
    return NextResponse.json({ error: 'Failed to fetch weekly activity' }, { status: 500 });
  }
}
