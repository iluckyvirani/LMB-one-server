// GET /api/delivery/check?pincode=XXXXXX — public. Validates the pincode is a real Indian
// postal code and resolves its city/state via the public India Post lookup API.
export async function checkPincode(req, res) {
  const { pincode } = req.query;
  if (!/^\d{6}$/.test(pincode ?? "")) {
    return res.status(400).json({ error: "Enter a valid 6-digit pincode" });
  }

  let upstream;
  try {
    upstream = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
  } catch {
    return res.status(502).json({ error: "Could not verify pincode right now" });
  }
  if (!upstream.ok) {
    return res.status(502).json({ error: "Could not verify pincode right now" });
  }

  const data = await upstream.json();
  const result = data?.[0];
  if (result?.Status !== "Success" || !result.PostOffice?.length) {
    return res.json({ serviceable: false });
  }

  const po = result.PostOffice[0];
  res.json({ serviceable: true, city: po.District, state: po.State });
}
