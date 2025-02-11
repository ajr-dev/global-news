import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { csvParse } from 'd3-dsv';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'assets', 'countries.csv');
    const csvContent = await fs.readFile(filePath, 'utf8');

    if (!csvContent) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 500 });
    }

    const data = csvParse(csvContent);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error reading CSV file' }, { status: 500 });
  }
}