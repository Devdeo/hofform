import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  success: boolean;
  message?: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }

  const correctPassword = process.env.FORM_PASSWORD;

  if (!correctPassword) {
    return res.status(500).json({ success: false, message: 'Server configuration error' });
  }

  if (password === correctPassword) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    res.setHeader(
      'Set-Cookie',
      `form_authenticated=true; Path=/; Expires=${expiryDate.toUTCString()}; HttpOnly; Secure; SameSite=Strict`
    );
    
    return res.status(200).json({ success: true });
  } else {
    return res.status(401).json({ success: false, message: 'Incorrect password' });
  }
}
