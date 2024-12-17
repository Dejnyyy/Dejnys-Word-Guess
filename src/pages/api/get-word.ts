import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const word = await prisma.word.findFirst({
    where: { value: { length: 5 } }, // Ensure it's a 5-letter word
    orderBy: { id: 'asc' }, // Randomize or order words
  });

  if (word) {
    res.status(200).json({ word: word.value });
  } else {
    res.status(404).json({ error: 'No word found' });
  }
}
