# Prompt: Resolver formulario de reseñas atascado en "Enviando"

## Contexto del problema

El formulario de reseñas en `src/components/ReviewsSection.tsx` tiene un problema donde al hacer clic en "Enviar", el texto queda como "Enviando..." indefinidamente y no se sabe si la reseña se guardó o no.

## Objetivo

1. **Diagnosticar** por qué el formulario se queda atascado
2. **Implementar** una solución robusta
3. **Verificar** que funciona correctamente

## Pasos a seguir

### Paso 1: Analizar el código actual

Leer el archivo `src/components/ReviewsSection.tsx` y buscar:
- La función `handleSubmit`
- Cómo se maneja el estado `submitting`
- Cómo se llama a Supabase para insertar la reseña
- Si hay manejo de errores adecuado

### Paso 2: Identificar el problema

El código actual probablemente tiene uno de estos problemas:
- Falta `try/catch/finally` para siempre resetear `submitting`
- La llamada a Supabase puede fallar silenciosamente
- No hay timeout o respuesta de red que nunca llega
- Error de tipos no manejado correctamente

### Paso 3: Implementar la solución

Reemplazar la función `handleSubmit` con esta versión robusta:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validar campos requeridos
  if (!name.trim() || !comment.trim()) {
    toast({ title: 'Completa todos los campos', variant: 'destructive' });
    return;
  }

  setSubmitting(true);
  
  try {
    // Insertar en Supabase
    const { error } = await supabase.from('reviews').insert({
      customer_name: name.trim(),
      rating,
      comment: comment.trim(),
    });

    if (error) {
      throw new Error(error.message);
    }

    // Éxito
    toast({ title: '¡Gracias por tu reseña! ⭐' });
    setName('');
    setRating(5);
    setComment('');
    fetchReviews();
    
  } catch (err) {
    // Manejar error - asegurar que siempre sea un Error
    const message = err instanceof Error ? err.message : 'Error al enviar la reseña';
    console.error('Error submitting review:', err);
    toast({ 
      title: 'Error al enviar', 
      description: message, 
      variant: 'destructive' 
    });
    
  } finally {
    // SIEMPRE ejecutar esto - resetea el estado
    setSubmitting(false);
  }
};
```

### Paso 4: Verificar que funciona

- Compilar sin errores: `npm run build`
- Los tests pasan: `npm test`
- Probar manualmente en el navegador

## Criterios de éxito

✅ El botón muestra "Enviando..." mientras procesa
✅ El botón vuelve a "Enviar reseña" después de completar (éxito o error)
✅ Si hay error, muestra mensaje de error claro
✅ Si hay éxito, muestra mensaje de confirmación
✅ Los campos del formulario se limpian después de éxito

## Notas adicionales

- El estado `submitting` debe disable el botón para evitar doble envío
- Usar try/catch/finally es mandatory para este tipo de operaciones async
- Siempre loguear errores a consola para debugging
- El toast debe tener variant 'destructive' para errores