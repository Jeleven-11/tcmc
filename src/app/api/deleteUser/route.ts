import { FieldPacket, ResultSetHeader } from 'mysql2';
import db from '../../lib/db'; // Adjust this path as needed
import { NextApiRequest, NextApiResponse } from 'next';
import { ParsedUrlQuery } from 'querystring';

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
  if (req.method === 'DELETE') {
    const { id } = req.query as ParsedUrlQuery; // Type cast for query params

    if (!id || typeof id !== 'string') {  // Ensure `id` is a string
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      // Get the result and metadata
      const [result]: [ResultSetHeader, FieldPacket[]] = await db.query('DELETE FROM users WHERE user_id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.setHeader('Allow', ['DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}