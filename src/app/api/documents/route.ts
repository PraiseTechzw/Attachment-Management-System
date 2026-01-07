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

    const documents = await prisma.document.findMany({
      where: {
        studentId: user.studentId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}
