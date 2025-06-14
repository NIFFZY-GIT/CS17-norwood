import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const getDb = async () => {
    const client = await clientPromise;
    return client.db(process.env.DB_NAME);
};

// PUT (update) an existing vacancy
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PUT(req: NextRequest, { params }: any) {
  try {
    // We still safely access the 'id' as before.
    const id: string = params.id; 
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Valid Vacancy ID is required.' }, { status: 400 });
    }

    const body = await req.json();
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, createdAt, ...updateData } = body; 
    
    const db = await getDb();
    const result = await db.collection('vacancies').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Vacancy not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Vacancy updated successfully' });
  } catch (error) {
    console.error("Error updating vacancy:", error);
    return NextResponse.json({ message: 'Error updating vacancy' }, { status: 500 });
  }
}

// DELETE a vacancy
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(req: NextRequest, { params }: any) {
    try {
        const id: string = params.id;

        if (!id || !ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Valid Vacancy ID is required.' }, { status: 400 });
        }

        const db = await getDb();
        const result = await db.collection('vacancies').deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
            return NextResponse.json({ message: 'Vacancy not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Vacancy deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error("Error deleting vacancy:", error);
        return NextResponse.json({ message: 'Error deleting vacancy' }, { status: 500 });
    }
}