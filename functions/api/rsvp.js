const JSON_HEADERS = { 'content-type': 'application/json; charset=UTF-8' };

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return json({ error: 'Expected JSON request.' }, 415);
    }

    const body = await request.json();
    if (body.website) return json({ ok: true, stored: false });

    const name = clean(body.name, 100);
    const email = clean(body.email, 120);
    const phone = clean(body.phone, 40);
    const attendance = clean(body.attendance, 8);
    const meal = clean(body.meal, 30);
    const message = clean(body.message, 500);
    const guests = Math.min(10, Math.max(1, Number(body.guests || 1)));

    if (!name || !['yes', 'no'].includes(attendance)) {
      return json({ error: 'Name and attendance are required.' }, 400);
    }

    // If DB is not connected yet, keep the website usable in demo mode.
    if (!env.DB) {
      return json({ ok: true, stored: false, mode: 'demo' });
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await env.DB.prepare(`
      INSERT INTO rsvps (id, name, email, phone, attendance, guests, meal, message, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(id, name, email, phone, attendance, guests, meal, message, createdAt).run();

    return json({ ok: true, stored: true, id });
  } catch (error) {
    console.error('RSVP error', error);
    return json({ error: 'Unable to save RSVP.' }, 500);
  }
}

export function onRequestOptions() {
  return new Response(null, { status: 204 });
}

function clean(value, max) {
  return String(value ?? '').trim().slice(0, max);
}

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), { status, headers: JSON_HEADERS });
}
