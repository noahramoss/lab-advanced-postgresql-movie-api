# Reflexión: PostgreSQL Avanzado

### 1. ¿Cuándo es contraproducente crear un índice?
Es contraproducente en tablas con un alto volumen de escrituras (INSERT, UPDATE, DELETE), ya que cada modificación obliga al motor a actualizar el índice, aumentando la latencia. También en tablas muy pequeñas o columnas con baja cardinalidad donde el escaneo secuencial es más eficiente.

### 2. ¿Qué diferencia hay entre RANK() y DENSE_RANK()?
`RANK()` asigna el mismo número a valores iguales pero deja huecos en la secuencia posterior (ej: 1, 2, 2, 4), mientras que `DENSE_RANK()` no deja huecos (ej: 1, 2, 2, 3). Con tus datos, si dos películas empatan en el primer puesto con nota 9.0, la siguiente película sería puesto 3 con `RANK()` y puesto 2 con `DENSE_RANK()`.

### 3. ¿Por qué el trigger usa AFTER INSERT OR UPDATE OR DELETE en lugar de BEFORE?
Se utiliza `AFTER` porque el objetivo es la auditoría; solo queremos registrar cambios que ya han sido validados y aplicados con éxito en la base de datos. Usar `BEFORE` podría registrar acciones que finalmente no se completen debido a errores o violaciones de restricciones posteriores.