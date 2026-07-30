// api/matriz.js
// Reemplaza a window.storage: guarda y lee la matriz compartida.
// Usa Upstash Redis (el reemplazo actual de "Vercel KV", que Vercel descontinuó).
// GET  -> devuelve { value } con el JSON de la matriz (o null si no existe todavía)
// POST -> recibe { value } y lo guarda

import { Redis } from '@upstash/redis';

// La integración de Upstash en Vercel puede nombrar las variables de dos formas
// según cómo se instaló — aceptamos ambas para no depender de cuál te tocó.
const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

const CLAVE = 'matriz-suplencias-compartida-v1';

export default async function handler(req, res) {
  // Autorización simple por clave compartida (ver variable de entorno MATRIZ_CLAVE_ACCESO)
  const clave = req.headers['x-clave-acceso'] || '';
  if (process.env.MATRIZ_CLAVE_ACCESO && clave !== process.env.MATRIZ_CLAVE_ACCESO) {
    return res.status(401).json({ error: 'Clave de acceso incorrecta' });
  }

  if (!redis) {
    return res.status(500).json({
      error: 'La base de datos (Upstash Redis) no está conectada a este proyecto todavía.'
    });
  }

  if (req.method === 'GET') {
    try {
      const value = await redis.get(CLAVE);
      // OJO: el cliente de Upstash deserializa el JSON por su cuenta, así que aquí `value`
      // suele llegar ya como arreglo, no como texto. El navegador espera texto y le hace
      // JSON.parse — si le mandamos el arreglo, revienta y la app cree que no hay servidor.
      // Devolvemos siempre texto, venga como venga.
      const texto = value == null ? null : (typeof value === 'string' ? value : JSON.stringify(value));
      return res.status(200).json({ value: texto });
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
      await redis.set(CLAVE, value);
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'No se pudo guardar la matriz' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end('Método no permitido');
}
