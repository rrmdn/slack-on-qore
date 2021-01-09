// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from "next";
import { client } from "../../qoreContext";

export default async function register(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { email, password } = req.body;
  await client.project.axios.post(
    "/memberDefaultView/rows",
    { email, password, role: [process.env.PARTICIPANT_ROLE_ID] },
    { headers: { "x-api-key": process.env.PROJECT_API_KEY } }
  );
  return res.json({ ok: true });
}
