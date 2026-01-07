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

    const logs = await prisma.log.findMany({
      where: { studentId: user.studentId },
      select: { skills: true },
    });

    const skillsProgress = logs.reduce((acc, log) => {
      log.skills.forEach(skill => {
        acc[skill] = (acc[skill] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json(skillsProgress);
  } catch (error) {
    console.error('Failed fetching skills progress:', error);
    return NextResponse.json({ error: 'Failed to fetch skills progress' }, { status: 500 });
  }
}
