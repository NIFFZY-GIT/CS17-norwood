import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const getDb = async () => {
    const client = await clientPromise;
    return client.db(process.env.DB_NAME);
};

// GET all vacancies
export async function GET() {
  try {
    const db = await getDb();
    const vacancies = await db.collection('vacancies').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(vacancies);
  } catch (error) {
    console.error("Error fetching vacancies:", error);
    return NextResponse.json({ message: 'Error fetching vacancies' }, { status: 500 });
  }
}

// POST a new vacancy
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, department, location, description, type, isActive } = body;

    if (!title || !department || !location || !description || !type) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newVacancy = {
      title,
      department,
      location,
      description,
      type,
      isActive: isActive ?? true,
      createdAt: new Date(),
    };

    const db = await getDb();
    const result = await db.collection('vacancies').insertOne(newVacancy);
    return NextResponse.json({ ...newVacancy, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error("Error creating vacancy:", error);
    return NextResponse.json({ message: 'Error creating vacancy' }, { status: 500 });
  }
}