import type { NextApiRequest, NextApiResponse } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const filePath = join(process.cwd(), 'public', 'donation-embed.js');
    const fileContents = readFileSync(filePath, 'utf8');
    res.setHeader('Content-Type', 'application/javascript');
    res.status(200).send(fileContents);
  } catch (error) {
    console.error('Error reading JavaScript file:', error);
    res.status(500).json({ error: 'Failed to load the JavaScript file' });
  }
}