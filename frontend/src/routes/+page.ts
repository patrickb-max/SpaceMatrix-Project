// frontend/src/routes/+page.ts
import { SERVICES, type Property } from '$lib';

/** @type {import('./$types').PageLoad} */
export async function load({ fetch, url }) {
  // Get the active filter type from the URL query params (e.g., /?type=office)
  const selectedType = url.searchParams.get('type') || 'all';
  
  // Build the request URL for the Property Microservice (:3001)
  const fetchUrl = selectedType === 'all'
    ? SERVICES.PROPERTY
    : `${SERVICES.PROPERTY}?propertyType=${selectedType}`;

  try {
    const res = await fetch(fetchUrl);
    if (!res.ok) throw new Error(`Property Service returned status ${res.status}`);
    
    const properties: Property[] = await res.json();

    return {
      properties: Array.isArray(properties) ? properties : [],
      selectedType
    };
  } catch (err) {
    console.error('Failed to load property catalog from microservice:', err);
    return {
      properties: [],
      selectedType,
      error: 'Unable to reach Property Microservice on Port 3001'
    };
  }
}