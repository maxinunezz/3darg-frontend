import { useState, useEffect } from 'react';

export function useGetCategories() {
    // En Django, solemos usar /api/categories/ (con la barra al final es buena práctica)
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/categories/`; 
    const [result, setResult] = useState<any[]>([]); // Inicializamos como array vacío
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        (async () => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: No se pudo obtener las categorías`);
                }
                const json = await response.json();
                
                // DRF devuelve el array directo o dentro de 'results' si hay paginación
                const data = json.results || json; 
                setResult(data);
            } catch (error: any) {
                setError(error.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        })();
    }, [url]);

    return { result, loading, error };
}