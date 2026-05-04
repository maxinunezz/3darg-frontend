import { useState, useEffect } from 'react';
import { BrandType } from '@/types/brands'; // Asegúrate de crear este archivo o mover el tipo ahí

export function useGetBrands() {
    // La URL apunta a tu backend de Django. 
    // Nota: Agregamos el '/' al final porque Django es estricto con los trailing slashes.
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/brands/`;
    
    const [result, setResult] = useState<BrandType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                setLoading(true);
                const response = await fetch(url);
                
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: No se pudo conectar con el servidor`);
                }

                const json = await response.json();

                // Lógica de "Des-Strapi-ficación":
                // Django DRF devuelve el array directo o dentro de 'results' si usas paginación.
                const data = json.results || json;
                
                setResult(Array.isArray(data) ? data : []);
            } catch (err: any) {
                setError(err.message || 'Ocurrió un error inesperado');
            } finally {
                setLoading(false);
            }
        };

        if (process.env.NEXT_PUBLIC_BACKEND_URL) {
            fetchBrands();
        } else {
            setError('La variable NEXT_PUBLIC_BACKEND_URL no está definida');
            setLoading(false);
        }
    }, [url]);

    return { result, loading, error };
}