import type { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  authenticated: boolean;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ authenticated: false });
  }

  const authCookie = req.cookies.form_authenticated;

  if (authCookie === 'true') {
    return res.status(200).json({ authenticated: true });
  } else {
    return res.status(200).json({ authenticated: false });
  }
}
