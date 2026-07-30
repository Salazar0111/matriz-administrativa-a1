// api/matriz.js
// Reemplaza a window.storage: guarda y lee la matriz compartida en Vercel KV.
// GET  -> devuelve { value } con el JSON de la matriz (o null si no existe todavía)
// POST -> recibe { value } y lo guarda

import { kv } from '@vercel/kv';

const CLAVE = 'matriz-suplencias-compartida-v1';

export default async function handler(req, res) {
  // Autorización simple por clave compartida (ver variable de entorno MATRIZ_CLAVE_ACCESO)
  const clave = req.headers['x-clave-acceso'] || '';
  if (process.env.MATRIZ_CLAVE_ACCESO && clave !== process.env.MATRIZ_CLAVE_ACCESO) {
    return res.status(401).json({ error: 'Clave de acceso incorrecta' });
  }

  if (req.method === 'GET') {
    try {
      const value = await kv.get(CLAVE);
      return res.status(200).json({ value: value || null });
    } catch (e) {
      return res.status(500).json({ error: 'No se pudo leer la matriz' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { value } = req.body || {};
      if (typeof value !== 'string') {
        return res.status(400).json({ error: 'Falta el campo value (string JSON)' });
      }
      await kv.set(CLAVE, value);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'No se pudo guardar la matriz' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Método no permitido');
}
